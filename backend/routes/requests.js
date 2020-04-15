const express = require('express');
const router = express.Router();
const token = require("../services/token");
const requestService = require("../services/requests");

function requests(dbCon) {
    /**
     * Retorna las solicitudes hechas a un usuario dado su id
     */
    router.get('/by/:userId', token.checkToken, async function (req, res, next) {
        try {
            if (!req.params.userId ) {
                return res.json({ success: false, message: "Debe ingresar un id de usuario" });
            }
            const solicitudes =
                await requestService.getRequestsByUser(await dbCon, req.params.userId);
            return res.json({ success: true, solicitudes, message: "" });
        } catch (error) {
            console.error(error);
            return res.json({ success: false, message: "Ocurrió un error" });
        }

    });

    /**
     * Retorna las solicitudes hechas por un usuario dado su id
     */
    router.get('/to/:userId', token.checkToken, async function (req, res, next) {
        try {
            if (!req.params.userId ) {
                return res.json({ success: false, message: "Debe ingresar un id de usuario" });
            }
            const solicitudes =
                await requestService.getRequestsToUser(await dbCon, req.params.userId);
            return res.json({ success: true, solicitudes, message: "" });
        } catch (error) {
            console.error(error);
            return res.json({ success: false, message: "Ocurrió un error" });
        }

    });

    /**
     * Cambia el estado de una solicitud a RECHAZADA
     */
    router.get('/reject/:idSolicitud', token.checkToken, async function (req, res, next) {
        try {
            if (!req.params.idSolicitud ) {
                return res.json({ success: false, message: "Debe ingresar un id de solicitud" });
            }
            const result =
                await requestService.updateRequest (await dbCon, req.params.idSolicitud, false);
            return res.json({ success: true, result, message: "" });
        } catch (error) {
            console.error(error);
            return res.json({ success: false, message: "Ocurrió un error" });
        }

    });
    /**
     * Ingresa una nueva solicitud.
     * Body:
     * {
            idSolicitante, 
            idAdministrador,
            idIndicador, 
            idEstado, 
            fechaInicio, 
            fechaFin, 
            comentario, 
        }
     */
    router.post('/', (req, res, next) => token.checkTokenAdmin(req, res, next, true), async function (req, res, next) {
        if (!res.headersSent) {
            try {
                const result = await requestService.postRequest(await dbCon, req.body)
                if (result) {
                    return res.json({ success: true, message: "Solicitud registrada!" });
                }
                return res.json({ success: false, message: "Ocurrió un error" });
            } catch (error) {
                console.error(error);
                return res.json({ success: false, message: "Ocurrió un error" });
            }

        }
    });
    return router
}

module.exports = requests;
