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

const axios = require('axios')

function execute(user, msg) {
	console.log('Estágio: ' + dados[user].stage, 'Arquivo: 5')

	console.log(dados[user]._message)

	// Opção * - Cancelamento do Pedido
	// stage 0
	if (msg === '*') {
		return func.funcGetFinish(user)
	}

	let _msgRetorno = []
	//   if (msg.toLowerCase() == 'voltar') {
	//       let _menu = gestor[pms.p]._menu_opcao.menu[2];
	//       dados[user].stage = 4;
	//       return [_menu];
	//   }

	if (dados[user]._type.type_get == 'local') {
		if (dados[user]._message.type !== 'location') {
			_msgRetorno = [
				`  -> ` + '❌ Nos envie a localização usando o Whatsapp 👆🏼👆🏼👆🏼',
			]

			dados[user]._type.type_option = 'image'
			dados[user]._type.type_file = 'localizacao.jpeg'

			dados[user].stage = 5
			return _msgRetorno
		}

		if (dados[user]._message.type === 'location') {
			dados[user]._pedido._lat = dados[user]._message.lat
			dados[user]._pedido._lng = dados[user]._message.lng
			axios({
				method: 'get',
				url: `https://maps.googleapis.com/maps/api/geocode/json?latlng=${dados[user]._pedido._lat},${dados[user]._pedido._lng}&key=${pms.keymap}`,
			})
				.then((response) => {
					dados[user]._pedido._address =
						response.data.results[0].formatted_address
				})
				.catch((error) => {
					console.error(error)
				})
			dados[user].sleep = 7
			_msgRetorno = [
				`  -> ` + 'Ok, vou procurar aqui no mapa o seu endereço.',
				`  -> ` +
					'Pronto!, Agora preciso que você *me informe um ponto de referência* para faciliar a entrega no seu endereço.',
			]

			dados[user]._type.type_get = 'referenc'
			dados[user].stage = 5
			return _msgRetorno
		}
	}

	if (dados[user]._type.type_get == 'referenc') {
		_msgRetorno = [
			`  -> ` +
				'Consegui localizar seu endereço...' +
				'\n' +
				`  -> ` +
				'🏡 ' +
				'Você está no endereço:' +
				'\n' +
				`*${dados[user]._pedido._address}*` +
				'\n\n' +
				`  -> ` +
				'E seu ponto de referência é:' +
				'\n' +
				'*' +
				msg +
				'*. ',
			gestor[pms.p]._menu_opcao.menu[3],
		]
		dados[user]._pedido._reference = msg
		dados[user].stage = 6
		return _msgRetorno
	}
}

exports.execute = execute
