var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}

const pms = require('../interface/permission.json')
const db = require('../interface/db_Sheets')
const func = require('../helpers/helpers')
const gestor = require('../models/_gestor')
const dados = require('../models/_dados')

const moment = __importDefault(require('moment'))

// Menu Inicial do Projeto
function execute(user, msg, client) {
	console.log('Estágio: ' + dados[user].stage, 'Arquivo: 0')

	// dados[user]._type.type_option = 'image'
	// dados[user]._type.type_file = 'capa-akmos.jpg'

	// dados[user]._type.type_option = 'botao';

	// let _menu = ''
	// if (
	// 	dados[user]._phone_name == '' ||
	// 	dados[user]._phone_name == undefined ||
	// 	dados[user]._phone_name == 'undefined'
	// ) {
	// 	_menu = gestor[pms.p]._menu_opcao.menu[0]
	// } else {
	// 	_menu = gestor[pms.p]._menu_opcao.menu[1].replace(
	// 		'Usuario',
	// 		dados[user]._phone_name
	// 	)
	// }

	// dados[user]._pedido._numero = ''
	// dados[user]._pedido._itens = []
	dados[user].stage = 1
	let inicio = dados[user]._type.type_option = 'file'
	return[inicio]
	// return [_menu]
}

// ###############################################
function execute(user, msg, client) {
	console.log('Estágio: ' + dados[user].stage, 'Arquivo: 0')

	dados[user].stage = 1
	let inicio = dados[user]._type.type_option = 'file'
	return[inicio]
}
exports.execute = execute
