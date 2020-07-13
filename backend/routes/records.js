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
     * Retorna un objeto que determina si un usuario tiene acceso vigente para ingresar un registro
     * de un indicador dado el id del usuario (en el token) y del indicador.
     */
    router.get('/userCanPostRecord/:indicatorId', token.checkToken, async function (req, res, next) {
        try {
            if (!req.params.indicatorId) {
                return res.json({ success: false, message: "Debe ingresar un id de indicador" });
            }
            const record = { idIndicador: req.params.indicatorId, idUsuario: req.decoded.idUsuario };
            const result =
                await recordsService.userCanPostRecord(await dbCon, record);
            if (result.message) {
                return res.json({ success: true, result: false, accessMessage: result.message, message: "" });
            } else {
                return res.json({ success: true, result, message: "" });
            }
        } catch (error) {
            console.error(error);
            return res.json({ success: false, message: "Ocurrió un error" });
        }

    });
    /**
     * Ingresa un nuevo registro.
     * body: {
            idIndicador,
            analisisCualitativo,
            accionMejora,
            valor,
            numerador,
            denominador,
            ano,
            nombrePeriodo,
            }
     */
    router.post('/', token.checkToken, async function (req, res, next) {
        if (!res.headersSent) {
            try {
                const result = await recordsService.postRecord(await dbCon, req.body, req.decoded.idUsuario)
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