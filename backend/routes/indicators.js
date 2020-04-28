const express = require('express');
const router = express.Router();
const token = require("../services/token");
const indicatorService = require("../services/indicators");

function indicators(dbCon) {

     /**
     * Retorna los indicadores 
     */
    router.get('/', token.checkToken, async function (req, res, next) {
        try {
            const indicadores = await indicatorService.getIndicators(await dbCon)
            return res.json({ success: true, indicadores, message: "" });
        } catch (error) {
            console.error(error);
            return res.json({ success: false, message: "Ocurrió un error" });
        }

    });

    /**
     * Retorna los indicadores bajo una unidad, dado el id de la unidad, en forma {idIndicador,nombre}
     */
    router.get('/names/:unitId', token.checkToken, async function (req, res, next) {
        try {
            if (!req.params.unitId) {
                return res.json({ success: false, message: "Debe ingresar un id de unidad" });
            }
            const indicadores = await indicatorService.getIndicatorsNamesByUnitId(await dbCon, req.params.unitId)
            return res.json({ success: true, indicadores, message: "" });
        } catch (error) {
            console.error(error);
            return res.json({ success: false, message: "Ocurrió un error" });
        }

    });

    /**
     * Retorna un indicador dado su id.
     */
    router.get('/:indicatorId', token.checkToken, async function (req, res, next) {
        try {
            if (!req.params.indicatorId) {
                return res.json({ success: false, message: "Debe ingresar un id de indicador" });
            }
            const indicador = await indicatorService.getIndicatorById(await dbCon, req.params.indicatorId)
            if(indicador){
                return res.json({ success: true, indicador, message: "" });
            }
            return res.json({ success: false, message: "No hay indicadores con ese ID" });
        } catch (error) {
            console.error(error);
            return res.json({ success: false, message: "Ocurrió un error" });
        }

    });
    /**
     * Modifica un indicador
     */
    router.put('/', (req, res, next) => token.checkTokenAdmin(req, res, next, true), async function (req, res, next) {
        try {
            const indicador = await indicatorService.updateIndicator(await dbCon, req.body)
            if(indicador){
                return res.json({ success: true, indicador, message: "Indicador actualizado" });
            }
            return res.json({ success: false, message: "No hay indicadores con ese ID" });
        } catch (error) {
            console.error(error);
            return res.json({ success: false, message: "Ocurrió un error" });
        }

    });

    router.post('/', (req, res, next) => token.checkTokenAdmin(req, res, next, true), async function (req, res, next) {
        if (!res.headersSent) {
            try {
                if (await indicatorService.getIndicatorByNameAndUnitId(await dbCon, req.body.nombre, req.body.idUnidad)) {
                    return res.json({ success: true, message: "Ya existe un indicador con ese nombre en esa unidad" });
                }
                const result = await indicatorService.postIndicator(await dbCon, req.body)
                if (!result) {
                    return res.json({ success: false, message: "Ocurrió un error" });
                }
                return res.json({ success: true, message: "Nuevo indicador ingresado exitosamente." });
            } catch (error) {
                console.error(error);
                return res.json({ success: false, message: "Ocurrió un error" });
            }

        }
    });
    /**
     * Retorna la siguiente vigencia de un indicador de acuerdo a su periodicidad,
     * dado su id
     */
    router.get('/currentAndNextPeriodDates/:idIndicador', token.checkToken, async function (req, res) {
        if (!res.headersSent) {
            try {
                const nextPeriod = await indicatorService.getCurrentAndNextPeriodDates(await dbCon, req.params.idIndicador)
                return res.json({ success: true, nextPeriod, message: "" });
            } catch (error) {
                console.error(error);
                return res.json({ success: false, message: "Ocurrió un error" });
            }
        }
    });

    /**
     * Retorna las posibles periodicidaes que pueden tener los indicadores.
     * Es decir, las que están disponibles en la tabla PERIODOS
     */
    router.get('/periods', token.checkToken, async function (req, res, next) {
        if (!res.headersSent) {
            try {
                const periodos = await indicatorService.getPeriods(await dbCon)
                return res.json({ success: true, periodos, message: "" });
            } catch (error) {
                console.error(error);
                return res.json({ success: false, message: "Ocurrió un error" });
            }
        }
    });
    return router
}

module.exports = indicators;
