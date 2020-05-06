const express = require('express');
const router = express.Router();
const token = require("../services/token");
const requestService = require("../services/requests");

function requests(dbCon) {
    /**
     * Retorna las solicitudes hechas por un usuario dado su id
     */
    router.get('/by/:userId', token.checkToken, async function (req, res, next) {
        try {
            if (!req.params.userId) {
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
     * Retorna las solicitudes en espera
     */
    router.get('/onHold', token.checkToken, async function (req, res, next) {
        try {
            const solicitudes =
                await requestService.getRequestsOnhold(await dbCon);
            return res.json({ success: true, solicitudes, message: "" });
        } catch (error) {
            console.error(error);
            return res.json({ success: false, message: "Ocurrió un error" });
        }

    });

    /** 
     * Retorna los usuarios con solicitudes en espera y el respectivo indicador al cual solicitó acceso
    */
   router.get('/onHold/usersIndicators/:idEstado', token.checkToken, async function (req, res, next) {
        try {
            const solicitudes =
                await requestService.getUsersAndIndicatorsWithRequestsOnHold(await dbCon, req.params.idEstado);
            return res.json({ success: true, solicitudes, message: "" });
        } catch (error) {
            console.error(error);
            return res.json({ success: false, message: "Ocurrió un error" });
        }
    });

    /**
     * Cambia el estado de una solicitud a RECHAZADA
     */
    router.put('/reject/:idSolicitud', token.checkToken, async function (req, res, next) {
        try {
            if (!req.params.idSolicitud) {
                return res.json({ success: false, message: "Debe ingresar un id de solicitud" });
            }
            const result =
                await requestService.updateRequest(await dbCon, req.params.idSolicitud, false);
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
            idIndicador, 
            comentario, 
        }
     */
    router.post('/', (req, res, next) => token.checkTokenAdmin(req, res, next, true), async function (req, res, next) {
        if (!res.headersSent) {
            try {
                const result = await requestService.postRequest(await dbCon, req.body)
                res.json(result);
            } catch (error) {
                console.error(error);
                return res.json({ success: false, message: "Ocurrió un error" });
            }

        }
    });
    /**
     * Verifica si una solicitud ya se ha ingresado
     * Body:
     * {
            idIndicador
        }
     */
    router.post('/requestExists', token.checkToken, async function (req, res, next) {
        if (!res.headersSent) {
            try {
                req.body.idSolicitante =  req.decoded.idUsuario
                const requestExists = await requestService.requestExists(await dbCon, req.body)
                return res.json({ success: true, requestExists, message: "" });
            } catch (error) {
                console.error(error);
                return res.json({ success: false, message: "Ocurrió un error" });
            }

        }
    });

    return router
}

module.exports = requests;
