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

    getAccessesHistory: async function (dbCon) {
        const result = await dbCon.query`
        SELECT 
            idAcceso,
            fechaInicio, 
            fechaFin, 
            USUARIOS.nombre as username, 
            USUARIOS.apellidos as lastname,
            INDICADORES.nombre as indicator, 
            responsableDelIndicador, 
            comentario, 
            fecha 
        FROM ACCESOS 
        INNER JOIN USUARIOS ON ACCESOS.idUsuario = USUARIOS.idUsuario
        INNER JOIN INDICADORES ON ACCESOS.idIndicador = INDICADORES.idIndicador
        INNER JOIN SOLICITUDES ON ACCESOS.idSolicitud = SOLICITUDES.idSolicitud
        `;
        return result.recordset;
    },

    postAccess: async function (dbCon, access) {
        const { idUsuario,
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

    removeMultipleAccesses: async function (dbCon, data) {
        if (data.length > 0) {
            let conditionList = ""
            for (let i = 0; i < data.length; i++) {
                conditionList += `( idAcceso = ${data[i]} )`
                if (i < data.length - 1) {
                    conditionList += "OR "
                }
            }
            const result = (await dbCon.request()
                .query(`
        delete from ACCESOS 
        where ${conditionList}`));
            return result.rowsAffected > 0
        }
        return true
    },

}