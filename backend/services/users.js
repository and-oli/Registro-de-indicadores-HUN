const bcrypt = require("bcrypt");
const permissionsService = require("./permissions")
const moment = require("moment")

module.exports = {

    getUsers: async function (dbCon) {
        let result = (await dbCon.request()
            .query('select * from usuarios')).recordset;
        return result;
    },

    getEmployeesFull: async function (dbCon) {

        let result = (await dbCon.query`
        select usuarios.*, indicadores.idIndicador as idIndicador,indicadores.nombre as nombreIndicador, 
        indicadores.idUnidad as idUnidadIndicador, unidades.nombre as nombreUnidad, unidades.idUnidad as idUnidad
        ,x.nombreIndicadorDelAcceso, x.fechaInicioAccesoIndicador,x.fechaFinAccesoIndicador, idAcceso,
        x.nombreUnidadDelAccesoAlIndicador, x.idIndicadorDelAcceso
        from usuarios 
        inner join roles on usuarios.idRol = roles.idRol
        left join  usuarios_unidades on usuarios.idUsuario = usuarios_unidades.idUsuario 
        left join  usuarios_indicadores on usuarios.idUsuario = usuarios_indicadores.idUsuario
        left join unidades on usuarios_unidades.idUnidad = unidades.idUnidad
        left join indicadores on usuarios_indicadores.idIndicador = indicadores.idIndicador
        left join 
            (select  accesos.idUsuario as idUsuario, indicadores.nombre as nombreIndicadorDelAcceso, 
            indicadores.idIndicador as idIndicadorDelAcceso, ACCESOS.idAcceso,
            ACCESOS.fechaInicio as fechaInicioAccesoIndicador, ACCESOS.fechaFin as fechaFinAccesoIndicador, 
            UNIDADES.nombre as nombreUnidadDelAccesoAlIndicador
            from ACCESOS inner join indicadores on ACCESOS.idIndicador = INDICADORES.idIndicador 
            inner join UNIDADES on INDICADORES.idUnidad = UNIDADES.idUnidad
            ) as x 
        on x.idUsuario = USUARIOS.idUsuario
        where roles.nombre = 'EMPLEADO'
    `).recordset;
        let users = {}
        result.forEach(element => {
            if (!users[element.idUsuario]) {
                let firstIndicator = element.idIndicador ? [{
                    idIndicador: element.idIndicador,
                    nombreIndicador: element.nombreIndicador,
                    idUnidad: element.idUnidadIndicador,
                }] : [];

                let firstUnit = element.nombreUnidad ? [{
                    nombreUnidad: element.nombreUnidad,
                    idUnidad: element.idUnidad
                }] : [];
                let firstAccess = []
                if (element.idAcceso && accessHasValidDate(element)) {
                    firstAccess = [{
                        nombreIndicadorDelAcceso: element.nombreIndicadorDelAcceso,
                        nombreUnidadDelAccesoAlIndicador: element.nombreUnidadDelAccesoAlIndicador,
                        fechaInicioAccesoIndicador: element.fechaInicioAccesoIndicador,
                        fechaFinAccesoIndicador: element.fechaFinAccesoIndicador,
                        idAcceso: element.idAcceso,
                        idIndicadorDelAcceso: element.idIndicadorDelAcceso,
                    }];
                }

                users[element.idUsuario] = {
                    username: element.username,
                    nombre: element.nombre,
                    apellidos: element.apellidos,
                    indicadores: firstIndicator,
                    unidades: firstUnit,
                    accesos: firstAccess,
                };
            } else {
                if (element.idIndicador && !users[element.idUsuario].indicadores.findIndex(ind => ind.idIndicador === element.idIndicador)) {
                    users[element.idUsuario].indicadores.push({
                        idIndicador: element.idIndicador,
                        nombreIndicador: element.nombreIndicador,
                        idUnidad: element.idUnidadIndicador,
                    })
                }
                if (element.nombreUnidad && users[element.idUsuario].unidades.findIndex(und => und.nombreUnidad === element.nombreUnidad) === -1) {
                    users[element.idUsuario].unidades.push({
                        nombreUnidad: element.nombreUnidad,
                        idUnidad: element.idUnidad
                    })
                }
                if (element.idAcceso && users[element.idUsuario].accesos.findIndex(acc => acc.idAcceso === element.idAcceso) === -1 && accessHasValidDate(element)) {
                    users[element.idUsuario].accesos.push({
                        nombreIndicadorDelAcceso: element.nombreIndicadorDelAcceso,
                        nombreUnidadDelAccesoAlIndicador: element.nombreUnidadDelAccesoAlIndicador,
                        fechaInicioAccesoIndicador: element.fechaInicioAccesoIndicador,
                        fechaFinAccesoIndicador: element.fechaFinAccesoIndicador,
                        idAcceso: element.idAcceso,
                        idIndicadorDelAcceso: element.idIndicadorDelAcceso,
                    })
                }
            }
        });
        let employees = Object.keys(users).map(k => {
            users[k].idUsuario = k;
            return users[k];
        })
        return employees;

    },

    getUserByUsername: async function (dbCon, username) {
        const result = await dbCon.query`
            select USUARIOS.*, ROLES.nombre as rol from usuarios 
            inner join roles on usuarios.idRol = roles.idRol 
            where username = ${username}
        `;
        return result.recordset[0];
    },

    postUser: async function (dbCon, user) {
        user.password = await bcrypt.hash(user.password, 5)
        let { username, password, nombre, apellidos, idRol } = user;
        if (!idRol) {
            idRol = (await dbCon.query`select idRol from roles where nombre = 'EMPLEADO'`).recordset[0].idRol;
        }
        const result = await dbCon.query`
        insert into usuarios (username, password, nombre, apellidos, idRol)
        values (${username},${password},${nombre},${apellidos},${idRol});
        SELECT SCOPE_IDENTITY() AS idUsuario;`;
        let idUsuario = result.recordset[0].idUsuario
        if (idUsuario) {
            if (user.permissions) {
                let unitList = user.permissions.filter(p => p.idIndicador === -1)
                    .map(p => {
                        return { idUnidad: p.idUnidad, idUsuario }
                    })

                if (await permissionsService.addMultipleUserUnitPermissions(dbCon, unitList)) {
                    let indicatorList = user.permissions.filter(p => p.idIndicador !== -1)
                        .map(p => {
                            return { idIndicador: p.idIndicador, idUsuario }
                        })
                    return await permissionsService.addMultipleUserIndicatorPermissions(dbCon, indicatorList);
                }
                console.error("Ocurrió un error al crear los permisos del usuario")
                return false;
            }
            return true;
        } else {
            console.error("Ocurrió un error al agregar el usuario")
            return false
        }
    },
}

function accessHasValidDate(element) {
    const currentTime = new Date().getTime() // El servidor en heroku estará en la hora 0 GMT, Colombia está en -5GMT
    return moment(element.fechaInicioAccesoIndicador).valueOf() <= currentTime &&
        moment(element.fechaFinAccesoIndicador).valueOf() >= (currentTime - 24 * 3600 * 1000)
}