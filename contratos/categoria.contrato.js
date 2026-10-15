const Joi = require('joi')

// Contrato da resposta da mutation addCategory
const addCategoryContrato = Joi.object({
    data: Joi.object({
        addCategory: Joi.object({
            name: Joi.string().required(),
            photo: Joi.string().required()
        }).required()
    }).required()
})

module.exports = { addCategoryContrato }
