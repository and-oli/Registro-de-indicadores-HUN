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
    router.post('/', async function (req, res) {
        try {
            if (await userService.getUserByUsername(await dbCon, req.body.username)) {
                return res.json({ success: false, message: "Ya existe un usuario con ese username" });
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
    router.post("/authenticate", async function (req, res) {
        token.getToken(await dbCon, req, res);
    });
    return router
}

module.exports = users;
