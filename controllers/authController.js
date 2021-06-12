const passport = require('passport');
const Usuarios = require('../models/Usuarios');
const crypto = require('crypto');
const Sequelize = require('sequelize');
const bcrypt = require('bcrypt-nodejs');
const enviarEmail = require('../handlers/email');

const Op = Sequelize.Op;

exports.autenticarUsuario = passport.authenticate('local', {
	successRedirect   : '/',
	failureRedirect   : '/iniciar-sesion',
	failureFlash      : true,
	badRequestMessage : 'Ambos Campos son Obligatorios'
});

//Funcion para revisar si el usuario esta logueado o no
exports.usuarioAutenticado = (req, res, next) => {
	//Si el usuario esta autenticado
	if (req.isAuthenticated()) {
		return next();
	}

	//Si no esta autenticado redirigir
	return res.redirect('/iniciar-sesion');
};

exports.cerrarSesion = (req, res) => {
	req.session.destroy(() => {
		res.redirect('/iniciar-sesion');
	});
};

exports.enviarToken = async (req, res) => {
	//verificar que el usuario existe.
	const { email } = req.body;
	const usuario = await Usuarios.findOne({
		where : {
			email
		}
	});

	//Si no existe el usuario
	if (!usuario) {
		req.flash('error', 'No existe esa cuenta');
		res.redirect('reestablecer');
	}

	//usuario existe
	usuario.token = crypto.randomBytes(20).toString('hex');
	usuario.expiration = Date.now() + 3600000;

	await usuario.save();

	const resetUrl = `http://${req.headers.host}/reestablecer/${usuario.token}`;

	//Enviar el correo con el token
	await enviarEmail.enviar({
		usuario,
		subject  : 'Password Reset',
		resetUrl,
		archivo  : 'reestablecer-password' //debe llamarse igual que el archivo .pug
	});

	req.flash('correcto', 'Se envio un mensaje a tu correo');
	res.redirect('/iniciar-sesion');
};

exports.validarToken = async (req, res) => {
	const usuario = await Usuarios.findOne({
		where : {
			token : req.params.token
		}
	});

	if (!usuario) {
		req.flash('error', 'No valido');
		res.redirect('/reestablecer');
	}

	//Formulario para generar password
	res.render('resetPassword', {
		nombrePagina : 'Restablecer Contraseña'
	});
};

exports.actualizarPassword = async (req, res) => {
	const usuario = await Usuarios.findOne({
		where : {
			token      : req.params.token,
			expiration : {
				[Op.gte]: Date.now()
			}
		}
	});

	if (!usuario) {
		req.flash('error', 'No Valido');
		res.redirect('/reestablecer');
	}

	//hashear Password
	usuario.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
	(usuario.token = null), (usuario.expiration = null);
	await usuario.save();
	req.flash('correcto', 'Tu password se ha modificado correctamente');
	res.redirect('/iniciar-sesion');
};
