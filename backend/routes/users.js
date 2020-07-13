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
     * Body: { username, password, nombre, apellidos, idRol, permissions}
     * Si idRol no está presente, se le asigna al usuario el id de rol correspondiente a empleado
     */
    router.post('/', (req, res, next) => token.checkTokenAdmin(req, res, next, true), async function (req, res) {
        try {
            let currentUser = await userService.getUserByUsername(await dbCon, req.body.username)
            if (currentUser) {
                if(!currentUser.activo){
                    const result = await userService.activateUser(await dbCon, currentUser.idUsuario);
                    if (result) {
                        return res.json({ success: true, message: "El usuario con esa cédula fue reactivado (los nuevos permisos se omitieron). Refresque la aplicación" });
                    } else {
                        return res.json({ success: false, message: "Ocurrió un error" });
                    }
                } else {
                    return res.json({ success: false, message: "Ya existe un usuario con esa cédula." });
                }
            }
            const passCopy = req.body.password + "";
            const result = await userService.postUser(await dbCon, req.body);
            if (result) {
                req.body.password = passCopy;
                return res.json({ success: true, message: "¡Usuario creado!" });
            } else {
                return res.json({ success: false, message: "Ocurrió un error" });
            }
        } catch (error) {
            console.error(error);
            return res.json({ success: false, message: "Ocurrió un error" });
        }
    });
    /**
     * Cambia la contraseña
     * Body: {  currentPassword, newPassword}
     */
    router.post('/changePassword', token.checkToken, async function (req, res) {
        try {
            userService.changePassword(await dbCon, req.decoded.username, req.body, res);
        } catch (error) {
            console.error(error);
            return res.json({ success: false, message: "Ocurrió un error" });
        }
    });
    /**
     * Desactiva un usuario
     */
    router.get('/deactivate/:userId', (req, res, next) => token.checkTokenAdmin(req, res, next, true), async function (req, res) {
        try {
            const result = await userService.deactivateUser(await dbCon, req.params.userId);
            if (result) {
                return res.json({ success: true, message: "¡Usuario eliminado! Refresque la aplicación." });
            } else {
                return res.json({ success: false, message: "Ocurrió un error" });
            }
            
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
