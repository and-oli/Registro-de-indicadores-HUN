const express = require('express');
const router = express.Router();
const token = require("../services/token");
const accessService = require("../services/accesses");

function accesses(dbCon) {
    /**
     * Retorna los accesos que tiene un usuario a un indicador
     */
    router.get('/:indicatorId/:userId', token.checkToken, async function (req, res, next) {
        try {
            if (!req.params.userId || !req.params.indicatorId) {
                return res.json({ success: false, message: "Debe ingresar un id de usuario y uno de indicador" });
            }
            const accesos =
                await accessService.getAccessesByIndicatorIdAndUserId(await dbCon, req.params.indicatorId, req.params.userId);
            return res.json({ success: true, accesos, message: "" });
        } catch (error) {
            console.error(error);
            return res.json({ success: false, message: "Ocurrió un error" });
        }

    });

    router.get('/hostoricInfo', token.checkToken, async function (req, res, next) {
        try {
            const accesos = await accessService.getAccessesHistory(await dbCon);
            return res.json({ success: true, accesos, message: "" })
        } catch (error) {
            console.log(error);
            return res.json({ success: false, message: "Ocurrió un error" })
        }
    })

    /**
     * Ingresa un nuevo acceso y cambia el estado de una solicitud a APROBADA.
     * Body: {idUsuario, // A quien se autoriza
            idIndicador,
            idSolicitud 
            fechaInicio,
            fechaFin, 
        }
     */
    router.post('/', (req, res, next) => token.checkTokenAdmin(req, res, next, true), async function (req, res, next) {
        if (!res.headersSent) {
            try {
                const result = await accessService.postAccess(await dbCon, req.body)
                if (result) {
                    return res.json({ success: true, message: "Acceso registrado!" });
                }
                return res.json({ success: false, message: "Ocurrió un error" });
            } catch (error) {
                console.error(error);
                return res.json({ success: false, message: "Ocurrió un error" });
            }

        }
    });

     /**
     * Elimina una lista de accesos de la tabla ACCESOS
     * Body: {list: [idAcceso]}
     */
    router.post('/removeMultipleAccesses', async function (req, res) {
        try {
            const result = await accessService.removeMultipleAccesses(await dbCon, req.body.list);
            if (result) {
                return res.json({ success: true, message: "Accesos eliminados exitosamente" });
            }
            return res.json({ success: false, message: "Ocurrió un error" });

        } catch (error) {
            console.error(error);
            return res.json({ success: false, message: "Ocurrió un error" });
        }
    });
    return router
}

module.exports = accesses;
