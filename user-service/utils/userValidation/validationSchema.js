const Joi = require('joi')

const signUpBodyValidation = (body) =>{
    const schema = Joi.object({
        firstname: Joi.string().min(3).max(30).required().label('firstname'),
        lastname: Joi.string().min(3).max(30).required().label('lastname'),
        email: Joi.string().email().required().label('email'),
        password: Joi.string().min(8).required().label('password')
    });
    return schema.validate(body);
};

const logInBodyValidation = (body) => {
    const schema = Joi.object({
        email: Joi.string().email().required().label("email"),
        password: Joi.string().required().label("password"),
    });
    return schema.validate(body);
};

module.exports =  {
    signUpBodyValidation,
    logInBodyValidation,
};