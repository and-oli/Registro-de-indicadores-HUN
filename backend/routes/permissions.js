const express = require('express');
const router = express.Router();
const token = require("../services/token");
const permissionsService = require("../services/permissions");

function users(dbCon) {

    /**
     * Agrega una lista de registros a la tabla USUARIOS_INDICADORES
     * Body: {list: [{idIndicador,idUsuario}*]}
     */
    router.post('/addMultipleUserIndicatorPermissions', async function (req, res) {
        try {
            const result = await permissionsService.addMultipleUserIndicatorPermissions(await dbCon, req.body.list);
            if (result) {
                return res.json({ success: true, message: "Permisos añadidos exitosamente" });
            }
            return res.json({ success: false, message: "Ocurrió un error" });

        } catch (error) {
            console.error(error);
            return res.json({ success: false, message: "Ocurrió un error" });
        }
    });
    /**
     * Agrega una lista de registros a la tabla USUARIOS_INDICADORES
     * Body: {list: [{idUnidad,idUsuario}*]}
     */
    router.post('/addMultipleUserUnitPermissions', async function (req, res) {
        try {
            const result = await permissionsService.addMultipleUserUnitPermissions(await dbCon, req.body.list);
            if (result) {
                return res.json({ success: true, message: "Permisos añadidos exitosamente" });
            }
            return res.json({ success: false, message: "Ocurrió un error" });

        } catch (error) {
            console.error(error);
            return res.json({ success: false, message: "Ocurrió un error" });
        }
    });

    /**
     * Elimina una lista de registros de la tabla USUARIOS_INDICADORES
     * Body: {list: [{idIndicador,idUsuario}*]}
     */
    router.post('/removeMultipleUserIndicatorPermissions', async function (req, res) {
        try {
            const result = await permissionsService.removeMultipleUserIndicatorPermissions(await dbCon, req.body.list);
            if (result) {
                return res.json({ success: true, message: "Permisos eliminados exitosamente" });
            }
            return res.json({ success: false, message: "Ocurrió un error" });

        } catch (error) {
            console.error(error);
            return res.json({ success: false, message: "Ocurrió un error" });
        }
    });

    /**
     * Elimina una lista de registros de la tabla USUARIOS_INDICADORES
     * Body: {list: [{idUnidad,idUsuario}*]}
     */
    router.post('/removeMultipleUserUnitPermissions', async function (req, res) {
        try {
            const result = await permissionsService.removeMultipleUserUnitPermissions(await dbCon, req.body.list);
            if (result) {
                return res.json({ success: true, message: "Permisos eliminados exitosamente" });
            }
            return res.json({ success: false, message: "Ocurrió un error" });

        } catch (error) {
            console.error(error);
            return res.json({ success: false, message: "Ocurrió un error" });
        }
    });
    
    /**
     * Agrega una lista de registros a la tabla LECT_USUARIOS_INDICADORES
     * Body: {list: [{idIndicador,idUsuario}*]}
     */
    router.post('/addMultipleUserIndicatorReadPermissions', async function (req, res) {
        try {
            const result = await permissionsService.addMultipleUserIndicatorReadPermissions(await dbCon, req.body.list);
            if (result) {
                return res.json({ success: true, message: "Permisos añadidos exitosamente" });
            }
            return res.json({ success: false, message: "Ocurrió un error" });

        } catch (error) {
            console.error(error);
            return res.json({ success: false, message: "Ocurrió un error" });
        }
    });
    /**
     * Agrega una lista de registros a la tabla LECT_USUARIOS_INDICADORES
     * Body: {list: [{idUnidad,idUsuario}*]}
     */
    router.post('/addMultipleUserUnitReadPermissions', async function (req, res) {
        try {
            const result = await permissionsService.addMultipleUserUnitReadPermissions(await dbCon, req.body.list);
            if (result) {
                return res.json({ success: true, message: "Permisos añadidos exitosamente" });
            }
            return res.json({ success: false, message: "Ocurrió un error" });

        } catch (error) {
            console.error(error);
            return res.json({ success: false, message: "Ocurrió un error" });
        }
    });

    /**
     * Elimina una lista de registros de la tabla LECT_USUARIOS_INDICADORES
     * Body: {list: [{idIndicador,idUsuario}*]}
     */
    router.post('/removeMultipleUserIndicatorReadPermissions', async function (req, res) {
        try {
            const result = await permissionsService.removeMultipleUserIndicatorReadPermissions(await dbCon, req.body.list);
            if (result) {
                return res.json({ success: true, message: "Permisos eliminados exitosamente" });
            }
            return res.json({ success: false, message: "Ocurrió un error" });

        } catch (error) {
            console.error(error);
            return res.json({ success: false, message: "Ocurrió un error" });
        }
    });

    /**
     * Elimina una lista de registros de la tabla LECT_USUARIOS_INDICADORES
     * Body: {list: [{idUnidad,idUsuario}*]}
     */
    router.post('/removeMultipleUserUnitReadPermissions', async function (req, res) {
        try {
            const result = await permissionsService.removeMultipleUserUnitReadPermissions(await dbCon, req.body.list);
            if (result) {
                return res.json({ success: true, message: "Permisos eliminados exitosamente" });
            }
            return res.json({ success: false, message: "Ocurrió un error" });

        } catch (error) {
            console.error(error);
            return res.json({ success: false, message: "Ocurrió un error" });
        }
    });
    return router
}

module.exports = users;
