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

const moment = require('moment')
const fs = require('fs')

// Apresentação das Opções do Menu Principal
function execute(user, msg, client) {
	console.log('Estágio: ' + dados[user].stage, 'Arquivo: 1')

	// Opção * - Cancelamento do Pedido
	// stage 0
	if (msg === '*' && dados[user]._human == false) {
		return func.funcgetFinish(user)
	}

	let _msgRetorno = []
	/*if (msg.toLowerCase() == 'voltar' && dados[user]._human == false) {
        dados[user].stage = 0;
        return ['Estágio: ' + dados[user].stage];
    }*/

	if (
		dados[user]._phone_name == '' ||
		dados[user]._phone_name == undefined ||
		dados[user]._phone_name == 'undefined'
	) {
		if (dados[user]._phone_incl == '' && msg == '1') {
			dados[user].stage = 1
			dados[user]._phone_incl = '1'
			return [`  -> ` + ' _Para comerçarmos por favor, *informe o seu nome*_']
		}
		if (dados[user]._phone_incl == '1') {
			dados[user]._phone_incl = '0'
			dados[user]._phone_name = msg
			let _editCliente = {
				NomeCliente: msg,
				NomeInformado: msg,
			}
			db.funcEditDados('Clientes', 'Codigo', dados[user]._id_user, _editCliente)
			msg = '1'
		}
	}

	// 1ª Verificação - Verifica se o valor informado está permitido ou se é inválido!
	// Stage = 1

	if (
		!gestor[pms.p]._menu_opcao.value[0]['0'].includes(msg) &&
		dados[user]._human == false
	) {
		_msgRetorno = [`  -> ` + '❌ Opção inválida, tente novamente!']
		dados[user].stage = 1
		return _msgRetorno
	}

	// Opção 0 - Finalizar
	if (msg == '0' && dados[user]._human == false) {
		return func.funcgetFinish(user)
	}

	let header = ``
	let conteudo = ``
	let footer = ``
	let msgText = ''

	//  apresentar Catalogo de produtos para pesquisa
	if (msg == '10' && dados[user]._human == false) {
		header = `  -> ` + 'Ok, segue a nossa lista de produtos.'
		let _catalogo = gestor[pms.p]._produto._searchProd_list

		dados[user]._type.type_option = 'chat'

		footer = dados[user]._type.type_text =
			'  -> ' +
			'Para realizar uma *pesquisa mais detalhada* Informe o *Nome* do produto ou o *Código* ou parte dele.'
		msgText = dados[user]._type.type_text =
			'  -> ' + 'Ou se preferir  voltar ao menu digite *Voltar*.'
		dados[user].stage = 2
		_msgRetorno = [header, _catalogo, footer, msgText]

		return _msgRetorno
	}

	// Opção 1 - Fazer Pedido e apresentar Catalogo
	// Stage -> 2
	if (msg == 'pedido' && dados[user]._human == false) {
		if (dados[user]._pedido._itens.length == 0) {
			header = `  -> ` + 'Ok, segue o nosso catálogo de produtos.'
			let _catalogo = gestor[pms.p]._produto._catalogo
			;(footer = `  -> ` + 'Informe o *Código* do produto desejado:'),
				`  -> ` + `Ou se preferir digite ✳️para *Finalizar* atendimento.`

			dados[user].stage = 2
			_msgRetorno = [_catalogo, footer]
		} else {
			let _resumoPedido = func.funcPedidoResumo(user)
			let _contato = ''

			if (
				dados[user]._phone_name != '' ||
				dados[user]._phone_name != undefined ||
				dados[user]._phone_name != 'undefined'
			) {
				_contato = '*' + String(dados[user]._phone_name).split(' ')[0] + '*, '
			}

			let _texto =
				`  -> ` +
				'Oi ' +
				_contato +
				'Identificamos que você possui um pedido em aberto.'
			_resumoPedido.unshift(_texto)

			dados[user].stage = 3
			_msgRetorno = _resumoPedido
		}
		return _msgRetorno
	}

	// Opção 2 - Pesquisar Produto
	// Stage -> 8
	if (msg == '2' && dados[user]._human == false) {
		dados[user].stage = 8
		_msgRetorno = [
			`🧾 ` + ` *Pesquisa de Produto(s)*`,
			`  -> ` + `_Informe o nome do Produto ou parte do nome._`,
		]
		return _msgRetorno
	}

	// Opção 3 - Listar Card das Promoções
	// Stage = 1
	if (msg == '3' && dados[user]._human == false) {
		let _textPromocao =
			`  -> ` + ' Aqui estão os nossos produtos na promoção...'
		dados[user]._promotion = true
		dados[user].stage = 1
		return [_textPromocao]
	}

	// Opção 4 - Falar com atendente
	// Stage = 1

	if (msg == '4' && dados[user]._human == false) {
		header =
			' 🏽' + ` _Iniciando_ *Atendimento Humano*,\nPor favor aguarde... \n\n`
		conteudo = [
			`_Estamos direcionado você para o atendimento humanizado. Aguarde, em alguns minutos iremos te atender._ \n\n`,
		]
		footer = `_Para voltar ao *atendimento virtual* Digite *️⃣_ \n`
		let msg1 =
			'🚨' +
			' *E não se esqueça que para voltar ao [ATENDIMENTO VIRTUAL], você precisa digitar *️⃣*'
		let msgOpcao = header + msg1
		// let msgOpcao = header + conteudo + footer;
		dados[user]._human = true
		dados[user]._human_atend =
			`_Olá, meu nome é *${pms.atend}*_` + '\n' + `Em que posso te ajudar?`
		return [msgOpcao]
	}

	// if (msg == '4' && dados[user]._human == false) {

	//     dados[user]._type.type_option = 'contato';

	//     let msg = `  -> ` + `_Para falar com um dos nossos atendentes, por favor mande uma mensagem para o contato abaixo._ \n `;
	//     let msg2 = '   -> ' + '_E para finalizar o seu atendimento basta digitar 0️⃣._ ';
	//     return [msg, msg2];
	// }

	if (msg == '*') {
		dados[user]._type.type_option = 'chat'
		let msgMessage =
			`  -> ` + `Oi, agora o seu atendimento é pelo *assistente virtual*.\n`
		msgMessage += gestor[pms.p]._menu_opcao.menu[4]
		dados[user]._human = false
		dados[user]._human_chat = false
		dados[user].stage = 1
		return [msgMessage]
	}

	// Opção 5 - Nossa Localização
	// Stage = 1
	if (msg == '5' && dados[user]._human == false) {
		header = `  -> ` + `"Que legal, vou te passar a nossa localização!` + '\n'
		//header += `📌 *ENDEREÇO* \n`;
		header += `  -> ` + `_Nosso endereço de localização._ \n`
		conteudo =
			`- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -` + `\n`
		conteudo += `*${pms.address}* \n`
		conteudo += `Cep: *${pms.zip}* \n`
		conteudo += `Município: *${pms.city}* \n`
		conteudo += `Estado: *${pms.state}* \n`
		conteudo +=
			`- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -` + `\n`
		let msgOpcao = header + conteudo

		dados[user]._type.type_option = 'location'
		dados[user].stage = 1
		return [`${pms.address}, ${pms.zip} - ${pms.city} / ${pms.state}`, msgOpcao]
	}

	// 2ªVerificação - Caso chegou aqui houve um erro, e será inicializado o atendimento
	// Stage <- 0
	dados[user].stage = 1
	return [`  -> ` + ' Digite uma opção válida!']
}

exports.execute = execute
