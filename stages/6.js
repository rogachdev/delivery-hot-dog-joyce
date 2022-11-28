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

function execute(user, msg) {
	console.log('Estágio: ' + dados[user].stage, 'Arquivo: 6')

	// Opção * - Cancelamento do Pedido
	// stage 0
	if (msg === '*') {
		return func.funcGetFinish(user)
	}

	let _msgRetorno = []
	if (msg.toLowerCase() == 'voltar') {
		dados[user].stage = 4
		return [gestor[pms.p]._menu_opcao.menu[2]]
	}

	// 1ª Verificação - Verifica se o valor informado está permitido ou se é inválido!
	// Stage = 4
	if (!gestor[pms.p]._menu_opcao.value[2]['2'].includes(msg.toLowerCase())) {
		_msgRetorno = [`  -> ` + '❌ Opção inválida!']
		dados[user].stage = 6
		return _msgRetorno
	}

	dados[user]._pedido._payment = msg

	if (msg == '1') {
		_msgRetorno =
			`  -> ` +
			' Você escolheu a forma de Pagamento: ' +
			'\n' +
			' >> ' +
			'💵 | *Dinheiro.*'
	}

	if (msg == '2') {
		_msgRetorno =
			`  -> ` +
			' Você escolheu a forma de Pagamento: ' +
			'\n' +
			' >> ' +
			'💳 | *Cartão.*'
	}

	if (msg == '3') {
		_msgRetorno =
			`  -> ` +
			' Você escolheu a forma de Pagamento: ' +
			// '\n' + `- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -` +
			'\n' +
			' >> ' +
			'💰 | *PIX.* ' +
			'\n' +
			`- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -` +
			'\n' +
			'DADOS DO PIX:' +
			'\n' +
			'*CPF:* ' +
			pms.payment_pix +
			'\n' +
			'*NOME:* _-----------------_' +
			'\n' +
			'*BANCO:* _Bradesco_' +
			'\n' +
			// `- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -` +
			// '\n' +
			// `  -> ` +
			'_*Por favor, encaminhar o comprovante de pagamento!*_  ' +
			'💱'
	}

	let _retorno = func.funcPedidoFechar(user)
	_retorno.unshift(_msgRetorno)

	dados[user].sleep = 3
	dados[user].stage = 7
	return _retorno
}

exports.execute = execute
