
// ===================
//  Puerto
// ===================
process.env.PORT = process.env.PORT || 3000;

// ===================
//  Vencimiento del Token
// ===================
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;

// ===================
//  Seed de autenticación
// ===================
process.env.SEED = process.env.SEED || 'este es el seed-desarrollo';

// ===================
//  Entorno
// ===================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// ===================
//  Base de datos
// ===================
let urlDB;

if ( process.env.NODE_ENV === 'dev' ) {

    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    
    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;

// ===================
//  Google Client ID
// ===================
process.env.CLIENT_ID = process.env.CLIENT_ID || '102381958885-bbr94o24nm22sr92gvi8mofr7h0do77o.apps.googleusercontent.com';