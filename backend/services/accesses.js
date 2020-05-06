const requestService = require("./requests")
module.exports = {

    getAccessesByIndicatorIdAndUserId: async function (dbCon, idIndicador, idUsuario) {
        const result = await dbCon.query`
            select *  from ACCESOS 
            where idIndicador = ${idIndicador}
            and idUsuario = ${idUsuario}
        `;
        return result.recordset;
    },

    postAccess: async function (dbCon, access) {
        const {idUsuario, 
            idIndicador, 
            idSolicitud, 
            fechaInicio,
            fechaFin, 
        } = access;
        await requestService.updateRequest(dbCon, idSolicitud, true)
        const result = await dbCon.query`
            insert into ACCESOS (idUsuario, idIndicador, idSolicitud,fechaInicio,fechaFin)
            values (${idUsuario},${idIndicador},${idSolicitud},${fechaInicio},${fechaFin})`;
        return result.rowsAffected > 0;
    },

}