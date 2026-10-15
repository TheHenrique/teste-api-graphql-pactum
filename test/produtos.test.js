const assert = require('assert')
const { gerarToken, enviarGraphQL, buscarNaLista } = require('./config')
const { addProductContrato } = require('../contratos/produto.contrato')

const CAMPOS_PRODUTO = `
    name
    description
    price
    specialPrice
    quantity
    popular
    visible
    location`

const ADD_PRODUCT = `
    mutation AddProduct($name: String, $categories: [CategoryInput], $description: String,
        $price: Float, $specialPrice: Float, $photos: [String], $popular: Boolean,
        $quantity: Float, $visible: Boolean, $location: String, $additionalDetails: [String]) {
        addProduct(name: $name, categories: $categories, description: $description,
            price: $price, specialPrice: $specialPrice, photos: $photos, popular: $popular,
            quantity: $quantity, visible: $visible, location: $location, additionalDetails: $additionalDetails) {
            ${CAMPOS_PRODUTO}
        }
    }`

const EDIT_PRODUCT = `
    mutation EditProduct($id: ID!, $name: String, $categories: [CategoryInput], $description: String,
        $price: Float, $specialPrice: Float, $photos: [String], $popular: Boolean,
        $quantity: Float, $visible: Boolean, $location: String, $additionalDetails: [String]) {
        editProduct(id: $id, name: $name, categories: $categories, description: $description,
            price: $price, specialPrice: $specialPrice, photos: $photos, popular: $popular,
            quantity: $quantity, visible: $visible, location: $location, additionalDetails: $additionalDetails) {
            ${CAMPOS_PRODUTO}
        }
    }`

const DELETE_PRODUCT = `
    mutation DeleteProduct($id: ID!) {
        deleteProduct(id: $id) {
            name
        }
    }`

// Dados de um produto válido; cada teste pode sobrescrever o que precisar
function dadosProduto(nome, alteracoes = {}) {
    return {
        name: nome,
        categories: [],
        description: 'Produto criado pelo teste automatizado',
        price: 100,
        specialPrice: 90,
        photos: ['https://via.placeholder.com/150'],
        popular: false,
        quantity: 10,
        visible: true,
        location: 'Brasil',
        additionalDetails: ['Teste EBAC'],
        ...alteracoes
    }
}

const buscarProduto = (campo, valor) => buscarNaLista('getProducts', 'products', campo, valor)

describe('Serviço de Produtos', () => {
    let token
    let produtoId
    const nome = `Produto QA ${Date.now()}`

    before(async () => {
        token = await gerarToken()
    })

    describe('Funcional', () => {
        it('addProduct - deve adicionar um produto', async () => {
            const resposta = await enviarGraphQL(token, ADD_PRODUCT, dadosProduto(nome))
            assert.strictEqual(resposta.data.addProduct.name, nome)

            const produto = await buscarProduto('name', nome)
            assert.ok(produto, 'Produto criado não encontrado na listagem')
            assert.strictEqual(produto.price, 100)
            produtoId = produto._id
        })

        it('editProduct - deve editar o produto criado', async () => {
            const novoNome = `${nome} Editado`
            await enviarGraphQL(token, EDIT_PRODUCT,
                { id: produtoId, ...dadosProduto(novoNome, { price: 150, quantity: 20 }) })

            const produto = await buscarProduto('_id', produtoId)
            assert.strictEqual(produto.name, novoNome)
            assert.strictEqual(produto.price, 150)
            assert.strictEqual(produto.quantity, 20)
        })

        it('deleteProduct - deve excluir o produto criado', async () => {
            await enviarGraphQL(token, DELETE_PRODUCT, { id: produtoId })

            const produto = await buscarProduto('_id', produtoId)
            assert.strictEqual(produto, undefined, 'Produto ainda aparece na listagem')
        })
    })

    describe('Contrato', () => {
        const nomeContrato = `Produto Contrato ${Date.now()}`

        it('addProduct - a resposta deve respeitar o contrato', async () => {
            const resposta = await enviarGraphQL(token, ADD_PRODUCT, dadosProduto(nomeContrato))

            const { error } = addProductContrato.validate(resposta)
            assert.ok(!error, error && error.message)
        })

        // Remove o produto criado no teste de contrato, para não deixar lixo na loja
        after(async () => {
            const produto = await buscarProduto('name', nomeContrato)
            if (produto) await enviarGraphQL(token, DELETE_PRODUCT, { id: produto._id })
        })
    })
})
