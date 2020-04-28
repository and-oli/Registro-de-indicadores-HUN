const express = require('express');
const router = express.Router();
const token = require("../services/token");
const recordsService = require("../services/records");

function records(dbCon) {
    /**
     * Retorna los registros de un indicador dado su id
     */
    router.get('/recordsByIndicatorId/:indicatorId', token.checkToken, async function (req, res, next) {
        try {
            if (!req.params.indicatorId) {
                return res.json({ success: false, message: "Debe ingresar un id de indicador" });
            }
            const registros =
                await recordsService.getRecordsByIndicatorId(await dbCon, req.params.indicatorId);
            return res.json({ success: true, registros, message: "" });
        } catch (error) {
            console.error(error);
            return res.json({ success: false, message: "Ocurrió un error" });
        }

    });

    /**
     * Retorna los últimos registros por periodo de un indicador dado su id
     */
    router.get('/lastRecordsByIndicatorId/:indicatorId', token.checkToken, async function (req, res, next) {
        try {
            if (!req.params.indicatorId) {
                return res.json({ success: false, message: "Debe ingresar un id de indicador" });
            }
            const registros =
                await recordsService.getLastRecordsByIndicatorId(await dbCon, req.params.indicatorId);
            return res.json({ success: true, registros, message: "" });
        } catch (error) {
            console.error(error);
            return res.json({ success: false, message: "Ocurrió un error" });
        }

    });

    /**
     * Retorna los registros de un indicador en un periodo dado el id del indicador y el periodo
     */
    router.get('/recordsByIndicatorIdByPeriod/:indicatorId/:period', token.checkToken, async function (req, res, next) {
        try {
            if (!req.params.indicatorId || !req.params.period ) {
                return res.json({ success: false, message: "Debe ingresar un id de indicador y un periodo" });
            }
            const registros =
                await recordsService.getRecordsByIndicatorId(await dbCon, req.params.indicatorId, req.params.period);
            return res.json({ success: true, registros, message: "" });
        } catch (error) {
            console.error(error);
            return res.json({ success: false, message: "Ocurrió un error" });
        }

    });
    
    /**
     * Retorna el último registro de un indicador en un periodo dado el id del indicador y el periodo
     */
    router.get('/lastRecordByIndicatorIdByPeriod/:indicatorId/:period', token.checkToken, async function (req, res, next) {
        try {
            if (!req.params.indicatorId || !req.params.period ) {
                return res.json({ success: false, message: "Debe ingresar un id de indicador y un periodo" });
            }
            const registro =
                await recordsService.getLastRecordByIndicatorId(await dbCon, req.params.indicatorId, req.params.period);
            return res.json({ success: true, registro, message: "" });
        } catch (error) {
            console.error(error);
            return res.json({ success: false, message: "Ocurrió un error" });
        }

    });

    /**
     * Retorna un objeto que determina si un usuario tiene acceso vigente para ingresar un registro
     * de un indicador dado el id del usuario (en el token) y del indicador.
     */
    router.get('/userCanPostRecord/:indicatorId', token.checkToken, async function (req, res, next) {
        try {
            if (!req.params.indicatorId ) {
                return res.json({ success: false, message: "Debe ingresar un id de indicador" });
            }
            const record = { idIndicador: req.params.indicatorId, idUsuario: req.decoded.idUsuario };
            const result = 
                await recordsService.userCanPostRecord(await dbCon, record);
            return res.json({ success: true, result, message: "" });
        } catch (error) {
            console.error(error);
            return res.json({ success: false, message: "Ocurrió un error" });
        }

    });
    /**
     * Ingresa un nuevo registro.
     * body: {
     *      idIndicador,
            analisisCualitativo,
            accionMejora,
            numerador,
            denominador,
            valor,
            periodo, Numero consecutivo que determina el periodo para el cual se registra el valor del indicador. Si no
                     hay registros para el indicador todavía, debe ser 0.
            nuevoPeriodo Booleano que determina si se está agregando el registro para un periodo nuevo. Es decir, para
                         un periodo para el cual no se habían registrado valores previamente. Si es true, se actualizará
                         el indicador asignando en el valor "periodo" el contenido en el campo periodo del body y la vigencia
                         (inicioPeriodoActual y finPeriodoActual) se recalculará. En el front se debe mostrar la opción para 
                         registrar el valor de un nuevo periodo (marcar como true el booleano) si la fecha actual es posterior 
                         a la fecha de fin del periodo actual del indicador. El front siempre debe mostrar la opcion de agregar
                         un registro para la vigencia actual y, si se cumple la condición de nuevo periodo, uno para una nueva 
                         vigencia. El primer registro siempre debería ser NO nuevo.
            }
     */
    router.post('/', token.checkToken, async function (req, res, next) {
        if (!res.headersSent) {
            try {
                const result = await recordsService.postRecord(await dbCon, req.body,req.decoded.idUsuario)
                if (result) {
                    return res.json(result);
                }
                return res.json({ success: false, message: "No está autorizado para realizar este registro." });
            } catch (error) {
                console.error(error);
                return res.json({ success: false, message: "Ocurrió un error" });
            }

        }
    });
    return router
}

module.exports = records;