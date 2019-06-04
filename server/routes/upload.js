const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const fs = require('fs');
const path = require('path');

// default options
app.use( fileUpload({ useTempFiles : true }) );

app.put('/upload/:tipo/:id', ( req, res ) => {

    const { tipo, id } = req.params;

    // Valida tipo
    const tiposValidos = [ 'productos', 'usuarios' ];

    if ( !tiposValidos.includes( tipo ) ) {

        return res.status(400).json({
            ok: false,
            err: {
                message: `Los tipos válidos son ${ tiposValidos.join(', ') }`
            }
        });
    }

    if ( !req.files ) {

        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se ha seleccionado ningún archivo'
            }
        })
    }

    const archivo = req.files.archivo;

    // Extensiones permitidas
    const extensionesValidas = [ 'png', 'jpg', 'gif', 'jpeg' ];
    const nombreArchivoArray = archivo.name.split('.');
    const extension = nombreArchivoArray[ nombreArchivoArray.length - 1 ];

    if ( !extensionesValidas.includes( extension ) ) {

        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones permitidas son ' + extensionesValidas.join(', ')
            }
        });
    }

    // Nombre de archivo único
    const nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extension }`;

    archivo.mv(`uploads/${ tipo }/${ nombreArchivo }`, err => {

        if ( err ) {

            return res.status(500).json({
                ok: false,
                err
            });
        }

        tipo === 'usuarios'
            ? imagenUsuario( id, res, nombreArchivo )
            : imagenProducto( id, res, nombreArchivo );

        /* res.json({
            ok: true,
            message: 'Imagen subida correctamente'
        }); */

    });

});

function imagenUsuario( id, res, nombreArchivo ) {
    
    Usuario.findById( id, ( err, usuarioDB ) => {

        if ( err ) {

            borraArchivo( nombreArchivo, 'usuarios' ); 
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if ( !usuarioDB ) {

            borraArchivo( nombreArchivo, 'usuarios' ); 
            return res.status(400).json({
                ok: false,
                err: {
                    message: `Usuario con id ${ id } no existe`
                }
            })
        }

        borraArchivo( usuarioDB.img, 'usuarios' );        

        usuarioDB.img =  nombreArchivo;

        usuarioDB.save( ( err, usuarioGuardado ) => {

            res.json({
                ok: true,
                usuario: usuarioGuardado
            });

        })

    })

}

function imagenProducto( id, res, nombreArchivo ) {
    
    Producto.findById( id, ( err, productoDB ) => {

        if ( err ) {

            borraArchivo( nombreArchivo, 'productos' ); 
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if ( !productoDB ) {

            borraArchivo( nombreArchivo, 'productos' ); 
            return res.status(400).json({
                ok: false,
                err: {
                    message: `Producto con id ${ id } no existe`
                }
            })
        }

        borraArchivo( productoDB.img, 'productos' );        

        productoDB.img =  nombreArchivo;

        productoDB.save( ( err, productoGuardado ) => {

            res.json({
                ok: true,
                producto: productoGuardado
            });

        })

    })
}

function borraArchivo( nombreImagen, tipo ) {
    
    const pathImagen = path.resolve( __dirname, `../../uploads/${ tipo }/${ nombreImagen }` ); 

    if ( fs.existsSync( pathImagen ) ) {
        
        fs.unlinkSync( pathImagen );
    }
}

module.exports = app;