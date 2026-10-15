const { spec } = require('pactum')
const assert = require('assert')

// Endereço da Loja EBAC usada nas aulas do módulo
const BASE_URL = process.env.BASE_URL || 'http://lojaebac.ebaconline.art.br'
const URL_GRAPHQL = `${BASE_URL}/graphql`

// Faz login com o usuário administrador e devolve o token de acesso
async function gerarToken() {
    return spec()
        .post(`${BASE_URL}/public/authUser`)
        .withJson({ email: 'admin@admin.com', password: 'admin123' })
        .expectStatus(200)
        .returns('data.token')
}

// Envia uma query/mutation GraphQL e confere que a API não devolveu erros
async function enviarGraphQL(token, query, variaveis) {
    const resposta = await spec()
        .post(URL_GRAPHQL)
        .withHeaders('Authorization', token)
        .withGraphQLQuery(query)
        .withGraphQLVariables(variaveis)
        .expectStatus(200)

    assert.strictEqual(resposta.json.errors, undefined, `A API retornou erro: ${JSON.stringify(resposta.json.errors)}`)
    return resposta.json
}

// Busca na listagem pública (REST) um item cujo campo tenha o valor informado
async function buscarNaLista(rota, chave, campo, valor) {
    const lista = await spec()
        .get(`${BASE_URL}/public/${rota}`)
        .expectStatus(200)
        .returns(chave)
    return lista.find(item => item[campo] === valor)
}

module.exports = { gerarToken, enviarGraphQL, buscarNaLista }
