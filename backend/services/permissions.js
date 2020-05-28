
module.exports = {

    /**
     * Determina si se puede ingresar un valor para indicador en la fecha actual 
     * (Si la fecha actual está incluida en la vigencia del indicador) 
     */
    indicatorRegistryIsEnabled: async function (dbCon, idIndicador) {
        const result = await dbCon.query`
        SELECT inicioPeriodoActual, finPeriodoActual FROM INDICADORES 
        WHERE idIndicador = ${idIndicador}
        `;
        const currentTime = new Date().getTime() - (1000 * 3600 * 5) // El servidor en heroku estará en la hora 0 GMT, Colombia está en -5GMT
        if (result.recordset[0] && result.recordset[0].inicioPeriodoActual && result.recordset[0].finPeriodoActual) {
            const time1 = new Date(result.recordset[0].inicioPeriodoActual).getTime()
            const time2 = new Date(result.recordset[0].finPeriodoActual).getTime()
            return currentTime >= time1 && currentTime <= time2;
        }
        return false

    },

    userCanEditUnit: async function (dbCon, idIndicador, idUsuario) {

        const result = await dbCon.query`
            SELECT INDICADORES.idIndicador, USUARIOS_UNIDADES.idUnidad, USUARIOS_UNIDADES.idUsuario
            FROM INDICADORES 
            INNER JOIN USUARIOS_UNIDADES ON INDICADORES.idUnidad = USUARIOS_UNIDADES.idUnidad 
            WHERE USUARIOS_UNIDADES.idUsuario = ${idUsuario}
            AND INDICADORES.idIndicador = ${idIndicador}
        `;
        return result.recordset[0];
    },

    userCanEditIndicator: async function (dbCon, idIndicador, idUsuario) {
        const result = await dbCon.query`
        SELECT * FROM USUARIOS_INDICADORES 
        WHERE idUsuario = ${idUsuario}
        AND idIndicador = ${idIndicador}
    `;
        return result.recordset[0];

    },
    addMultipleUserIndicatorPermissions: async function (dbCon, data) {
        if (data.length > 0) {
            let valuesListString = ""
            for (let i = 0; i < data.length; i++) {
                valuesListString += `(${data[i].idUsuario},${data[i].idIndicador})`
                if (i < data.length - 1) {
                    valuesListString += ", "
                }
            }
            const result = (await dbCon.request()
                .query(`insert into USUARIOS_INDICADORES (idUsuario, idIndicador)
            values ${valuesListString}`));
            return result.rowsAffected > 0
        }
        return true
    },

    addMultipleUserUnitPermissions: async function (dbCon, data) {
        if (data.length > 0) {
            let valuesListString = ""
            for (let i = 0; i < data.length; i++) {
                valuesListString += `(${data[i].idUsuario},${data[i].idUnidad})`
                if (i < data.length - 1) {
                    valuesListString += ", "
                }
            }
            const result = (await dbCon.request()
                .query(`insert into USUARIOS_UNIDADES (idUsuario, idUnidad)
            values ${valuesListString}`));

            return result.rowsAffected > 0
        }
        return true
    },
    removeMultipleUserIndicatorPermissions: async function (dbCon, data) {
        if (data.length > 0) {
            let conditionList = ""
            for (let i = 0; i < data.length; i++) {
                conditionList += `( idUsuario = ${data[i].idUsuario} AND idIndicador = ${data[i].idIndicador})`
                if (i < data.length - 1) {
                    conditionList += "OR "
                }
            }
            const result = (await dbCon.request()
                .query(`
            delete from USUARIOS_INDICADORES 
            where ${conditionList}`));
            return result.rowsAffected > 0
        }
        return true
    },

    removeMultipleUserUnitPermissions: async function (dbCon, data) {
        if (data.length > 0) {
            let conditionList = ""
            for (let i = 0; i < data.length; i++) {
                conditionList += `( idUsuario = ${data[i].idUsuario} AND idUnidad = ${data[i].idUnidad})`
                if (i < data.length - 1) {
                    conditionList += "OR "
                }
            }
            const result = (await dbCon.request()
                .query(`
        delete from USUARIOS_UNIDADES 
        where ${conditionList}`));
            return result.rowsAffected > 0
        }
        return true
    },
}