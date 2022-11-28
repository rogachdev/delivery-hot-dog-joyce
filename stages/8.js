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
	console.log('Estágio: ' + dados[user].stage, 'Arquivo: 8')

	if (msg == '*') {
		dados[user].stage = 1
		return [gestor[pms.p]._menu_opcao.menu[0]]
	}

	dados[user].stage = 8

	let _msgRetorno = []
	if (msg.length < 3) {
		_msgRetorno = [
			`  -> ` +
				`Para melhorar a pesquisa, digite uma palavra com mais de 3 letras...`,
		]
		return _msgRetorno
	}

	let _search = gestor[pms.p]._produto._searchProd
	let _find = ''
	let _term = ''
	let _found = false
	let _count = 0
	dados[user]._search_prod = []
	for (let x in _search) {
		_find = _search[x][1]
		_term = _search[x][4]
		_find = _find.toLowerCase()
		_term = _term.toLowerCase()
		if (
			_find.indexOf(msg.toLowerCase()) >= 0 ||
			_term.indexOf(msg.toLowerCase()) >= 0
		) {
			dados[user]._search_prod.push([
				_search[x][0],
				_search[x][1],
				_search[x][2],
				_search[x][3],
				_search[x][5],
			])
			_count++
			_found = true
		}
	}
	if (_found) {
		_msgRetorno = [
			`  -> ` +
				' _Encontrei ' +
				_count +
				' produto(s) com o termo *' +
				msg +
				'* que você digitou._',
		]
	} else {
		_msgRetorno = [`  -> ` + 'Nenhum produto encontrado!, tente novamente. ']
	}
	return _msgRetorno
}

exports.execute = execute
