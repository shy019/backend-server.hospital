 // Requires
 var express = require('express');
 var mongoose = require('mongoose');


 // Inicializar Variables
 var app = express();


 // Conexión a la base de datos
 mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', ( err, res) => {
    if( err ) throw err;
    
    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'Online');
 });


 // Rutas
 app.get('/', (req, res, next) => {

     res.status(200).json({
         ok: true,
         mensaje: 'Petición realizada correctamente'
     });

 });


 // Escuchar Peticiones
 app.listen(3000, () => {
     console.log('Express Server en el puerto 3000: \x1b[32m%s\x1b[0m', 'Online');
 })