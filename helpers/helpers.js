'use strict'
Object.defineProperty(exports, '__esModule', { value: true })

exports.funcgetGestor =
	exports.funcGetMenu =
	exports.funcCatalogo =
	exports.funcGetOrder =
	exports.funcGetStage =
	exports.funcgetFinish =
	exports.funcAddCaracter =
	exports.funcCumprimento =
	exports.funcPrimMaiuscula =
	exports.funcPedidoResumo =
	exports.funcPedidoFechar =
	exports.funcPedidoEnviar =
	exports.sleep =
		void 0

var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}

const moment = require('moment')
const db = require('../interface/db_Sheets')
const gestor = require('../models/_gestor')
const dados = require('../models/_dados')
const pms = require('../interface/permission.json')
const request = require('request')
const fs = require('fs')

/* * * * *  Área de Controle de Gerenciamento * * * * */
async function funcgetGestor(key) {
	console.log('>>> Preparando... ', key)

	if (!gestor[key]) {
		gestor[key] = {
			active: false,
			_menu_opcao: {
				menu: [],
				value: [],
			},
			_produto: {
				_catalogo: '',
				_menuProd: [],
				_menuValue: [],
				_searchProd: [],
				_searchProd_list: [],
			},
			_produto_promotion: [],
			_menu_pedido_entrega: [],
			_menu_pedido_pgto: [],
			_phone_redirect: [],
		}
	}

	console.log('>>> Habilitando...')
	if (!gestor[key].active) {
		// Carrega os Menus para o Controle do Projeto
		let vNow = moment.default(new Date())
		let _dtAtend = vNow.format('HH:mm:ss')
		let _cumpr = funcCumprimento()

		console.log('>>> Preparando Menus...')
		gestor[key]._menu_opcao.menu = {
			0:
				`� -> ` +
				`'Olá, Que bom ter você em nosso canal de Atendimento.!\nEu sou a *Fabi*, assistente virtual da *${pms.client}* e estamos felizes em atende-ló!, *abaixo segue um menu para iniciar o seu atendimento.*` +
				'\n\n' +
				(await funcGetMenu(
					key,
					0,
					'menu_id',
					'menu_nome',
					'menu_ativo',
					['0', '#'],
					['📴 | *Finalizar.*']
				)) +
				'\n' +
				'*Horário do atendimento:*\n' +
				_dtAtend +
				'',
			1:
				// `� -> ` + 'Olá, ' + _cumpr + ' *' + `|NameUser|` + '*' + `\nEu sou a *Fabi*, assistente virtual  da *${pms.client}* e estamos felizes em atende- ló!, *abaixo segue um menu para iniciar o seu atendimento.*` + '\n\n' +
				`� -> ` +
				'Olá, ' +
				_cumpr +
				' *' +
				`Usuario` +
				'*' +
				`\nEu sou a *Fabi*, assistente virtual  da *${pms.client}* e estamos felizes em atende- ló!, *abaixo segue um menu para iniciar o seu atendimento.*` +
				'\n\n' +
				(await funcGetMenu(
					key,
					0,
					'menu_id',
					'menu_nome',
					'menu_ativo',
					['0', '#'],
					['📴 | *Finalizar*']
				)) +
				'\n' +
				'*Horário do atendimento:*\n' +
				_dtAtend +
				'',
			2:
				(await funcGetMenu(
					key,
					1,
					'entreg_id',
					'entreg_nome',
					'entreg_ativo'
				)) +
				'\n' +
				`-> ` +
				`Ou se preferir digite ✳️para *Cancelar* o seu Pedido.`,
			3:
				(await funcGetMenu(key, 2, 'pgto_id', 'pgto_nome', 'pgto_ativo', [
					'#',
				])) +
				'\n' +
				`� -> ` +
				`Ou se preferir digite ✳️para *Cancelar* o seu Pedido.`,
			4:
				`� -> ` +
				'Escolha uma das opções abaixo.' +
				'\n\n' +
				(await funcGetMenu(
					key,
					0,
					'menu_id',
					'menu_nome',
					'menu_ativo',
					['0', '#'],
					['📴 | *FINALIZAR*']
				)) +
				'\n',
		}

		let _arrayEntrega = {}
		let _entrega = await db.funcListDados(
			'_menu',
			['entreg_id', 'entreg_nome'],
			'entreg_ativo',
			'Sim'
		)
		for (let x in _entrega) {
			_arrayEntrega[_entrega[x][0]] = _entrega[x][1]
		}
		gestor[key]._menu_pedido_entrega = _arrayEntrega

		let _arrayPagto = {}
		let _pagto = await db.funcListDados(
			'_menu',
			['pgto_id', 'pgto_nome'],
			'pgto_ativo',
			'Sim'
		)
		for (let x in _pagto) {
			_arrayPagto[_pagto[x][0]] = _pagto[x][1]
		}
		gestor[key]._menu_pedido_pgto = _arrayPagto
		console.log('>>> Menus Carregado...')

		// Carrega os dados dos Produtos no Catalogo
		console.log('>>> Carregando Catalogo...')
		await funcCatalogo(key)

		// Carrega Produtos em Promoção
		gestor[pms.p]._produto_promotion = await db.funcListDados(
			'Promotion',
			['Produto', 'Descrição', 'Dt_Inicio', 'Dt_Termino', 'Imagem'],
			'Status',
			'Sim'
		)

		console.log('>>> Carregado com sucesso...')

		gestor[key].active = true
	}
	console.log('>>> Projeto Pronto!!')
	return gestor[key].active
}

