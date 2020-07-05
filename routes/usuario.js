var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Usuario = require('../models/usuario');
const {
    schema
} = require('../models/usuario');
const {
    mquery
} = require('mongoose');

// ===================================================
// Obtener todos los usuarios
// ===================================================
app.get('/', mdAutenticacion.verificaToken,  (req, res, next) => {

    Usuario.find({}, 'nombre email img role')
        .exec((err, usuarios) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando usuarios',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                usuarios: usuarios,
                usuariotoken: req.usuario
            });
        });
});

// ===================================================
// Verificar token
// ===================================================
/*app.use('/', (req, res, next) => {

    var token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }
        next();
    })
}) Es una forma de realizar la autenticación del token pero muy mala
*/

// ===================================================
// Obtener un usuario
// ===================================================
app.get('/:id', mdAutenticacion.verificaToken, (req, res, next) => {

    var id = req.params.id;
    Usuario.findById(id, 'nombre email img role')
        .exec((err, usuario) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando el usuario',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                usuario: usuario,
                usuariotoken: req.usuario
            });
        });
});

// ===================================================
// Actualizar usuario
// ===================================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id: ' + id + 'no existe',
                errors: {
                    message: 'No existe un usuario con ese ID'
                }
            });
        }
        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = '';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado,
                usuariotoken: req.usuario
            });
        });
    });
});

// ===================================================
// Crear un nuevo usuario
// ===================================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuariotoken: req.usuario
        });
    });
});

// ===================================================
// Borrar un usuario por el id
// ===================================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Usuario no encontrado con el id: ' + id,
                errors: {
                    message: 'No existe ningun usuario con ese id'
                }
            });
        }
        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado,
            usuariotoken: req.usuario
        });
    });
});


module.exports = app;