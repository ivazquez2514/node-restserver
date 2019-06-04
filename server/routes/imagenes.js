const express = require('express');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const fs = require('fs');
const path = require('path');

const { verificaToken } = require('../middlewares/autenticacion');

app.get('/imagen/:tipo/:img', verificaToken, ( req, res ) => {

    const { tipo, img } = req.params;

    const pathImagen = path.resolve( __dirname, `../../uploads/${ tipo }/${ img }` ); 
    const noImagenPath = path.resolve( __dirname, '../assets/no-image.jpg' );

    if ( fs.existsSync( pathImagen ) ) {

        res.sendFile( pathImagen );
    } else {
        
        res.sendFile( noImagenPath );
    }



});

module.exports = app;
