const assert = require('assert')
const { gerarToken, enviarGraphQL, buscarNaLista } = require('./config')
const { addCategoryContrato } = require('../contratos/categoria.contrato')

const ADD_CATEGORY = `
    mutation AddCategory($name: String, $photo: String) {
        addCategory(name: $name, photo: $photo) {
            name
            photo
        }
    }`

const EDIT_CATEGORY = `
    mutation EditCategory($id: ID!, $name: String, $photo: String) {
        editCategory(id: $id, name: $name, photo: $photo) {
            name
            photo
        }
    }`

const DELETE_CATEGORY = `
    mutation DeleteCategory($id: ID!) {
        deleteCategory(id: $id) {
            name
        }
    }`

const FOTO = 'https://via.placeholder.com/150'

const buscarCategoria = (campo, valor) => buscarNaLista('getCategories', 'categories', campo, valor)

describe('Serviço de Categorias', () => {
    let token
    let categoriaId
    const nome = `Categoria QA ${Date.now()}`

    before(async () => {
        token = await gerarToken()
    })

    describe('Funcional', () => {
        it('addCategory - deve adicionar uma categoria', async () => {
            const resposta = await enviarGraphQL(token, ADD_CATEGORY, { name: nome, photo: FOTO })
            assert.strictEqual(resposta.data.addCategory.name, nome)

            const categoria = await buscarCategoria('name', nome)
            assert.ok(categoria, 'Categoria criada não encontrada na listagem')
            categoriaId = categoria._id
        })

        it('editCategory - deve editar a categoria criada', async () => {
            const novoNome = `${nome} Editada`
            await enviarGraphQL(token, EDIT_CATEGORY, { id: categoriaId, name: novoNome, photo: FOTO })

            const categoria = await buscarCategoria('_id', categoriaId)
            assert.strictEqual(categoria.name, novoNome)
        })

        it('deleteCategory - deve excluir a categoria criada', async () => {
            await enviarGraphQL(token, DELETE_CATEGORY, { id: categoriaId })

            const categoria = await buscarCategoria('_id', categoriaId)
            assert.strictEqual(categoria, undefined, 'Categoria ainda aparece na listagem')
        })
    })

    describe('Contrato', () => {
        const nomeContrato = `Categoria Contrato ${Date.now()}`

        it('addCategory - a resposta deve respeitar o contrato', async () => {
            const resposta = await enviarGraphQL(token, ADD_CATEGORY, { name: nomeContrato, photo: FOTO })

            const { error } = addCategoryContrato.validate(resposta)
            assert.ok(!error, error && error.message)
        })

        // Remove a categoria criada no teste de contrato, para não deixar lixo na loja
        after(async () => {
            const categoria = await buscarCategoria('name', nomeContrato)
            if (categoria) await enviarGraphQL(token, DELETE_CATEGORY, { id: categoria._id })
        })
    })
})
