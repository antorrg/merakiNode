export class BooleanConverter {
    static boolToInt (value:boolean):number{
      if(typeof value !== 'boolean')throw new TypeError(`${value} is not a boolean`)
      if(value === true){
        return 1
      }else {
        return 0
      }
    }
  static intToBool(value:number):boolean{
     if(!Number.isInteger(value)) throw new TypeError(`${value} is not an integer number`)
      if(Number(value) === 1){
        return true
      }else if(Number(value) === 0){
        return false
      }else {
        throw new TypeError(`${value} must be a number 0 or 1`)
      }
    }
  }