const nodemailer = require('nodemailer');
const pug = require('pug');
const juice = require('juice');
const { convert } = require('html-to-text');
const util = require('util');
const emailConfig = require('../config/email');
const email = require('../config/email');

let transport = nodemailer.createTransport({
	host   : emailConfig.host,
	port   : emailConfig.port,
	secure : false, // true for 465, false for other ports
	auth   : {
		user : emailConfig.user, // generated ethereal user
		pass : emailConfig.pass // generated ethereal password
	}
});

//Generar HTML
const generarHTML = (archivo, opciones = {}) => {
	const html = pug.renderFile(`${__dirname}/../views/emails/${archivo}.pug`, opciones);
	return juice(html);
};

exports.enviar = async (opciones) => {
	const html = generarHTML(opciones.archivo, opciones);
	const text = convert(html);
	let opcionesEmail = {
		from    : 'UpTask<no-reply@uptask.com>', // sender address
		to      : opciones.usuario.email, // list of receivers
		subject : opciones.subject, // Subject line
		text,
		html // html body
	};

	const enviarEmail = util.promisify(transport.sendMail, transport);
	return enviarEmail.call(transport, opcionesEmail);
};
