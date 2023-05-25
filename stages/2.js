var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod };
	};

const moment = require('moment');
const pms = require('../interface/permission.json');
const db = require('../interface/db_Sheets');
const func = require('../helpers/helpers');
const gestor = require('../models/_gestor');
const dados = require('../models/_dados');

// Inclusão de Itens no Pedido
function execute(user, msg) {
	console.log('Estágio: ' + dados[user].stage, 'Arquivo: 2');

	// Opção * - Cancelamento do Pedido
	// stage 0
	if (msg === '*') {
		return func.funcGetFinish(user);
	}

	let _msgRetorno = [];
	if (msg.toLowerCase() == 'voltar') {
		dados[user].stage = 1;
		return [gestor[pms.p]._menu_opcao.menu[0]];
	}

	//Opção # - Fechamento do Pedido - Status: RESUMO
	// stage = 2 ou -> 3
	if (msg === '#') {
		if (dados[user]._pedido._itens.length === 0) {
			dados[user].stage = 2;
			return [`⚠ ` + `_*Selecione no mínimo um item para fechar o Pedido!*_`];
		} else {
			let _resumoPedido = func.funcPedidoResumo(user);
			dados[user].stage = 3;
			return _resumoPedido;
		}
	}

	// 1ª Verificação - Se o código do produto está na lista
	if (dados[user]._pedido_item_stage == 'prod') {
		let _search = gestor[pms.p]._produto._searchProd;

		let _find = '';
		let _term = '';
		let _count = 0;
		dados[user]._search_prod = [];

		for (let x in _search) {
			_find = _search[x][1];
			_term = _search[x][4];
			_find = _find.toLowerCase();
			_term = _term.toLowerCase();

			if (
				_find.indexOf(msg.toLowerCase()) >= 0 ||
				_term.indexOf(msg.toLowerCase()) >= 0
			) {
				dados[user]._search_prod.push([
					_search[x][0],
					_search[x][1],
					_search[x][2],
					_search[x][3],
				]);
				_count++;
			}
		}

		// Nenhum Produto localizado pela descrição ou termo
		if (_count <= 0) {
			dados[user]._pedido_item_stage = 'cod';
			dados[user]._search_prod = [];
		}

		if (_count == 1) {
			msg = dados[user]._search_prod[0][0];
			dados[user]._pedido_item_stage = 'cod';
			dados[user]._search_prod = [];
		}

		if (_count > 1) {
			let _header = '';
			let _content = '';
			let _footer = '';
			let vNow = moment.default(new Date());
			let _dtAtend = vNow.format('DD/MM/YY HH:mm:ss');
			let _data = dados[user]._search_prod;

			dados[user]._search_prod = [];
			dados[user]._pedido_item_stage = 'prod';

			_header = ' >>>>> *PRODUTOS LOCALIZADOS* <<<<<' + '\n\n';
			for (let x in _data) {
				_content = _content + '*Código:* ' + _data[x][0] + '\n';
				_content = _content + '*Produto:* ' + _data[x][1] + '\n';
				_content = _content + '*Valor:* ' + _data[x][2] + '\n';
				_content =
					_content +
					`- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -` +
					'\n';
			}
			_footer +=
				'🛍️' +
				' _' +
				func.funcAddCaracter(_count, 2, '0') +
				' produtos encontrados_' +
				'\n\n';
			_footer +=
				`  -> ` +
				'_Para inserir um dos itens acima no carrinho, *digite o seu código.*_' +
				'\n';
			_footer += '_' + _dtAtend + '_' + '\n';
			return [_header + _content + _footer];
		}
	}

	if (dados[user]._pedido_item_stage == 'cod') {
		dados[user]._pedido_cod_stage = func.funcPrimMaiuscula(msg);

		if (
			!gestor[pms.p]._produto._menuValue.includes(dados[user]._pedido_cod_stage)
		) {
			dados[user]._pedido_item_stage = 'prod';
			return [
				`  -> ` +
					` O *produto*  _*` +
					msg +
					`*_  não está cadastrado, tente novamente!`,
			];
		}
		// 3ª Verificação - Preparação para inclusão do Item selecionado
		let _item = {};
		_item = gestor[pms.p]._produto._menuProd[dados[user]._pedido_cod_stage];

		let _item_pedid = dados[user]._pedido._key;
		let _item_refer = dados[user]._pedido_cod_stage;
		let _item_descr = _item[0];
		let _item_price = parseFloat(_item[1].replace(',', '.'));
		let _item_image = _item[2];
		let _item_qtdde = 1;
		let _item_subtt = _item_qtdde * _item_price;
		let _key_pedido =
			dados[user]._pedido._key + '-' + dados[user]._pedido_cod_stage;

		let _item_inclu = true;

		// 4ª Verificação - Verifica se o item selecionado já consta no carrinho e atualiza
		for (let a in dados[user]._pedido._itens) {
			if (dados[user]._pedido._itens[a][0] == dados[user]._pedido_cod_stage) {
				dados[user]._pedido._itens[a][4] = _item_price;
				dados[user]._pedido._itens[a][5] =
					dados[user]._pedido._itens[a][3] * _item_price;

				_item_qtdde = dados[user]._pedido._itens[a][3];
				_item_subtt = dados[user]._pedido._itens[a][5];

				_item_inclu = false;
			}
		}
		// Totalizador do Pedido
		dados[user]._pedido._total = dados[user]._pedido._total + _item_subtt;

		// 5ª Verificação - Caso o Item não esteja no carrinho inclui
		let _textProd = [];
		let _msgIcon = ``;

		// Apresentação do Procedimento realizado
		let _price = _item_price;
		_price = _price.toLocaleString('pt-BR', {
			style: 'currency',
			currency: 'BRL',
		});

		if (_item_inclu) {
			//_msgIcon = `✅  `;
			_textProd = [
				// _msgIcon +
				`*Código:* ${_item_refer}` +
					'\n' +
					`*Produto:* ${_item_descr}` +
					'\n' +
					`Preço: *${_price}*`,
				`  -> ` + `_*Informe a quantidade desejada deste Produto*_`,
			];
			dados[user]._pedido._count++;
			dados[user]._pedido._itens.push([
				_item_refer,
				_item_descr,
				_item_image,
				_item_qtdde,
				_item_price,
				_item_subtt,
			]);
			// Enviar os dados para Planilha //
			(async () => {
				let _addItens = {
					Pedido: _item_pedid,
					Id_Produto: dados[user]._pedido_cod_stage,
					Produto: _item_descr,
					Imagem: _item_image,
					Qtde: _item_qtdde,
					Vlr_Unitario: _item_price,
					SubTotal: _item_subtt,
					Key_Item_Pedido: _key_pedido,
				};
				await db.funcAddDados('Pedidos_itens', _addItens);
			})();
		} else {
			//_msgIcon = '🔂';
			_textProd = [
				// _msgIcon +
				`*Código:* ${_item_refer} ` +
					'\n' +
					`*Produto:* _${_item_descr}_` +
					`\n` +
					` Preço: *${_price}*` +
					'\n' +
					`  -> ` +
					` _Produto *atualizado* no carrinho:_` +
					'\n' +
					`     ${_item_qtdde}x de: ${_price}` +
					`\n` +
					`  -> ` +
					`_*Informe a nova quantidade do produto escolhido*_` +
					'\n' +
					`Ou digite 0️⃣ _para *excluir* do carrinho._`,
			];
			// Atualiza a Quantidade e Vlir .Unitário do Item
			(async () => {
				let _editItens = {
					Qtde: _item_qtdde,
					Vlr_Unitario: _item_price,
					SubTotal: _item_subtt,
				};
				await db.funcEditDados(
					'Pedidos_itens',
					'Key_Item_Pedido',
					_key_pedido,
					_editItens
				);
			})();
		}

		dados[user]._type.type_option = 'image';
		dados[user]._type.type_file =
			'/produtos/' + dados[user]._pedido_cod_stage + '.png';
		dados[user]._type.type_name = dados[user]._pedido_cod_stage + '.png';

		dados[user].stage = 2;
		dados[user]._pedido_item_stage = 'qtde';
		return _textProd;
	}

	if (dados[user]._pedido_item_stage == 'qtde') {
		if (isNaN(msg)) {
			dados[user].stage = 2;
			dados[user]._pedido_item_stage = 'qtde';
			return [
				`  -> ` +
					' Você informou uma quantidade inválida! ' +
					'\n' +
					`  -> ` +
					'_Digite por exemplo a quantidade: 1, 2 ,3 ... desejada._',
			];
		}

		let _item = {};
		_item = gestor[pms.p]._produto._menuProd[dados[user]._pedido_cod_stage];

		let _item_price = parseFloat(_item[1].replace(',', '.'));
		let _item_qtdde = msg;
		let _item_subtt = _item_qtdde * _item_price;
		let _key_pedido =
			dados[user]._phone_num +
			'-' +
			dados[user]._pedido._numero +
			'-' +
			dados[user]._pedido_cod_stage;
		let _excluir = false;

		for (let a in dados[user]._pedido._itens) {
			if (dados[user]._pedido._itens[a][0] == dados[user]._pedido_cod_stage) {
				if (msg == 0) {
					dados[user]._pedido._itens[a][5] -=
						dados[user]._pedido._itens[a][3] * dados[user]._pedido._itens[a][4];
					_item_subtt = dados[user]._pedido._itens[a][5];

					dados[user]._pedido._itens.splice(
						dados[user]._pedido._itens.indexOf(dados[user]._pedido_cod_stage)
					);
					_excluir = true;
				} else {
					dados[user]._pedido._itens[a][3] = _item_qtdde;
					dados[user]._pedido._itens[a][4] = _item_price;
					dados[user]._pedido._itens[a][5] =
						dados[user]._pedido._itens[a][3] * _item_price;
					_item_qtdde = dados[user]._pedido._itens[a][3];
					_item_subtt = dados[user]._pedido._itens[a][5];
				}
			}
		}
		// Totalizador do Pedido
		dados[user]._pedido._total = dados[user]._pedido._total + _item_subtt;
		(async () => {
			if (_excluir) {
				await db.funcDelDados('Pedidos_itens', 'Key_Item_Pedido', _key_pedido);
			} else {
				let _editItens = {
					Qtde: _item_qtdde,
					Vlr_Unitario: _item_price,
					SubTotal: _item_subtt,
				};
				await db.funcEditDados(
					'Pedidos_itens',
					'Key_Item_Pedido',
					_key_pedido,
					_editItens
				);
			}
		})();

		dados[user].stage = 2;
		dados[user]._pedido_item_stage = 'prod';

		if (_excluir) {
			return [
				`  -> ` + `_Item *Excluído* do carrinho_`,
				`  -> ` +
					` _Para continuar adicionar um *novo produto*, digite o código ou o nome do produto._`,
				`  -> ` + `Ou se preferir digite #️⃣ _Para *finalizar* o pedido._`,
			];
		} else {
			// Apresentação do Procedimento realizado
			return [
				`  -> ` +
					`_*Atualizei o seu carrinho de compra...*_ \n` +
					// `  -> ` +
					`Com _*${_item_qtdde}x* unidade(s) de: ${_item_price.toLocaleString(
						'pt-BR',
						{ style: 'currency', currency: 'BRL' }
					)}_`,
				`  -> ` +
					'_Para adicionar um *novo produto*, digite o código ou o nome do produto._',
				`  -> ` +
					`Ou se preferir digite #️⃣ ` +
					`_Para *finalizar* o pedido digite._`,
			];
		}
	}
}

exports.execute = execute;
