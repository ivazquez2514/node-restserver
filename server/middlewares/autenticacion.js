const jwt = require('jsonwebtoken');

// ===================
//  Verificar Token
// ===================
const verificaToken = ( req, res, next ) => {

    const token = req.get('Authorization');

    jwt.verify( token, process.env.SEED, ( err, decoded ) => {

        if ( err ) {

            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            })
        }

        req.usuario = decoded.usuario;
        next();

    });

};

// ===================
//  Verificar Admin Role
// ===================
const verificaAdminRole = ( req, res, next ) => {

    const usuario = req.usuario;

    if ( usuario.role === 'ADMIN_ROLE' ) {

        next();
    } else {

        return res.status(401).json({
            ok: false,
            err: {
                message: 'El usuario no es admistrador'
            }
        });
    }

};

module.exports = {
    verificaToken,
    verificaAdminRole
};