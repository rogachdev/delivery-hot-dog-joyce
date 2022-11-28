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
	console.log('Estágio: ' + dados[user].stage, 'Arquivo: 4')

	// Opção * - Cancelamento do Pedido
	// stage 0
	if (msg === '*') {
		return func.funcGetFinish(user)
	}

	let _msgRetorno = []
	if (msg.toLowerCase() == 'voltar') {
		let _resumoPedido = func.funcPedidoResumo(user)
		dados[user].stage = 3
		return _resumoPedido
	}

	// 1ª Verificação - Verifica se o valor informado está permitido ou se é inválido!
	// Stage = 4
	if (!gestor[pms.p]._menu_opcao.value[1]['1'].includes(msg.toLowerCase())) {
		_msgRetorno = [`  -> ` + '❌ Opção inválida!']
		dados[user].stage = 4
		return _msgRetorno
	}

	dados[user]._pedido._delivery = msg
	if (msg == '1') {
		_msgRetorno = [
			`  -> ` +
				'Você escolheu a opção...' +
				'\n' +
				'*ENTREGAR* o(s) Produto(s) no seu endereço.' +
				'\n',
			`  -> ` + 'Agora nos envie a sua *localização atual*! ' + '📍',
		]

		dados[user]._type.type_get = 'local'
		dados[user].stage = 5
		return _msgRetorno
	} else if (msg == '2') {
		let _header =
			`  -> ` +
			'Agora preciso que você me informe qual é a *forma de pagamento* que deseja.'
		let _header2 =
			`  -> ` + 'Caso deseja voltar para opção anterior, digite *Voltar*.'
		_msgRetorno = [
			`  -> ` +
				'Você escolheu a opção...' +
				'\n' +
				'*RETIRAR* o(s) Produto(s) no local.',
			_header,
			_header2,
			gestor[pms.p]._menu_opcao.menu[3],
		]

		dados[user]._type.type_get = 'payment'
		dados[user].stage = 6
		return _msgRetorno
	}
}

exports.execute = execute
