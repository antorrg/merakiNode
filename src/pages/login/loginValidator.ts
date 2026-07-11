
export type InputValue = {
  username: string
  password: string
}
export type ErrorValue = {
    username?: string
    password?: string
}

export const loginValidator = (input:InputValue): ErrorValue=>{
    const errors:ErrorValue = {}
    const passwordReg:RegExp = /^(?=.*[A-Z]).{8,}$/
    if(!input.username.trim()){
        errors.username = "Este campo no puede estar vacio"
    if(input.username.length < 5){
        errors.username = "El nombre de usuario no debe tener menos de 5 caracteres"
    }
    }if(!input.password.trim()){
        errors.password = "Este campo no puede estar vacio"
    }if(!passwordReg.test(input.password)){
        errors.password = "El password debe tener no menos de 8 caracteres un numero y una mayuscula"
    }
    return errors
}