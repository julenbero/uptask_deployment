const Usuarios = require('../models/Usuarios');
const enviarEmail = require('../handlers/email');

exports.formCrearCuenta = (req, res) => {
	res.render('crearCuenta', {
		nombrePagina : 'Crear cuenta en UpTask'
	});
};

exports.formIniciarSesion = (req, res) => {
	const { error } = res.locals.mensajes;
	res.render('iniciarSesion', {
		nombrePagina : 'Iniciar Sesion en UpTask',
		error
	});
};

exports.crearCuenta = async (req, res) => {
	//Leer los Datos
	const { email, password } = req.body;
	try {
		//Crear usuario
		await Usuarios.create({ email, password });
		//Crear Url Confirmar
		const confirmarUrl = `http://${req.headers.host}/confirmar/${email}`;
		//Crear el objeto de usuario
		const usuario = {
			email
		};
		//enviar Email
		await enviarEmail.enviar({
			usuario,
			subject      : 'Confirma tu cuenta UpTask',
			confirmarUrl,
			archivo      : 'confirmar-cuenta' //debe llamarse igual que el archivo .pug
		});
		//Redirigir al usuario
		req.flash('correcto', 'Enviamos un correo, confirma tu cuenta');
		res.redirect('/iniciar-sesion');
	} catch (e) {
		req.flash('error', e.errors.map((error) => error.message));
		res.render('CrearCuenta', {
			mensajes     : req.flash(),
			nombrePagina : 'Crear cuenta en UpTask'
		});
	}
};

exports.formRestablecerPassword = (req, res) => {
	res.render('reestablecer', {
		nombrePagina : 'Reestablecer tu contraseña'
	});
};

//Cambiar el estado de una cuenta
exports.confirmarCuenta = async (req, res) => {
	const usuario = await Usuarios.findOne({
		where : {
			email : req.params.correo
		}
	});
	if (!usuario) {
		req.flash('error', 'No Valido');
		res.redirect('/crear-cuenta');
	}

	usuario.activo = 1;
	await usuario.save();

	req.flash('correcto', 'Cuenta Activada correctamente');
	res.redirect('/iniciar-sesion');
};