async function funcGetMenu(
	key,
	nivel,
	id,
	menu,
	camp,
	footer = null,
	footertext = null
) {
	let data = []
	let valueItem = []
	let valueret = {}
	let retorno = ''

	data = await db.funcListDados('_menu', [id, menu], camp, 'Sim')

	for (let x in data) {
		retorno += funcGetOrder(data[x][0]) + data[x][1] + '\n'
		valueItem.push(data[x][0])
	}
	if (footertext != null) {
		for (let i in footertext) {
			retorno += funcGetOrder(footer[i][0]) + footertext[i] + '\n'
		}
	}
	for (let f in footer) {
		valueItem.push(footer[f][0])
	}
	valueret[nivel] = valueItem
	gestor[key]._menu_opcao.value[nivel] = valueret

	retorno += `- - - - - - - - - - - - - - - - - - - - - - - - - - - - -` + '\n'
	//retorno += '👉🏼 _Digite a opção desejada:_' + '\n';

	return retorno
}

// CATALOGO PRINCIPAL
async function funcCatalogo(key) {
	let _data = []
	let _value = []

	_data = await db.funcListDados(
		'Produtos',
		['Código', 'NomeProduto', 'PreçoVenda', 'Image', 'Termos', 'Descrição'],
		'Status',
		'Sim'
	)

	for (let x in _data) {
		let _textDescr = _data[x][5]
		let _textRetor = ''
		for (var i = 0; i < _textDescr.length; ++i) {
			if (_textDescr[i] == ' ' || _textDescr[i] == '\n') {
				_textRetor += ' '
			} else {
				_textRetor += _textDescr[i]
			}
		}
		gestor[key]._produto._searchProd.push([
			_data[x][0],
			_data[x][1],
			_data[x][2],
			_data[x][3],
			_data[x][4],
			_textRetor,
		])
	}

	var download = async function (uri, filename, callback) {
		request.head(uri, function (err, res, body) {
			if (err) callback(err, filename)
			else {
				var stream = request(uri)
				stream
					.pipe(
						fs.createWriteStream(filename).on('error', function (err) {
							callback(error, filename)
							stream.read()
						})
					)
					.on('close', function () {
						callback(null, filename)
					})
			}
		})
	}

	if (_data) {
		//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
		//mudar pra true quando for atualizar produtos na planilhas
		//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
		let _download = true

		let _catalogo = ''
		let _catalogo_search = ''
		let _header = ''
		let _content = ''
		let _content_list = ''
		let _footer = ''
		let _opcao = ['menu']
		let vNow = moment.default(new Date())
		let _dtAtend = vNow.format('DD/MM/YY HH:mm:ss')

		_header = ' >>>>> *CATALOGO DE PRODUTOS* <<<<<' + '\n\n'
		for (let x in _data) {
			// Lista Catalogo Principal
			_content = _content + '*Código:* ' + _data[x][0] + '\n'
			_content = _content + '*Produto:* ' + _data[x][1] + '\n'
			_content = _content + '*Valor:* ' + _data[x][2] + '\n'
			_content =
				_content +
				`- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -` +
				'\n'
			//-----------------------------------------------------------------------------------------------------------
			// Lista Catalogo Search
			//_content_list = _content_list + '*Código:* ' + _data[x][0] + '\n';
			_content_list = _content_list + '*Produto:* ' + _data[x][1] + '\n'
			//_content_list = _content_list + '*Valor:* ' + _data[x][2] + '\n';
			_content_list =
				_content_list +
				`- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -` +
				'\n'
			_value[x] = _data[x][0]

			let _cod = funcPrimMaiuscula(_data[x][0])
			gestor[key]._produto._menuProd[_cod] = [
				_data[x][1],
				_data[x][2],
				_data[x][3],
			]

			if (_download) {
				await download(
					_data[x][3],
					'./img/produtos/' + _cod + '.png',
					function () {
						console.log('Baixando imagem para o produto ' + _cod + '...')
					}
				)
			}
		}
		_footer = '_' + _dtAtend + '_' + '\n'
		_catalogo = _header + _content + _footer
		_catalogo_search = _header + _footer
		_catalogo_search = _header + _content_list + _footer

		gestor[key]._produto._catalogo = _catalogo
		gestor[key]._produto._menuValue = _value
		gestor[key]._produto._searchProd_list = _catalogo_search
	}
}

