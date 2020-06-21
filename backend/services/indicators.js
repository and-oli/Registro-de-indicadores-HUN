const moment = require("moment")
const periodicities = require("../periodicities")
module.exports = {

    getIndicators: async function (dbCon) {
        const result = await dbCon.query`
            select *  from indicadores 
        `;
        return result.recordset;
    },
    getIndicatorsNamesByUnitId: async function (dbCon, idUnidad) {
        const result = await dbCon.query`
            select nombre, idIndicador, idUnidad,tipo  from indicadores 
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
        const { name,
            definition,
            idPeriod,
            idUnit,
            dataSource,
            formula,
            unitMeasurement,
            responsableData,
            responsableIndicator,
            goal,
            startCurrentPeriod,
            endCurrentPeriod,
            indicatorType,
        } = indicator;
        let inicioVigencia = new Date(startCurrentPeriod).getDate()
        let finVigencia = new Date(endCurrentPeriod).getDate()
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
                inicioVigencia,
                finVigencia,
                tipo,
                periodoActual
                )
            values (
                ${name},
                ${definition},
                ${idPeriod},
                ${idUnit},
                ${dataSource},
                ${formula},
                ${unitMeasurement},
                ${responsableData},
                ${responsableIndicator},
                ${goal},
                ${inicioVigencia},
                ${finVigencia},
                ${indicatorType},
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

    getCurrentPeriodName: async function (dbCon, indicatorId) {

        let indicatorPeriodicityName = (await dbCon.query`
            select PERIODOS.nombre from INDICADORES inner join 
            PERIODOS on INDICADORES.idPeriodo = PERIODOS.idPeriodo
            WHERE idIndicador = ${indicatorId}
            `).recordset[0];
        let lastRecordPeriod = (await dbCon.query`
            SELECT TOP 1 REGISTROS.nombrePeriodo as nombre, REGISTROS.ano FROM REGISTROS 
            WHERE idIndicador = ${indicatorId}
            ORDER BY idRegistro DESC;
            `).recordset[0];
        if (indicatorPeriodicityName && lastRecordPeriod) {

            indicatorPeriodicityName = indicatorPeriodicityName.nombre;
            lastRecordPeriod = lastRecordPeriod.nombre;

            let periodicityKeys = Object.keys(periodicities[indicatorPeriodicityName])
            let lastRecordPeriodIndex = periodicityKeys.findIndex(p => p === lastRecordPeriod)
            let nextRecordPeriodIndex = lastRecordPeriodIndex === periodicities.length - 1 ? 0 : lastRecordPeriodIndex + 1;
            let nextRecordPeriod = Object.keys(periodicities[indicatorPeriodicityName])[nextRecordPeriodIndex]
            let nextRecordPeriodStartMonth = Number.parseInt(periodicities[indicatorPeriodicityName][nextRecordPeriod].split(",")[0])
            let nextRecordPeriodFinalMonth = Number.parseInt(periodicities[indicatorPeriodicityName][nextRecordPeriod].split(",")[1])

            let currentMonthIndex = moment().month()

            if (currentMonthIndex >= nextRecordPeriodStartMonth && currentMonthIndex <= nextRecordPeriodFinalMonth) {
                // El ultimo periodo con registros es el periodo inmediatamente anterior al actual.
                return { name: lastRecordPeriod, year: lastRecordPeriod.ano }
            } else {
                return {
                    name: nextRecordPeriod, year: lastRecordPeriod.ano + nextRecordPeriodIndex === 0 ? 1 : 0
                }
            }

        } else if (indicatorPeriodicityName) {
            let currentMonthIndex = moment().month()
            let currentYear = moment().year();

            indicatorPeriodicityName = indicatorPeriodicityName.nombre;
            let monthCount = 0;
            let periods = periodicities[indicatorPeriodicityName];
            for (let periodName in periods) {
                let currentPeriodStartMonth = Number.parseInt(periods[periodName].split(",")[0])
                let currentPeriodFinalMonth = Number.parseInt(periods[periodName].split(",")[1])
                if (currentMonthIndex >= currentPeriodStartMonth && currentMonthIndex <= currentPeriodFinalMonth) {
                    break
                }
                monthCount++;
            }
            let periodsNames = Object.keys(periodicities[indicatorPeriodicityName]);
            return monthCount === 0 ? { name: periodsNames[periodsNames.length - 1], year: currentYear - 1 } :
                { name: periodsNames[monthCount - 1], year: currentYear }
        }
        return false;
    },

    getPeriods: async function (dbCon) {
        const result = await dbCon.query`
            select * from PERIODOS 
        `;
        return result.recordset;
    },

}