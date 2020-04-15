const jwt = require("jsonwebtoken");
const superSecret = require("../config/config").tokenConfig.superSecret;
const userService = require('../services/users');
const bcrypt = require('bcrypt');

module.exports = {
    checkToken: function (req, res, next) {
        const token = req.body.token || req.query.token || req.headers["x-access-token"];
        if (token) {
            jwt.verify(token, superSecret, function (err, decoded) {
                if (err)
                    return res.status(403).send({ success: false, message: "Error de autenticación, por favor refresque la aplicación." });
                else{
                    req.decoded = decoded;
                }
            });
        } else {
            return res.status(403).send({
                success: false,
                message: "No tiene permiso para acceder."
            });
        }
        next()
    },

    checkTokenAdmin: function (req, res, next, admin) {
        const token = req.body.token || req.query.token || req.headers["x-access-token"];
        if (token) {
            jwt.verify(token, superSecret, function (err, decoded) {
                if (err)
                    return res.status(403).send({ success: false, message: "Error de autenticación, por favor refresque la aplicación." });
                else if (admin && decoded.rol !== "ADMINISTRADOR"){
                    return res.status(403).send({
                        success: false,
                        message: "No tiene permiso para hacer esta accion."
                    });
                }
                else{
                    req.decoded = decoded;
                }
            });
        } else {
            return res.status(403).send({
                success: false,
                message: "No tiene permiso para acceder."
            });
        }
        next()
    },

    getToken: async function (dbCon, req, res) {
        try {
            const result = await userService.getUserByUsername(dbCon, req.body.username);
            // El usuario no existe
            if (!result) {
                res.json({
                    success: false,
                    message: "Usuario incorrecto"
                });
            } else {
                // Revisar si la contraseña coincide
                const validPassword = bcrypt.compareSync(req.body.password, result.password);
                if (!validPassword) {
                    res.json({
                        success: false,
                        message: "Contraseña incorrecta"
                    });
                } else {
                    // Las credenciales son correctas
                    // crear un token
                    var token = jwt.sign({
                        idUsuario: result.idUsuario,
                        nombre: result.nombre,
                        apellidos: result.apellidos,
                        username: result.username,
                        rol: result.rol,
                        unidad: result.unidad,
                    }, superSecret, {
                        expiresIn: '24h'
                    });
                    res.json({
                        success: true,
                        idUsuario: result.idUsuario,
                        message: "Disfrute el token",
                        token
                    });
                }

            }
        } catch (error) {
            console.error(error);
            res.status(status.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Ocurrió un error"
            });
        }
    }
}