function funcGetStage(user) {
	if (!dados[user]) {
		dados[user] = {
			stage: 0,
			sleep: 0,
			sleep_rod: 0,
			_grup: false,
			_human: false,
			_human_chat: false,
			_human_atend: '',
			_message: '',
			_id_user: 0,
			_phone_num: '',
			_phone_name: '',
			_phone_incl: '',
			_type: {
				type_option: 'chat',
				type_document: '',
				type_description: '',
				type_title: '',
				type_subtitle: '',
				type_text: '',
				type_file: '',
				type_link: '',
				type_name: '',
				type_contact: '',
				type_number: '',
				type_buttons: [],
				type_get: '',
				type_files: [],
			},
			_pedido: {
				_key: '',
				_numero: '',
				_data: '',
				_count: 0,
				_total: 0,
				_delivery: '',
				_lat: '',
				_lng: '',
				_address: '',
				_reference: '',
				_payment: '',
				_itens: [],
			},
			_pedido_item_stage: 'prod',
			_pedido_cod_stage: '',
			_pedido_enviar: false,
			_promotion: false,
			_search_prod: [],
		}
	}
	if (dados[user]._view == true) {
		dados[user]._view = false
		//console.log(dados[user])
	} else {
		dados[user]._view = true
	}
	return dados[user].stage
}

function funcGetOrder(op) {
	let order = ''
	switch (op.toLowerCase()) {
		case '1':
			order = `1️⃣ - `
			break
		case '2':
			order = `2️⃣ - `
			break
		case '3':
			order = `3️⃣ - `
			break
		case '4':
			order = `4️⃣ - `
			break
		case '5':
			order = `5️⃣ - `
			break
		case '6':
			order = `6️⃣ - `
			break
		case '7':
			order = `7️⃣ - `
			break
		case '8':
			order = `8️⃣ - `
			break
		case '9':
			order = `9️⃣ - `
			break
		case '0':
			order = `0️⃣ - `
			break
		case '10':
			order = `🔟 - `
			break
		case '*':
			order = `✳️- *Para sair*`
			break
		case '#':
			order = `#️⃣ - *Para Menu*`
			break
		case 'voltar':
			order = `Ou digite *Voltar* para ir ao menu anterior.`
			break
	}
	return order
}

