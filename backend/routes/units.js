const express = require('express');
const router = express.Router();
const token = require("../services/token");
const unitService = require("../services/units");

function units(dbCon) {

    router.get('/', token.checkToken, async function (req, res, next) {
        if (!res.headersSent) {

            try {
                const unidades = await unitService.getUnits(await dbCon);
                return res.json({ success: true, unidades, message: "" });

            } catch (error) {
                console.error(error);
                return res.json({ success: false, message: "Ocurrió un error" });
            }

        }
    });
    router.post('/', (req, res, next) => token.checkTokenAdmin(req, res, next, true), async function (req, res) {
        if (!res.headersSent) {
            try {
                if (await unitService.getUnitByName(await dbCon, req.body.nombre)) {
                    return res.json({ success: false, message: "Ya existe una unidad con ese nombre" });
                }
                const result = await unitService.postUnit(await dbCon, req.body);
                if (result) {
                    return res.json({ success: true, message: "Unidad añadida exitosamente, refresque la aplicación." });
                } else {
                    return res.json({ success: false, message: "Ocurrió un error" });

                }

            } catch (error) {
                console.error(error);
                return res.json({ success: false, message: "Ocurrió un error" });
            }

        }
    });
    router.delete('/:unitId', (req, res, next) => token.checkTokenAdmin(req, res, next, true), async function (req, res) {
        if (!res.headersSent) {
            try {
                if (await unitService.deleteUnit(await dbCon, req.params.unitId)) {
                    return res.json({ success: true, message: "Unidad eliminada exitosamente, refresque la aplicación." });
                } else {
                    return res.json({ success: false, message: "Ocurrió un error" });
                }

            } catch (error) {
                console.error(error);
                return res.json({ success: false, message: "Ocurrió un error" });
            }

        }
    });
    return router
}

module.exports = units;
