const moment = require("moment")
module.exports = {

    getIndicators: async function (dbCon) {
        const result = await dbCon.query`
            select *  from indicadores 
        `;
        return result.recordset;
    },
    getIndicatorsNamesByUnitId: async function (dbCon, idUnidad) {
        const result = await dbCon.query`
            select nombre, idIndicador  from indicadores 
            where idUnidad = ${idUnidad}
        `;
        return result.recordset;
    },
    getIndicatorById: async function (dbCon, idIndicador) {
        const result = await dbCon.query`
        select INDICADORES.*, UNIDADES.nombre AS unidad, PERIODOS.nombre as periodicidad from INDICADORES 
        inner join PERIODOS on INDICADORES.idPeriodo = PERIODOS.idPeriodo 
        inner join UNIDADES on INDICADORES.idUnidad = UNIDADES.idUnidad
        where idIndicador = ${idIndicador}
    `;
        return result.recordset[0];
    },

    updateIndicator: async function (dbCon, indicator) {
        const { nombre,
            idIndicador,
            definicion,
            origen,
            formula,
            unidadMedicion,
            responsableDeRecolectarDatos,
            responsableDelIndicador,
            meta,
        } = indicator;
        const result = await dbCon.query`
            update indicadores 
            set
                nombre =  ${nombre},
                definicion =  ${definicion},
                origen =  ${origen},
                formula =  ${formula},
                unidadMedicion =  ${unidadMedicion},
                responsableDeRecolectarDatos =  ${responsableDeRecolectarDatos},
                responsableDelIndicador =  ${responsableDelIndicador},
                meta =  ${meta}
            WHERE idIndicador =  ${idIndicador}
                `;
        return result.rowsAffected > 0
    },


    postIndicator: async function (dbCon, indicator) {
        const { nombre,
            definicion,
            idPeriodo,
            idUnidad,
            origen,
            formula,
            unidadMedicion,
            responsableDeRecolectarDatos,
            responsableDelIndicador,
            meta,
            inicioPeriodoActual,
            finPeriodoActual,
        } = indicator;
        const result = await dbCon.query`
            insert into indicadores (
                nombre, 
                definicion,
                idPeriodo,
                idUnidad, 
                origen, 
                formula, 
                unidadMedicion, 
                responsableDeRecolectarDatos,
                responsableDelIndicador,
                meta, 
                inicioPeriodoActual,
                finPeriodoActual,
                periodoActual
                )
            values (
                ${nombre},
                ${definicion},
                ${idPeriodo},
                ${idUnidad},
                ${origen},
                ${formula},
                ${unidadMedicion},
                ${responsableDeRecolectarDatos},
                ${responsableDelIndicador},
                ${meta},
                ${inicioPeriodoActual},
                ${finPeriodoActual},
                0
                )`;
        return result.rowsAffected > 0
    },
    getIndicatorByNameAndUnitId: async function (dbCon, nombre, idUnidad) {
        const result = await dbCon.query`
        select * from INDICADORES 
        where nombre = ${nombre}
        and idUnidad = ${idUnidad}
    `;
        return result.recordset[0];
    },

    getCurrentAndNextPeriodDates: async function (dbCon, idIndicador) {

        const result = (await dbCon.query`
        select INDICADORES.inicioPeriodoActual, INDICADORES.finPeriodoActual, INDICADORES.periodoActual, PERIODOS.meses 
        from INDICADORES inner join PERIODOS on INDICADORES.idPeriodo = PERIODOS.idPeriodo  
        where idIndicador = ${idIndicador}
        `).recordset[0];
        if (result) {
            const currentStartDate = moment(result.inicioPeriodoActual).toString()
            const currentEndDate = moment(result.finPeriodoActual).toString()
            const currentPeriod = result.periodoActual;
            const nextStartDate = moment(result.inicioPeriodoActual).add(result.meses, "M").toString()
            const nextEndDate = moment(result.finPeriodoActual).add(result.meses, "M").toString()
            return {currentStartDate, currentEndDate, currentPeriod, nextStartDate, nextEndDate}
        }
        return false;
    },
    updatePeriod: async function (dbCon, idIndicador) {

        const result = (await dbCon.query`
        select INDICADORES.inicioPeriodoActual, INDICADORES.finPeriodoActual, INDICADORES.periodoActual, PERIODOS.meses 
        from INDICADORES inner join PERIODOS on INDICADORES.idPeriodo = PERIODOS.idPeriodo  
        where idIndicador = ${idIndicador}
        `).recordset[0];
        if (result) {
            const newStartDate = moment(result.inicioPeriodoActual).add(result.meses, "M").toString()
            const newEndDate = moment(result.finPeriodoActual).add(result.meses, "M").toString()
            const newPeriod = result.periodoActual + 1;
            await dbCon.query`
        update INDICADORES 
        set inicioPeriodoActual = ${newStartDate},  
        finPeriodoActual = ${newEndDate},  
        periodoActual = ${newPeriod}  
        where idIndicador = ${idIndicador}
        `;
            return result.rowsAffected > 0
        }
        return false;
    },

    getPeriods: async function (dbCon) {
        const result = await dbCon.query`
            select *  from PERIODOS 
        `;
        return result.recordset;
    },

}