function funcgetFinish(user) {
	let _msgRetorno = []
	let _msgExit = ''

	let _pedido = dados[user]._pedido._numero
	let _key = dados[user]._pedido._key
	let _itens = dados[user]._pedido._itens

	if (_pedido != '') {
		;(async () => {
			for (let x in _itens) {
				await db.funcDelDados(
					'Pedidos_itens',
					'Key_Item_Pedido',
					_key + '-' + _itens[x][0]
				)
			}
			await db.funcDelDados('Pedidos', 'Key', _key)
		})()
	}

	_msgRetorno = [
		`� -> ` +
			' O seu Pedido de Nº: *' +
			_pedido +
			'* foi excluido com sucesso! \n' +
			`� -> ` +
			'*E o seu atendimento foi finalizado com sucesso também!*',
		`� -> ` + '*Obrigado por usar nosso serviço virtual.*',
	]

	dados[user]._id_user = 0
	dados[user]._pedido._key = ''
	dados[user]._pedido._numero = ''
	dados[user]._pedido._itens = []
	dados[user].stage = 0
	return _msgRetorno
}

/* * * * *  Funções de Apoio * * * * */
function funcAddCaracter(value, len, caract, pos = 'left') {
	var _value = String(value)
	var counter = _value.length
	while (counter < len) {
		if (pos == 'left') {
			_value = caract + _value
		} else {
			_value = _value + caract
		}
		counter++
	}
	return _value
}

function funcCumprimento() {
	var stamp = new Date()
	var hours = stamp.getHours()
	var cump
	if (hours >= 18 && hours < 24) {
		cump = 'Boa noite'
	} else if (hours >= 12 && hours < 18) {
		cump = 'Boa tarde'
	} else if (hours >= 0 && hours < 12) {
		cump = 'Bom dia'
	}
	return cump
}

function funcPrimMaiuscula(text) {
	if (typeof text !== 'string') {
		return 'Erro!'
	}
	return text.charAt(0).toUpperCase() + text.substr(1)
}

/* * * * *  Área de Controle de Pedido * * * * */
function funcPedidoResumo(user) {
	let _msg1 = `� -> ` + `_Aqui abaixo está o resumo do seu pedido atual:_ `
	let header = `🛍️ _*RESUMO DO PEDIDO*_ \n\n`
	header += `*Nº DO PEDIDO:* ` + '' + dados[user]._pedido._numero + ` \n`
	header += `- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -` + '\n'
	header += `*DATA/HORA DO PEDIDO:* ` + '\n' + dados[user]._pedido._data + `\n`
	header +=
		`- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -` + '\n\n'

	let conteudo = ''
	conteudo += `>>>>> *DESCRIÇÃO DOS ITENS* <<<<<` + `\n`
	conteudo +=
		`- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -` + '\n'

	let subtotal = 0
	let qtdeItem = 0
	dados[user]._pedido._itens.forEach((value) => {
		let _cod = funcPrimMaiuscula(value[0])
		conteudo += '*COD:*' + ` ${_cod} ` + `\n`
		conteudo += `*PROD:* ${value[1]}` + '\n'
		conteudo +=
			`*QTD:* ${value[3]}x de: ${value[4].toLocaleString('pt-BR', {
				style: 'currency',
				currency: 'BRL',
			})}` + `\n`
		conteudo +=
			`*SUB-TOTAL:* *${value[5].toLocaleString('pt-BR', {
				style: 'currency',
				currency: 'BRL',
			})}*` + `\n`
		conteudo +=
			`- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -` + '\n'
		subtotal += value[5]
		qtdeItem++
	})

	let total = ''
	total += `- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -` + '\n'
	total +=
		`TOTAL DO PEDIDO: *${subtotal.toLocaleString('pt-BR', {
			style: 'currency',
			currency: 'BRL',
		})}*` + `\n`
	total += `- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -` + '\n'
	total += `QTDE NO CARRINHO: *${funcAddCaracter(qtdeItem, 2, '0')}*` + '\n'
	total +=
		`- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -` + '\n\n'

	let footer = `� -> ` + `_Escolha uma das opções abaixo:_ `
	let footer2 =
		`� -> ` +
		`🆗  - *Edita* _o Pedido_ \n` +
		`� -> ` +
		`#️⃣  - *Finaliza* _o Pedido_ \n` +
		`� -> ` +
		`✳️ - *Cancela* _o Pedido_`

	return [_msg1, header + conteudo, total, footer, footer2]
}

