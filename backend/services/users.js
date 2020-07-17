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
        indicadores.idUnidad as idUnidadIndicador, indicadores.nombreUnidadDelIndicadorEdicion, unidades.nombre as nombreUnidad, unidades.idUnidad as idUnidad
        ,x.nombreIndicadorDelAcceso, x.fechaInicioAccesoIndicador,x.fechaFinAccesoIndicador, idAcceso,
        x.nombreUnidadDelAccesoAlIndicador, x.idIndicadorDelAcceso, 
        permisos_lectura.idIndicadorLectura as idIndicadorLectura, 
        permisos_lectura.nombreIndicadorLectura as nombreIndicadorLectura, 
        permisos_lectura.nombreUnidadLectura as nombreUnidadLectura,
		permisos_lectura.idUnidadLectura as idUnidadLectura,
		permisos_lectura.idUnidadIndicadorLectura as idUnidadIndicadorLectura,
		permisos_lectura.nombreUnidadDelIndicadorLectura as nombreUnidadDelIndicadorLectura
        from usuarios 
        inner join roles on usuarios.idRol = roles.idRol
        left join  usuarios_unidades on usuarios.idUsuario = usuarios_unidades.idUsuario 
        left join  usuarios_indicadores on usuarios.idUsuario = usuarios_indicadores.idUsuario
		left join unidades on usuarios_unidades.idUnidad = unidades.idUnidad
        left join (select INDICADORES.*, unidades.nombre as nombreUnidadDelIndicadorEdicion from indicadores inner join UNIDADES on INDICADORES.idUnidad = UNIDADES.idUnidad) as indicadores on usuarios_indicadores.idIndicador = indicadores.idIndicador

        left join 
            (select  accesos.idUsuario as idUsuario, indicadores.nombre as nombreIndicadorDelAcceso, 
            indicadores.idIndicador as idIndicadorDelAcceso, ACCESOS.idAcceso,
            ACCESOS.fechaInicio as fechaInicioAccesoIndicador, ACCESOS.fechaFin as fechaFinAccesoIndicador, 
            UNIDADES.nombre as nombreUnidadDelAccesoAlIndicador
            from ACCESOS inner join indicadores on ACCESOS.idIndicador = INDICADORES.idIndicador 
            left join UNIDADES on INDICADORES.idUnidad = UNIDADES.idUnidad
            ) as x 
        on x.idUsuario = USUARIOS.idUsuario
		left join 
            (select  usuarios.idUsuario as idUsuario, indicadores.nombre as nombreIndicadorLectura, 
			indicadores.idIndicador as idIndicadorLectura, indicadores.nombreUnidadDelIndicadorLectura, 
			UNIDADES.nombre as nombreUnidadLectura,
			unidades.idUnidad as idUnidadLectura, indicadores.idUnidad as idUnidadIndicadorLectura
			from usuarios 
			left join LECT_USUARIOS_INDICADORES on usuarios.idUsuario = LECT_USUARIOS_INDICADORES.idUsuario 
			left join LECT_USUARIOS_UNIDADES on usuarios.idUsuario = LECT_USUARIOS_UNIDADES.idUsuario 
			left join (select INDICADORES.*, unidades.nombre as nombreUnidadDelIndicadorLectura from indicadores inner join UNIDADES on INDICADORES.idUnidad = UNIDADES.idUnidad) as INDICADORES on LECT_USUARIOS_INDICADORES.idIndicador = INDICADORES.idIndicador
			left join UNIDADES on LECT_USUARIOS_UNIDADES.idUnidad = UNIDADES.idUnidad
            ) as permisos_lectura
        on permisos_lectura.idUsuario = USUARIOS.idUsuario
        where roles.nombre = 'EMPLEADO' AND USUARIOS.activo = 1
    `).recordset;
        let users = {}
        result.forEach(element => {
            if (!users[element.idUsuario]) {
                let firstIndicator = element.idIndicador ? [{
                    idIndicador: element.idIndicador,
                    nombreUnidad: element.nombreUnidadDelIndicadorEdicion,
                    nombre: element.nombreIndicador + " (edición)",
                    idUnidad: element.idUnidadIndicador,
                    uniqueId: (element.idIndicador + "e"),
                    edit: true,
                }] : [];

                let firstUnit = element.nombreUnidad ? [{
                    idUnidad: element.idUnidad,
                    nombre: element.nombreUnidad + " (edición)",
                    uniqueId: ("u" + element.idUnidad + "e"),
                    edit: true,
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

                let firstReadIndicator = element.idIndicadorLectura ? [{
                    idIndicador: element.idIndicadorLectura,
                    nombre: element.nombreIndicadorLectura + " (lectura)",
                    idUnidad: element.idUnidadIndicadorLectura,
                    nombreUnidad: element.nombreUnidadDelIndicadorLectura,
                    uniqueId: (element.idUnidad + "r"),
                    edit: false,
                }] : [];

                let firstReadUnit = element.nombreUnidadLectura ? [{
                    idUnidad: element.idUnidadLectura,
                    nombre: element.nombreUnidadLectura + " (lectura)",
                    uniqueId: ("u" + element.idUnidadLectura + "r"),
                    edit: false,
                }] : [];

                users[element.idUsuario] = {
                    username: element.username,
                    nombre: element.nombre,
                    apellidos: element.apellidos,
                    indicadores: firstIndicator,
                    unidades: firstUnit,
                    indicadoresLectura: firstReadIndicator,
                    unidadesLectura: firstReadUnit,
                    accesos: firstAccess,
                };
            } else {
                if (element.idIndicador && users[element.idUsuario].indicadores.findIndex(ind => ind.idIndicador === element.idIndicador) < 0) {
                    users[element.idUsuario].indicadores.push({
                        idIndicador: element.idIndicador,
                        nombreUnidad: element.nombreUnidadDelIndicadorEdicion,
                        nombre: element.nombreIndicador + " (edición)",
                        idUnidad: element.idUnidadIndicador,
                        uniqueId: (element.idIndicador + "e"),
                        edit: true,

                    })
                }
                if (element.nombreUnidad && users[element.idUsuario].unidades.findIndex(und => und.idUnidad === element.idUnidad) < 0) {
                    users[element.idUsuario].unidades.push({
                        idUnidad: element.idUnidad,
                        nombre: element.nombreUnidad + " (edición)",
                        uniqueId: ("u" + element.idUnidad + "e"),
                        edit: true,
                    })
                }
                if (element.idAcceso && users[element.idUsuario].accesos.findIndex(acc => acc.idAcceso === element.idAcceso) < 0 && accessHasValidDate(element)) {
                    users[element.idUsuario].accesos.push({
                        nombreIndicadorDelAcceso: element.nombreIndicadorDelAcceso,
                        nombreUnidadDelAccesoAlIndicador: element.nombreUnidadDelAccesoAlIndicador,
                        fechaInicioAccesoIndicador: element.fechaInicioAccesoIndicador,
                        fechaFinAccesoIndicador: element.fechaFinAccesoIndicador,
                        idAcceso: element.idAcceso,
                        idIndicadorDelAcceso: element.idIndicadorDelAcceso,
                    })
                }
                if (element.idIndicadorLectura && users[element.idUsuario].indicadoresLectura.findIndex(ind => ind.idIndicador === element.idIndicadorLectura) < 0) {
                    users[element.idUsuario].indicadoresLectura.push({
                        idIndicador: element.idIndicadorLectura,
                        nombre: element.nombreIndicadorLectura + " (lectura)",
                        idUnidad: element.idUnidadIndicadorLectura,
                        uniqueId: (element.idIndicadorLectura + "r"),
                        nombreUnidad: element.nombreUnidadDelIndicadorLectura,
                        edit: false,
                    })
                }
                if (element.nombreUnidadLectura && users[element.idUsuario].unidadesLectura.findIndex(und => und.idUnidad === element.idUnidadLectura) < 0) {
                    users[element.idUsuario].unidadesLectura.push({
                        idUnidad: element.idUnidadLectura,
                        nombre: element.nombreUnidadLectura + " (lectura)",
                        uniqueId: ("u" + element.idUnidadLectura + "r"),
                        edit: false,
                    })
                }

            }
        });
        let employees = Object.keys(users).map(k => {
            users[k].idUsuario = k;
            return users[k];
        })
        console.log(employees[0].indicadores)
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
        insert into usuarios (username, password, nombre, apellidos, idRol, activo)
        values (${username},${password},${nombre},${apellidos},${idRol}, 1);
        SELECT SCOPE_IDENTITY() AS idUsuario;`;
        let idUsuario = result.recordset[0].idUsuario
        if (idUsuario) {
            if (user.permissions) {
                let unitList = user.permissions.filter(p => p.idIndicador === -1 && p.edit).map(p => {
                    return { idUnidad: p.idUnidad, idUsuario }
                })
                let unitReadList = user.permissions.filter(p => p.idIndicador === -1 && !p.edit).map(p => {
                    return { idUnidad: p.idUnidad, idUsuario }
                })

                if (await permissionsService.addMultipleUserUnitPermissions(dbCon, unitList) &&
                    await permissionsService.addMultipleUserUnitReadPermissions(dbCon, unitReadList)) {
                    let indicatorList = user.permissions.filter(p => p.idIndicador !== -1 && p.edit).map(p => {
                        return { idIndicador: p.idIndicador, idUsuario }
                    })
                    let indicatorReadList = user.permissions.filter(p => p.idIndicador !== -1 && !p.edit).map(p => {
                        return { idIndicador: p.idIndicador, idUsuario }
                    })

                    return await permissionsService.addMultipleUserIndicatorPermissions(dbCon, indicatorList) &&
                        await permissionsService.addMultipleUserIndicatorReadPermissions(dbCon, indicatorReadList)
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
    changePassword: async function (dbCon, username, user, res) {
        const result = await this.getUserByUsername(dbCon, username);
        // El usuario no existe
        if (!result) {
            res.json({
                success: false,
                message: "Usuario incorrecto"
            });
        } else {
            // Revisar si la contraseña coincide
            const validPassword = bcrypt.compareSync(user.currentPassword, result.password);
            if (!validPassword) {
                res.json({
                    success: false,
                    message: "Contraseña incorrecta"
                });
            } else {
                // Las credenciales son correctas
                let password = await bcrypt.hash(user.newPassword, 5)

                let result = await dbCon.query`
                update usuarios set password = ${password}
                where
                username = ${username};`;
                if (result.rowsAffected > 0) {
                    return res.json({
                        success: true,
                        message: "Contraseña actualizada",
                    });
                } else {
                    return res.json({
                        success: false,
                        message: "Ocurrió un error",
                    });
                }
            }
        }

    },
    deactivateUser: async function (dbCon, idUsuario) {

        let result = await dbCon.query`
                     update usuarios set activo = 0
                     where
                     idUsuario = ${idUsuario};`;
        return result.rowsAffected > 0

    },
    activateUser: async function (dbCon, idUsuario) {

        let result = await dbCon.query`
                     update usuarios set activo = 1
                     where
                     idUsuario = ${idUsuario};`;
        return result.rowsAffected > 0

    },
}

function accessHasValidDate(element) {
    const currentTime = new Date().getTime()
    return moment(element.fechaInicioAccesoIndicador).valueOf() <= currentTime &&
        moment(element.fechaFinAccesoIndicador).valueOf() >= (currentTime - 24 * 3600 * 1000)
}