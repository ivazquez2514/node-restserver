const express = require('express');

const { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');

const app = express();

const Categoria = require('../models/categoria');


// ===================
//  GET: mostrar todas las categorias
// ===================
app.get('/categorias', verificaToken, function( req, res ) {

    Categoria.find()
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec( ( err, categorias ) => {

            if ( err ) {

                return res.json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                categorias
            });

        })

});

// ===================
//  GET: Mostrar una categoria por ID
// ===================
app.get('/categoria/:id', verificaToken, function( req, res ) {

    const { id } = req.params;

    Categoria.findById( id, ( err, categoriaDB ) => {

        if ( err ) {

            return res.status(400).json({
                ok: false,
                err
            });
        }

        if ( !categoriaDB ) {

            return res.status(404).json({
                ok: false,
                err: {
                    mensaje: 'El id no existe'
                }
            });
        }

        res.json({
            ok: true,
            categoriaDB
        })
    })
});

// ===================
//  POST: Crear nueva categoria
// ===================
app.post( '/categoria', verificaToken, function( req, res ) {

    const { descripcion } = req.body;
    const categoria = new Categoria({
        descripcion,
        usuario: req.usuario
    });

    categoria.save( ( err, categoriaDB ) => {
        
        if ( err ) {

            return res.status(500).json({
                ok: false,
                err
            });
        }

        if ( !categoriaDB ) {

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'No se pudo crear la categoría'
                }
            });
        }

        res.json({
            ok: true,
            categoriaDB
        })

    });

});

// ===================
//  PUT: Actualizar categoria
// ===================
app.put('/categoria/:id', verificaToken, function( req, res ) {

    const { id } = req.params;
    const { descripcion } = req.body;

    Categoria.findByIdAndUpdate( id, { descripcion }, { new: true, runValidators: true }, function( err, categoriaDB ) {

        if ( err ) {

            return res.status(400).json({
                ok: false,
                err
            });
        }

        if ( !categoriaDB ) {

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'No se pudo crear la categoría'
                }
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });

});

// ===================
//  DELETE: Eliminar categoria (Solo un administador puede eliminar una categoria)
// ===================
app.delete('/categoria/:id',  [ verificaToken, verificaAdminRole ], function( req, res ) {

    const { id } = req.params;

    Categoria.findByIdAndRemove( id, ( err, categoriaDB ) => {

        if ( err ) {

            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoriaDB
        });

    })

});


module.exports = app;