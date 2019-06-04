const express = require('express');

const { verificaToken } = require('../middlewares/autenticacion');

const app = express();

const Producto = require('../models/producto');

const _ = require('underscore');

// ===================
//  GET: mostrar todas los productos
// ===================
app.get('/productos', verificaToken, ( req, res ) => {
    
    let desde = req.query.desde || 0;
    desde = Number(desde);
    let limite = req.query.limite || 0;
    limite = Number(limite);

    Producto
        .find({ disponible: true })
        .skip( desde )
        .limit( limite )
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec( ( err, productosDB ) => {

            if ( err ) {

                res.status(500).json({
                    ok: false,
                    err
                });
            }

            Producto.count( { disponible: true }, ( err, total ) => {

                res.json({
                    ok: true,
                    productos: productosDB,
                    total_objectos: total
                });
            });

        })

})

// ===================
//  GET: mostrar un producto por ID
// ===================
app.get('/producto/:id', verificaToken, ( req, res ) => {

    const id = req.params.id;

    Producto
        .findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec( ( err, productoDB ) => {
            if ( err ) {

                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if ( !productoDB ) {

                return res.status(404).json({
                    ok: false,
                    err: {
                        mensaje: `No se encontro el producto con el ID: ${ id }`
                    }
                });
            }

            res.json({
                ok: true,
                producto: productoDB
            });

        });

    });

// ===================
//  DELETE: borrar un producto
// ===================
app.get('/productos/buscar/:termino', verificaToken, ( req, res ) => {
   
    const termino = req.params.termino;
    const regex = new RegExp( termino, 'i' );

    Producto
        .find({ nombre: regex })
        .populate('categoria', 'nombre')
        .exec( ( err, productosDB ) => {

            if ( err ) {

                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productosDB
            });
        });

});

// ===================
//  POST: crear un producto
// ===================
app.post('/producto', verificaToken, ( req, res ) => {

    const body = req.body;
    const producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria,
        usuario: req.usuario,
        disponible
    });

    producto.save( ( err, productoDB ) => {

        if ( err ) {

            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });

    });

});

// ===================
//  PUT: actualizar un producto
// ===================
app.put('/producto/:id', verificaToken, ( req, res ) => {

    const id = req.params.id;
    const body = _.pick( req.body, [ 'nombre', 'precioUni', 'descripcion', 'categoria' ] );

    Producto
        .findByIdAndUpdate( id, body, { new: true, runValidators: true } )
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec( ( err, productoDB ) => {

            if ( err ) {

                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: productoDB
            });

        });

});

// ===================
//  DELETE: borrar un producto
// ===================
app.delete('/producto/:id', verificaToken, ( req, res ) => {

    const id = req.params.id;

    Producto
        .findByIdAndUpdate( id, { disponible: false }, { new: true, runValidators: true } )
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec( ( err, productoDB ) => {

            if ( err ) {

                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: productoDB
            });

        });

});

module.exports = app;