const accessService = require("./accesses")
const permissionsService = require("./permissions")
const moment = require("moment")
const indicatorsService = require("./indicators")
module.exports = {

    getRecordsByIndicatorId: async function (dbCon, idIndicador) {
        const result = await dbCon.query`
            select REGISTROS.*, USUARIOS.username as usuario from REGISTROS INNER JOIN USUARIOS 
            ON USUARIOS.idUsuario = REGISTROS.idUsuario 
            where idIndicador = ${idIndicador}
        `;
        return result.recordset;
    },

    getLastRecordsByIndicatorId: async function (dbCon, idIndicador) {
        const result = await dbCon.query`
        select REGISTROS.*, INDICADORES.meta, USUARIOS.username as usuario, 
        USUARIOS.nombre as nombreUsuario, USUARIOS.apellidos as apellidosUsuario
        from REGISTROS INNER JOIN USUARIOS 
        ON USUARIOS.idUsuario = REGISTROS.idUsuario  
        LEFT JOIN INDICADORES 
        ON REGISTROS.idIndicador = INDICADORES.idIndicador  
            where REGISTROS.idIndicador = ${idIndicador}
            and ultimoDelPeriodo = ${true}
        `;
        return result.recordset;
    },

    /**
     * Determina si un usuario está habilitadO para subir un registro. Es decir, si se cumple una de las siguientes condiciones:
     * 1. Hay un objeto acceso en la base de datos que le da al usuario acceso al indicador en la fecha actual.
     * 2. El indicador se puede registrar en la fecha actual y el usuario tiene acceso al indicador por medio de 
     *    la tabla USUARIOS_INDICADORES
     * 3. El indicador se puede registrar en la fecha actual y El usuario tiene acceso al indicador por medio de 
     *    la tabla USUARIOS_UINIDADES
     * @param {*} dbCon el pool de conexiones a la base de datos.
     * @param {*} record el registro que se intenta subir 
     */
    userCanPostRecord: async function (dbCon, record) {
        const {
            idIndicador,
            idUsuario,
        } = record;
        // Revisar si hay un objeto acceso vigente para el usuario al indicador.
        const acceses = await accessService.getAccessesByIndicatorIdAndUserId(dbCon, idIndicador, idUsuario);
        const currentTime = new Date().getTime()
        const validAccess = acceses.find(a =>
            moment(a.fechaInicio).valueOf() <= currentTime &&
            moment(a.fechaFin).valueOf() >= (currentTime - 24 * 3600 * 1000)
        )

        if (validAccess) {
            return validAccess
        }

        // Revisar si el indicador se puede registrar en la fecha actual
        if (await permissionsService.indicatorRegistryIsEnabled(dbCon, idIndicador)) {

            // Revisar si el usuario tiene permiso para registrar este indicador
            const validIndicatorPermision = await permissionsService.userCanEditIndicator(dbCon, idIndicador, idUsuario);
            if (validIndicatorPermision) {
                return validIndicatorPermision
            }

            // Revisar si el usuario tiene permiso para registrar indicadores en la unidad del indicador
            const validUnitPermision = await permissionsService.userCanEditUnit(dbCon, idIndicador, idUsuario);

            if (validUnitPermision) {
                return validUnitPermision
            }
        }
        return false;
    },

    postRecord: async function (dbCon, record, idUsuario) {
        const {
            idIndicador,
            analisisCualitativo,
            accionMejora,
            valor,
            numerador,
            denominador,
            ano,
            nombrePeriodo,
        } = record;
        const fecha = moment().format()
        record.idUsuario = idUsuario
        const userPermissionToPost = await this.userCanPostRecord(dbCon, record);
        if (userPermissionToPost) {


            // Actualizar los registros previos del periodo

            await dbCon.query`
                            update REGISTROS 
                            set ultimoDelPeriodo = 0
                            where ano = ${ano} and nombrePeriodo = ${nombrePeriodo} 
                            and idIndicador = ${idIndicador}
                            `;
            // Insertar el registro
            const result2 = await dbCon.query`
            insert into REGISTROS (
                idIndicador, 
                idUsuario,
                idSolicitud, 
                fecha, 
                analisisCualitativo, 
                accionMejora, 
                valor,
                numerador,
                denominador,
                nombrePeriodo,
                ano,
                ultimoDelPeriodo
                )
            values (
                ${idIndicador},
                ${idUsuario},
                ${userPermissionToPost.idSolicitud},
                ${fecha},
                ${analisisCualitativo},
                ${accionMejora},
                ${valor},
                ${numerador},
                ${denominador},
                ${nombrePeriodo},
                ${ano},
                ${true}
                )`;
            if (result2.rowsAffected > 0) {
                return { success: true, message: "Registro ingresado." }
            }
            return { success: false, message: "Ocurrió un error" }
        }
        else return { success: false, message: "No está autorizado para registrar un valor a este indicador" }

    },

}