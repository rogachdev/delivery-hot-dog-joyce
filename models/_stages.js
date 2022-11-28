"use strict";
var stages = {
    0: {
        descricao: 'Boas Vindas - Apresenta Menu Principal',
        obj: require('../stages/0'),
    },
    1: {
        descricao: 'Interação do Menu - Stage 0',
        obj: require('../stages/1'),
    },
    2: {
        descricao: 'Inclusão dos Itens no carrinho de Compra',
        obj: require('../stages/2'),
    },
    3: {
        descricao: 'Resumo do Pedido',
        obj: require('../stages/3'),
    },
    4: {
        descricao: 'Forma de Entrega',
        obj: require('../stages/4'),
    },
    5: {
        descricao: 'Localização para Entrega',
        obj: require('../stages/5'),
    },
    6: {
        descricao: 'Forma de Pagamento',
        obj: require('../stages/6'),
    },
    7: {
        descricao: 'Fechamento do Pedido',
        obj: require('../stages/7'),
    },
    8: {
        descricao: 'Pesquisa de Produto',
        obj: require('../stages/8'),
    },

};
exports.step = stages;
