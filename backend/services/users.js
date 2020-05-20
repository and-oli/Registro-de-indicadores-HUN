const bcrypt = require("bcrypt");

module.exports = {

    getUsers: async function (dbCon) {
        const result = (await dbCon.request()
            .query('select * from usuarios')).recordset;
        return result;
    },

    getEmployeesFull: async function (dbCon) {

        const result = (await dbCon.query`
        select usuarios.*, indicadores.idIndicador as idIndicador,indicadores.nombre as nombreIndicador, unidades.nombre as unidad  from usuarios 
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
                users[element.idUsuario] = {
                    username: element.username,
                    nombre: element.nombre,
                    apellidos: element.apellidos,
                    indicadores: [{idIndicador: element.idIndicador, nombreIndicador: element.nombreIndicador}],
                    unidades: [element.unidad],
                };
            } else {
                if (!users[element.idUsuario].indicadores.find(ind => ind.idIndicador === element.idIndicador)) {
                    users[element.idUsuario].indicadores.push({ idIndicador: element.idIndicador, nombreIndicador: element.nombreIndicador })
                }
                if (users[element.idUsuario].unidades.indexOf(element.unidad) === -1) {
                    users[element.idUsuario].unidades.push(element.unidad)
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
        const { username, password, nombre, apellidos, idRol } = user;
        const result = await dbCon.query`
        insert into usuarios (username, password, nombre, apellidos, idRol)
        values (${username},${password},${nombre},${apellidos},${idRol})`;
        return result.rowsAffected > 0
    },

    addUserIndicatorPermission: async function (dbCon, data) {
        const { idUsuario, idIndicador } = data;
        const result = await dbCon.query`
        insert into USUARIOS_INDICADORES (idUsuario, idIndicador)
        values (${idUsuario},${idIndicador})`;
        return result.rowsAffected > 0
    },

    addUserUnitPermission: async function (dbCon, data) {
        const { idUsuario, idUnidad } = data;
        const result = await dbCon.query`
        insert into USUARIOS_UNIDADES (idUsuario, idUnidad)
        values (${idUsuario},${idUnidad})`;
        return result.rowsAffected > 0
    }

}