import {emailRegex, passwordRegex} from '../../shared/utils/regex'

export type InputCreateValue = {
  email: string
  username: string
}
export type ErrorCreateValue = {
    email?: string |undefined
    username?: string | undefined
}
export type InputLoginValue = {
  email: string
  password: string
}
export type ErrorLoginValue = {
    email?: string
    password?: string
}

export const createValidator = (input:InputCreateValue): ErrorCreateValue | undefined =>{
    const errors:ErrorCreateValue = {}
    if(!input.email){
        errors.email = "Este campo no puede estar vacio"
    }
    if(!emailRegex.test(input.email)){
        errors.email = "Formato de email inválido"
    }
    if(!input.username.trim()){
        errors.username = "Este campo no puede estar vacio"
    }
    if(input.username.length < 5){
        errors.username = "El nombre de usuario no debe tener menos de 5 caracteres"
    }
    return errors
}
export const loginValidator = (input:InputLoginValue): ErrorLoginValue | undefined =>{
    const errors:ErrorLoginValue = {}

    if(!input.email.trim()){
        errors.email = "Este campo no puede estar vacio"
    }
    if(!emailRegex.test(input.email)){
        errors.email = "Formato de email inválido"
    }
    if(!input.password.trim()){
        errors.password = "Este campo no puede estar vacio"
    }
    if(!passwordRegex.test(input.password)){
        errors.password = "El password debe tener no menos de 8 caracteres un numero y una mayuscula"
    }
    return errors
}