const bcrypt = require("bcrypt");
const permissionsService = require("./permissions")

module.exports = {

    getUsers: async function (dbCon) {
        const result = (await dbCon.request()
            .query('select * from usuarios')).recordset;
        return result;
    },

    getEmployeesFull: async function (dbCon) {

        const result = (await dbCon.query`
        select usuarios.*, indicadores.idIndicador as idIndicador,indicadores.nombre as nombreIndicador, 
        indicadores.idUnidad as idUnidadIndicador, unidades.nombre as nombreUnidad, unidades.idUnidad as idUnidad
        from usuarios 
        inner join roles on usuarios.idRol = roles.idRol
        left join  usuarios_unidades on usuarios.idUsuario = usuarios_unidades.idUsuario 
        left join  usuarios_indicadores on usuarios.idUsuario = usuarios_indicadores.idUsuario
        left join unidades on usuarios_unidades.idUnidad = unidades.idUnidad
        left join indicadores on usuarios_indicadores.idIndicador = indicadores.idIndicador
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
                users[element.idUsuario] = {
                    username: element.username,
                    nombre: element.nombre,
                    apellidos: element.apellidos,
                    indicadores: firstIndicator,
                    unidades: firstUnit,
                };
            } else {
                if (element.idIndicador && !users[element.idUsuario].indicadores.find(ind => ind.idIndicador === element.idIndicador)) {
                    users[element.idUsuario].indicadores.push({ 
                        idIndicador: element.idIndicador, 
                        nombreIndicador: element.nombreIndicador,
                        idUnidad: element.idUnidadIndicador,
                     })
                }
                if (element.nombreUnidad && users[element.idUsuario].unidades.find(und => und.nombreUnidad === element.nombreUnidad) === -1) {
                    users[element.idUsuario].unidades.push({
                        nombreUnidad: element.nombreUnidad,
                        idUnidad: element.idUnidad
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