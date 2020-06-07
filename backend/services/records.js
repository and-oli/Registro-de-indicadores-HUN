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
        select REGISTROS.*, USUARIOS.username as usuario from REGISTROS INNER JOIN USUARIOS 
        ON USUARIOS.idUsuario = REGISTROS.idUsuario  
            where idIndicador = ${idIndicador}
            and ultimoDelPeriodo = ${true}
        `;
        return result.recordset;
    },
    getRecordsByPeriod: async function (dbCon, idIndicador, periodo) {
        const result = await dbCon.query`
            select *  from REGISTROS 
            where idIndicador = ${idIndicador}
            and periodo = ${periodo}
        `;
        return result.recordset;
    },
    getLastRecordByPeriod: async function (dbCon, idIndicador, periodo) {
        const result = await dbCon.query`
            select *  from REGISTROS 
            where idIndicador = ${idIndicador}
            and periodo = ${periodo}
            and ultimoDelPeriodo = ${true}
        `;
        return result.recordset[0];
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
        const currentTime = new Date().getTime() // El servidor en heroku estará en la hora 0 GMT, Colombia está en -5GMT
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
            periodo,
            numerador,
            denominador,
            nuevoPeriodo
        } = record;
        const fecha = new Date(new Date().getTime() - (1000 * 3600 * 5)).toString();
        record.idUsuario = idUsuario
        const userPermissionToPost = await this.userCanPostRecord(dbCon, record);
        if (userPermissionToPost) {

            // Determinar si se puede ingresar el registro de este periodo si en la base de datos se encuentra 
            // un registro para el periodo anterior

            const result = await dbCon.query`
            select idRegistro from REGISTROS
            where periodo = ${periodo - 1}
            `;
            if (!(result.recordset[0] || periodo === 0)) {
                return { success: false, message: "Debe registrar un valor para este indicador para el último periodo sin registro." }
            }

            // Actualizar los registros previos del periodo

            await dbCon.query`
                            update REGISTROS 
                            set ultimoDelPeriodo = 0
                            where periodo = ${periodo}
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
                periodo,
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
                ${periodo},
                ${true}
                )`;
            if (result2.rowsAffected > 0) {


                if (nuevoPeriodo) {

                    // Actualizar el periodo actual y su vigencia en el indicador.

                    if (await indicatorsService.updatePeriod(dbCon, idIndicador)) {
                        return { success: false, message: "No existe un indicador con ese id" }
                    }
                }
                return { success: true, message: "Registro ingresado." }
            }
            return { success: false, message: "Ocurrió un error" }
        }
        else return { success: false, message: "No está autorizado para registrar un valor a este indicador" }

    },

}