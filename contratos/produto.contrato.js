const Joi = require('joi')

// Contrato da resposta da mutation addProduct
const addProductContrato = Joi.object({
    data: Joi.object({
        addProduct: Joi.object({
            name: Joi.string().required(),
            description: Joi.string().required(),
            price: Joi.number().required(),
            specialPrice: Joi.number().required(),
            quantity: Joi.number().required(),
            popular: Joi.boolean().required(),
            visible: Joi.boolean().required(),
            location: Joi.string().required()
        }).required()
    }).required()
})

module.exports = { addProductContrato }
