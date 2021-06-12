const passport = require('passport');
const LocalStrategy = require('passport-local');

//Referencia al Modelo donde vamos a autenticar
const Usuarios = require('../models/Usuarios');

//local strategy - login con credenciales propias

passport.use(
	new LocalStrategy(
		//Por Default passport espera un usuario y password
		{
			usernameField : 'email',
			passwordField : 'password'
		},
		async (email, password, done) => {
			try {
				const usuario = await Usuarios.findOne({
					where : {
						email,
						activo : 1
					}
				});
				//El ususario existe pero password incorrecto
				if (!usuario.verificarPassword(password)) {
					return done(null, false, {
						message : 'Password Incorrecto'
					});
				}
				//El mail existe y password es correcto
				return done(null, usuario);
			} catch (e) {
				//Ese usuario no existe
				return done(null, false, {
					message : 'Esa Cuenta no existe'
				});
			}
		}
	)
);

//Serializar el usuario
passport.serializeUser((usuario, callback) => {
	callback(null, usuario);
});

//Deserializar el usuario
passport.deserializeUser((usuario, callback) => {
	callback(null, usuario);
});

module.exports = passport;
