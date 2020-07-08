var express = require('express');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var SEED = require('../config/config').SEED;

var app = express();

var Medico = require('../models/medico');


// ===================================================
// Obtener todos los médicos
// ===================================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando médicos',
                    errors: err
                });
            }

            Medico.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    medicos: medicos,
                    total: conteo
                });
            });
        });
});

// ===================================================
// Obtener un medico
// ===================================================
app.get('/:id', mdAutenticacion.verificaToken, (req, res, next) => {

    var id = req.params.id;
    Medico.findById(id)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medico) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando el medico',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                medico: medico,
                usuariotoken: req.usuario
            });
        });
});

// ===================================================
// Actualizar medico
// ===================================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el medico',
                errors: err
            });
        }
        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id: ' + id + 'no existe',
                errors: {
                    message: 'No existe un medico con ese ID'
                }
            });
        }
        medico.nombre = body.nombre;
        medico.img = body.img;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el medico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoGuardado,
                usuariotoken: req.usuario
            });
        });
    });
});

// ===================================================
// Crear un nuevo médico
// ===================================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el medico',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            medico: medicoGuardado,
            usuariotoken: req.usuario
        });
    });
});

// ===================================================
// Borrar un medico por el id
// ===================================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el medico',
                errors: err
            });
        }
        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Medico no encontrado con el id: ' + id,
                errors: {
                    message: 'No existe ningun medico con ese id'
                }
            });
        }
        res.status(200).json({
            ok: true,
            medico: medicoBorrado,
            usuariotoken: req.usuario
        });
    });
});


module.exports = app;