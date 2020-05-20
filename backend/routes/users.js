const express = require('express');
const router = express.Router();
const token = require("../services/token");
const userService = require("../services/users");

function users(dbCon) {

    router.get('/', token.checkToken, async function (req, res, next) {
        try {
            const users = await userService.getUsers(await dbCon);
            return res.json({ success: true, users, message: "" });

        } catch (error) {
            console.error(error);
            return res.json({ success: false, message: "Ocurrió un error" });
        }
    });
    
    router.get('/employees', token.checkToken, async function (req, res, next) {
        try {
            const users = await userService.getEmployeesFull(await dbCon);
            return res.json({ success: true, users, message: "" });

        } catch (error) {
            console.error(error);
            return res.json({ success: false, message: "Ocurrió un error" });
        }

    });
    /**
     * Agrega un nuevo usuario
     */
    router.post('/', async function (req, res) {
        try {
            if (await userService.getUserByUsername(await dbCon, req.body.username)) {
                return res.json({ success: false, message: "Ya existe un usuario con ese username" });
            }
            const passCopy = req.body.password + "";
            const result = await userService.postUser(await dbCon, req.body);
            if (result) {
                req.body.password = passCopy;
                return token.getToken(await dbCon, req, res)
            } else {
                return res.json({ success: false, message: "Ocurrió un error" });
            }
        } catch (error) {
            console.error(error);
            return res.json({ success: false, message: "Ocurrió un error" });
        }
    });
    /**
     * Agrega un registro a la tabla USUARIOS_INDICADORES
     * Body: {idIndicador,idUsuario}
     */
    router.post('/addUserIndicatorPermission', async function (req, res) {
        try {
            const result = await userService.addUserIndicatorPermission(await dbCon, req.body);
            if (result) {
                return res.json({ success: true, message: "Permiso añadido exitosamente" });
            }
            return res.json({ success: false, message: "Ocurrió un error" });

        } catch (error) {
            console.error(error);
            return res.json({ success: false, message: "Ocurrió un error" });
        }
    });
    /**
     * Agrega un registro a la tabla USUARIOS_UNIDADES
     * Body: {idUnidad,idUsuario}
     * 
     */
    router.post('/addUserUnitPermission', async function (req, res) {
        try {
            const result = await userService.addUserUnitPermission(await dbCon, req.body);
            if (result) {
                return res.json({ success: true, message: "Permiso añadido exitosamente" });
            }
            return res.json({ success: false, message: "Ocurrió un error" });

        } catch (error) {
            console.error(error);
            return res.json({ success: false, message: "Ocurrió un error" });
        }
    });

    router.post("/authenticate", async function (req, res) {
        token.getToken(await dbCon, req, res);
    });
    return router
}

module.exports = users;
