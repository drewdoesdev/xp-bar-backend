const Validator = require("validator");
const isEmpty = require("is-empty");
const { default: validator } = require("validator");
module.exports = function validateLoginInput(data) {
    let errors = [];

    // Convert empty fields to an empty string so we can use validator functions
    data.username = !isEmpty(data.username) ? data.username : "";
    data.password = !isEmpty(data.password) ? data.password : "";
    // username checks
    if (Validator.isEmpty(data.username)) {
        errors.push("Username field is required");
    } 
    
    // Password checks
    switch(data.password){
        case validator.isEmpty(data.password):
            errors.push("Password field is required.");
            break;
        default:
            break;
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };
};