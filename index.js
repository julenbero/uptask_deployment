const express = require('express');
const routes = require('./routes');
const path = require('path');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('./config/passport');
require('dotenv').config({ path: 'variables.env' });

//Helpers con algunas funciones
const helpers = require('./helpers');

//Crear la conexion a la base de datos
const db = require('./config/db');
const { Session } = require('inspector');

//Importar los modelos
require('./models/Proyectos');
require('./models/Tareas');
require('./models/Usuarios');

db.sync().then(() => console.log('Conectado a la Base de Datos')).catch((error) => console.error(error));

const app = express();
const port = process.env.PORT || 3000;

//Indicar la carga de archivos estaticos
app.use(express.static('public'));

//Habilitar Template Engine
app.set('view engine', 'pug');

//Habilitar BodyParser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//Habilitar Express Validator a toda la app
app.use(expressValidator());

//Añadir la carpeta de las vistas
app.set('views', path.join(__dirname, '/views'));

app.use(cookieParser());

//Sesiones nos permiten navegar entre distintas paginas
app.use(
	session({
		secret            : 'supersecret',
		resave            : false,
		saveUninitialized : false
	})
);

app.use(passport.initialize());
app.use(passport.session());

//Agregar flash messages
app.use(flash());

//Pasar funcion a la aplicacion
app.use((req, res, next) => {
	res.locals.vardump = helpers.vardump;
	res.locals.mensajes = req.flash();
	res.locals.usuario = { ...req.user } || null;
	next();
});

//Añadir configuracion de las rutas
app.use('/', routes());

const host = process.env.HOST || '0.0.0.0';

app.listen(port, host, () => {
	console.log(`Server started on port ${port}`);
});

// app.listen(port, () => {
// 	console.log(`Server started on port ${port}`);
// });

//Es usado para probar el esquema dle correo enviado
// require('./handlers/email');