function funcPedidoFechar(user) {
	let _msg1 = `� -> ` + `_Aqui está o fechamento do pedido atual_`
	let header = `🛍️ _*FECHAMENTO DO PEDIDO*_ ` + `\n`
	header += `- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -` + '\n'
	header += '*Nº DO PEDIDO:* ' + dados[user]._pedido._numero + `\n`
	header += `- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -` + '\n'
	header +=
		`_*DATA/HORA DO PEDIDO:*_ ` + '\n' + dados[user]._pedido._data + `\n`
	header += `- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -` + '\n'

	let conteudo = ''
	conteudo += `>>>>> *DESCRIÇÃO DOS ITENS* <<<<<` + `\n`
	conteudo +=
		`- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -` + '\n'

	let subtotal = 0
	let qtdeItem = 0
	dados[user]._pedido._itens.forEach((value) => {
		let _cod = funcPrimMaiuscula(value[0])
		conteudo += '*COD:*' + ` ${_cod} ` + `\n`
		conteudo += `*PROD:* ${value[1]}` + '\n'
		conteudo +=
			`*QTD:* ${value[3]}x de: ${value[4].toLocaleString('pt-BR', {
				style: 'currency',
				currency: 'BRL',
			})}` + `\n`
		conteudo +=
			`*SUB-TOTAL:* *${value[5].toLocaleString('pt-BR', {
				style: 'currency',
				currency: 'BRL',
			})}*` + `\n`
		conteudo +=
			`- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -` + '\n'
		subtotal += value[5]
		qtdeItem++
	})

	let total = ''
	total += `- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -` + '\n'
	total +=
		`TOTAL DO PEDIDO: *${subtotal.toLocaleString('pt-BR', {
			style: 'currency',
			currency: 'BRL',
		})}*` + `\n`
	total += `- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -` + '\n'
	total += `QTDE NO CARRINHO: *${funcAddCaracter(qtdeItem, 2, '0')}*` + '\n'

	let pagamento = ''
	pagamento +=
		`- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -` + '\n'
	pagamento +=
		`FORMA DE PAGAMENTO:\n${
			gestor[pms.p]._menu_pedido_pgto[dados[user]._pedido._payment]
		}` + '\n'

	let entrega = ''
	entrega +=
		`- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -` + '\n'
	entrega +=
		`FORMA DE ENTREGA:\n${
			gestor[pms.p]._menu_pedido_entrega[dados[user]._pedido._delivery]
		}` + '\n'
	entrega +=
		`- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -` + '\n'
	if (dados[user]._pedido._address != '') {
		entrega += `ENDEREÇO DE ENTREGA:` + `\n`
		entrega +=
			`- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -` + '\n'
		entrega += `*${dados[user]._pedido._address}* ` + '\n'
		entrega +=
			`- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -` + '\n'
		entrega += `PONTO REFERÊNCIA: *${dados[user]._pedido._reference}* ` + '\n'
	}
	//entrega += `- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -` + '\n';

	let footer =
		`� -> ` +
		`_Digite uma das opções abaixo:_\n` +
		`� -> ` +
		`#️⃣  - *Finaliza* _o Pedido_ \n` +
		`� -> ` +
		`✳️ - *Cancela* _o Pedido_`

	return [_msg1, header + conteudo, total + pagamento + entrega, footer]
}

