const moment = require("moment")
const periodicities = require("../periodicities")
const permissionsService = require("./permissions")
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
    getIndicatorsNamesByUnitIdRead: async function (dbCon, idUnidad, idUsuario, admin) {
        if (admin) {
            return await this.getIndicatorsNamesByUnitId(dbCon, idUnidad)
        }
        const result = await dbCon.query`
            select edicionesIndicadores.nombre as nombreEdicionIndicador, edicionesIndicadores.idIndicador as idEdicionIndicador, 
            lecturasIndicadores.nombre as nombreLecturaIndicador, lecturasIndicadores.idIndicador as idLecturaIndicador,
            edicionUnidades.nombre as nombreEdicionUnidad, edicionUnidades.idIndicador as idEdicionUnidad, 
            lecturasUnidades.nombre as nombreLecturaUnidad, lecturasUnidades.idIndicador as idLecturaUnidad
            from
            (
            select INDICADORES.nombre, INDICADORES.idIndicador,  USUARIOS_INDICADORES.idUsuario 
            from USUARIOS_INDICADORES 
            inner join INDICADORES on USUARIOS_INDICADORES.idIndicador = INDICADORES.idIndicador
            where INDICADORES.idUnidad = ${idUnidad} and USUARIOS_INDICADORES.idUsuario = ${idUsuario}
            ) as edicionesIndicadores
            full outer join
            (
            select INDICADORES.nombre, INDICADORES.idIndicador, LECT_USUARIOS_INDICADORES.idUsuario 
            from LECT_USUARIOS_INDICADORES 
            inner join INDICADORES on LECT_USUARIOS_INDICADORES .idIndicador = INDICADORES.idIndicador
            where INDICADORES.idUnidad = ${idUnidad} and LECT_USUARIOS_INDICADORES .idUsuario = ${idUsuario}
            ) as lecturasIndicadores
            on edicionesIndicadores.idUsuario = lecturasIndicadores.idUsuario
            full outer join
            (
            select INDICADORES.nombre, INDICADORES.idIndicador, USUARIOS_UNIDADES.idUsuario   
            from USUARIOS_UNIDADES 
            left join INDICADORES on USUARIOS_UNIDADES.idUnidad = INDICADORES.idUnidad
            where USUARIOS_UNIDADES.idUnidad = ${idUnidad} and USUARIOS_UNIDADES .idUsuario = ${idUsuario}
            ) as edicionUnidades
            on edicionUnidades.idUsuario = lecturasIndicadores.idUsuario
            
            full outer join
            (
            select INDICADORES.nombre, INDICADORES.idIndicador,  LECT_USUARIOS_UNIDADES.idUsuario   
            from LECT_USUARIOS_UNIDADES 
            left join INDICADORES on LECT_USUARIOS_UNIDADES.idUnidad = INDICADORES.idUnidad
            where LECT_USUARIOS_UNIDADES.idUnidad = ${idUnidad} and LECT_USUARIOS_UNIDADES .idUsuario = ${idUsuario}
            ) as lecturasUnidades
            on lecturasUnidades.idUsuario = lecturasIndicadores.idUsuario
            `;

        let indicators = {}
        result.recordset.forEach(element => {
            if (element.idEdicionIndicador && !indicators[element.idEdicionIndicador]) {
                indicators[element.idEdicionIndicador] = { nombre: element.nombreEdicionIndicador, idIndicador: element.idEdicionIndicador }
            }
            if (element.idLecturaIndicador && !indicators[element.idLecturaIndicador]) {
                indicators[element.idLecturaIndicador] = { nombre: element.nombreLecturaIndicador, idIndicador: element.idLecturaIndicador }
            }
            if (element.idEdicionUnidad && !indicators[element.idEdicionUnidad]) {
                indicators[element.idEdicionUnidad] = { nombre: element.nombreEdicionUnidad, idIndicador: element.idEdicionUnidad }
            }
            if (element.idLecturaUnidad && !indicators[element.idLecturaUnidad]) {
                indicators[element.idLecturaUnidad] = { nombre: element.nombreLecturaUnidad, idIndicador: element.idLecturaUnidad }
            }
        });
        let finalResult = Object.keys(indicators).map(k => {
            return indicators[k];
        })
        return finalResult;
    },
    getIndicatorsNamesByUnitIdEdit: async function (dbCon, idUnidad, idUsuario, admin) {
        if (admin) {
            return await this.getIndicatorsNamesByUnitId(dbCon, idUnidad)
        }
        const result = await dbCon.query`
            select edicionesIndicadores.nombre as nombreEdicionIndicador, edicionesIndicadores.idIndicador as idEdicionIndicador, 
            edicionUnidades.nombre as nombreEdicionUnidad, edicionUnidades.idIndicador as idEdicionUnidad 
            from
            (
            select INDICADORES.nombre, INDICADORES.idIndicador,  USUARIOS_INDICADORES.idUsuario 
            from USUARIOS_INDICADORES 
            inner join INDICADORES on USUARIOS_INDICADORES.idIndicador = INDICADORES.idIndicador
            where INDICADORES.idUnidad = ${idUnidad} and USUARIOS_INDICADORES.idUsuario = ${idUsuario}
            ) as edicionesIndicadores
            full outer join
            (
            select INDICADORES.nombre, INDICADORES.idIndicador, USUARIOS_UNIDADES.idUsuario   
            from USUARIOS_UNIDADES 
            left join INDICADORES on USUARIOS_UNIDADES.idUnidad = INDICADORES.idUnidad
            where USUARIOS_UNIDADES.idUnidad = ${idUnidad} and USUARIOS_UNIDADES .idUsuario = ${idUsuario}
            ) as edicionUnidades
            on edicionUnidades.idUsuario = edicionesIndicadores.idUsuario
            `;

        let indicators = {}
        result.recordset.forEach(element => {
            if (element.idEdicionIndicador && !indicators[element.idEdicionIndicador]) {
                indicators[element.idEdicionIndicador] = { nombre: element.nombreEdicionIndicador, idIndicador: element.idEdicionIndicador }
            }
            if (element.idEdicionUnidad && !indicators[element.idEdicionUnidad]) {
                indicators[element.idEdicionUnidad] = { nombre: element.nombreEdicionUnidad, idIndicador: element.idEdicionUnidad }
            }
        });
        let finalResult = Object.keys(indicators).map(k => {
            return indicators[k];
        })
        return finalResult;
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
            inicioVigencia,
            finVigencia,
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
                inicioVigencia =  ${inicioVigencia},
                finVigencia =  ${finVigencia},
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
                tipo
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
                ${startCurrentPeriod},
                ${endCurrentPeriod},
                ${indicatorType}
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

    getCurrentPeriodName: async function (dbCon, indicatorId, record) {

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
            // Ya hay registros para este indicador.
            indicatorPeriodicityName = indicatorPeriodicityName.nombre;
            lastRecordPeriodYear = lastRecordPeriod.ano;
            lastRecordPeriod = lastRecordPeriod.nombre;

            let periodicityKeys = Object.keys(periodicities[indicatorPeriodicityName])
            // Último periodo con registros
            let lastRecordPeriodIndex = periodicityKeys.findIndex(p => p === lastRecordPeriod)
            // Periodo siguiente al último periodo sin registros
            let nextRecordPeriodIndex = lastRecordPeriodIndex === periodicityKeys.length - 1 ? 0 : lastRecordPeriodIndex + 1;
            let nextRecordPeriod = periodicityKeys[nextRecordPeriodIndex]
            let nextRecordPeriodStartMonth = Number.parseInt(periodicities[indicatorPeriodicityName][nextRecordPeriod].split(",")[0])
            let nextRecordPeriodFinalMonth = Number.parseInt(periodicities[indicatorPeriodicityName][nextRecordPeriod].split(",")[1])
            let currentMonthIndex = moment().month()
            
            // El primer mes siguiente al primer periodo sin registros
            let firstMonthAfterNextPeriodIndex = nextRecordPeriodFinalMonth === 11 ? 0 : nextRecordPeriodFinalMonth + 1;
            if (record) {
                // El método se invoca para saber si el usuario puede registrar en esta fecha sin acceso.
                if(currentMonthIndex ===  firstMonthAfterNextPeriodIndex  || currentMonthIndex === nextRecordPeriodStartMonth){
                    // El mes actual es el inmediatamente siguiente al periodo que hay que registrar
                    // Bien sea porque el primer periodo sin registros es el inmediatamente anterior al mes actual o 
                    // Porque el último periodo con registros es el inmediatamente anterior al mes actual
                    let periodToRegisterName = currentMonthIndex ===  firstMonthAfterNextPeriodIndex? nextRecordPeriod : lastRecordPeriod
                    if(periodToRegisterName === record.nombrePeriodo || !record.nombrePeriodo){
                        // Se está intentando registrar el periodo correcto
                        // O no se está intentando registrar, solo validar si la fecha es oportuna
                        return true
                    }
                } 
                return false
            }
            if (currentMonthIndex >= nextRecordPeriodStartMonth && currentMonthIndex <= nextRecordPeriodFinalMonth) {
                // El ultimo periodo con registros es el periodo inmediatamente anterior al actual.
                return { name: lastRecordPeriod, year: lastRecordPeriodYear }
            } else {
                return {
                    name: nextRecordPeriod, year: lastRecordPeriodYear + (nextRecordPeriodIndex === 0 ? 1 : 0)
                }
            }

        } else if (indicatorPeriodicityName) {
            // No hay registros para el indicador todavía, retornal el periodo inmediatamente anterior.

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