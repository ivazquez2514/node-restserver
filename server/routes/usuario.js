const express = require('express');
const bcrypt = require('bcrypt');
const app = express();
const Usuario = require('../models/usuario');
const _ = require('underscore');
const { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');

app.get('/usuario', verificaToken, function( req, res ) {

    let desde = req.query.desde || 0;
    desde = Number(desde);
    let limite = req.query.limite || 0;
    limite = Number(limite);

    Usuario.find( { estado: true }, 'nombre email google role estado img' )
            .skip( desde )
            .limit( limite )
            .exec( ( err, usuarios ) => {

                if ( err ) {

                    return res.status( 400 )
                                .json({
                                    ok: false,
                                    err
                                });
                }

                Usuario.count( { estado: true }, ( err, conteo ) => {

                    res.json({
                        ok: true,
                        usuarios,
                        total_objetos: conteo
                    });
                })

            });
});

app.post('/usuario', [ verificaToken, verificaAdminRole ], function( req, res ) {

    const body = req.body;
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync( body.password, 10 ),
        role: body.role,
    });

    usuario.save( ( err, usuarioDB ) => {

        if ( err ) {

            return res.status( 400 )
                        .json({
                            ok: false,
                            err
                        });
        }

        return res.json({
            ok: true,
            usuario: usuarioDB
        })

    });

});

app.put('/usuario/:id', [ verificaToken, verificaAdminRole ], function( req, res ) {

    let id = req.params.id;
    let body = _.pick( req.body, [ 'nombre',
                                    'email',
                                    'img',
                                    'role',
                                    'estado' ] );

    Usuario.findByIdAndUpdate( id, body, { new: true, runValidators: true }, ( err, usuarioDB ) => {

        if ( err ) {
            
            return res.status( 400 )
                        .json({
                            ok: false,
                            err
                        })
        }
        
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });

});

app.delete('/usuario/:id', [ verificaToken, verificaAdminRole ], function( req, res ) {

    let id = req.params.id;
    let body = { estado: false };

    Usuario.findByIdAndUpdate( id, body, { new: true }, ( err, usuarioBorrado ) => {

        if ( err ) {

            return res.status( 400 )
                        .json({
                            ok: false,
                            err
                        });
        }
        
        if ( !usuarioBorrado ) {

            return res.status( 400 )
                        .json({
                            ok: false,
                            err: {
                                message: 'Usuario no encontrado'
                            }
                        });
        }

        res.json({
            ok: true,
            usuario: usuarioBorrado
        });

    })
    
});

module.exports = app;