function funcPedidoEnviar(user) {
	let _msg1 = `� -> ` + `_Aqui está o resumo do fechamento do seu pedido atual_`
	let header = `🛍️ _*NOVO PEDIDO REALIZADO!*_ ` + `\n`
	header += `- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -` + '\n'
	header += '*Nº DO PEDIDO:* ' + dados[user]._pedido._numero + `\n`
	header += `- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -` + '\n'
	header +=
		`_*DATA/HORA DO PEDIDO:*_ ` + '\n' + dados[user]._pedido._data + `\n`
	header += `- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -` + '\n'
	header += `COMPRADOR: _*` + dados[user]._phone_name + `*_ \n`
	header += `- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -` + '\n'
	header += `CONTATO: _*` + dados[user]._phone_num + `*_\n`
	header += `- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -` + '\n'

	let conteudo = ''
	conteudo += `>>>>> *DESCRIÇÃO DOS ITENS* <<<<<` + `\n`
	conteudo +=
		`- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -` + '\n'

	let subtotal = 0
	let qtdeItem = 0
	dados[user]._pedido._itens.forEach((value) => {
		let _cod = funcPrimMaiuscula(value[0])
		conteudo += '📌 ' + '*COD:*' + ` ${_cod} ` + `\n`
		conteudo += `*PROD:* ${value[1]}` + '\n'
		conteudo +=
			`*QTD:* ${value[3]}x de => ${value[4].toLocaleString('pt-BR', {
				style: 'currency',
				currency: 'BRL',
			})}` + `\n`
		conteudo +=
			`*SUB-TOTAL:* *${value[5].toLocaleString('pt-BR', {
				style: 'currency',
				currency: 'BRL',
			})}*` + `\n`
		subtotal += value[5]
		qtdeItem++
	})

	let total =
		`- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -` + '\n'
	total +=
		`🛍️ ` +
		`*TOTAL DO PEDIDO:* *${subtotal.toLocaleString('pt-BR', {
			style: 'currency',
			currency: 'BRL',
		})}*` +
		`\n`
	total += `- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -` + '\n'
	total += `QTDE NO CARRINHO: *${funcAddCaracter(qtdeItem, 2, '0')}*` + '\n'
	;`- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -` + '\n'

	let pagamento = ''
	pagamento +=
		`- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -` + '\n'
	pagamento +=
		`FORMA DE PAGAMENTO:\n ${
			gestor[pms.p]._menu_pedido_pgto[dados[user]._pedido._payment]
		}` + '\n'

	let entrega = ''
	entrega +=
		`- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -` + '\n'
	entrega +=
		`FORMA DE ENTREGA:\n ${
			gestor[pms.p]._menu_pedido_entrega[dados[user]._pedido._delivery]
		}` + '\n'
	entrega +=
		`- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -` + '\n'
	if (dados[user]._pedido._address != '') {
		entrega +=
			`ENDEREÇO P/ ENTREGA:\n *${dados[user]._pedido._address}* ` + '\n'
		entrega +=
			`- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -` + '\n'
		entrega +=
			`PONTO DE REFERÊNCIA:\n *${dados[user]._pedido._reference}* ` + '\n'
		entrega +=
			`- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -` + '\n'
	}

	return _msg1, header + conteudo + total + pagamento + entrega
}

/* * * * *  Função de Auxiliares * * * * */
function sleep(time) {
	return new Promise((resolve) => setTimeout(resolve, time))
}

/* * * * *  Exportação de Função para o Projeto * * * * */
exports.funcgetGestor = funcgetGestor
exports.funcGetMenu = funcGetMenu
exports.funcGetOrder = funcGetOrder
exports.funcCatalogo = funcCatalogo
exports.funcGetStage = funcGetStage
exports.funcgetFinish = funcgetFinish
exports.funcAddCaracter = funcAddCaracter
exports.funcCumprimento = funcCumprimento
exports.funcPrimMaiuscula = funcPrimMaiuscula
exports.funcPedidoResumo = funcPedidoResumo
exports.funcPedidoFechar = funcPedidoFechar
exports.funcPedidoEnviar = funcPedidoEnviar
exports.sleep = sleep
