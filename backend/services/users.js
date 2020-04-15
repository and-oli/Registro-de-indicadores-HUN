const bcrypt = require("bcrypt");

module.exports = {

    getUsers: async function (dbCon) {
        const result = (await dbCon.request()
            .query('select * from usuarios')).recordset;
        return result;
    },

    getUserByUsername: async function (dbCon, username) {
        const result = await dbCon.query`
            select USUARIOS.*, UNIDADES.nombre AS unidad, ROLES.nombre as rol from usuarios 
            inner join roles on usuarios.idRol = roles.idRol 
            inner join unidades on usuarios.idUnidad = unidades.idUnidad
            where username = ${username}
        `;
        return result.recordset[0];
    },
    
    postUser: async function (dbCon, user) {
        user.password = await bcrypt.hash(user.password, 5)
        const {username, password, nombre, apellidos, idUnidad, idRol} = user;
        const result = await dbCon.query`
        insert into usuarios (username, password, nombre, apellidos, idUnidad, idRol)
        values (${username},${password},${nombre},${apellidos},${idUnidad},${idRol})`;
        return result.rowsAffected > 0
    },

    addUserIndicatorPermission: async function (dbCon, data) {
        const {idUsuario, idIndicador} = data;
        const result = await dbCon.query`
        insert into USUARIOS_INDICADORES (idUsuario, idIndicador)
        values (${idUsuario},${idIndicador})`;
        return result.rowsAffected > 0
    },

    addUserUnitPermission: async function (dbCon, data) {
        const {idUsuario, idUnidad} = data;
        const result = await dbCon.query`
        insert into USUARIOS_UNIDADES (idUsuario, idUnidad)
        values (${idUsuario},${idUnidad})`;
        return result.rowsAffected > 0
    }

}