const requestService = require("./requests")
module.exports = {

    getAccessesByIndicatorIdAndUserId: async function (dbCon, idIndicador, idUsuario) {
        const result = await dbCon.query`
            select *  from ACCESOS 
            where idIndicador = ${idIndicador}
            and idUsuario = ${idUsuario}
            and USADO = 0
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
            insert into ACCESOS (idUsuario, idIndicador, idSolicitud,fechaInicio,fechaFin, USADO)
            values (${idUsuario},${idIndicador},${idSolicitud},${fechaInicio},${fechaFin}, 0)`;
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