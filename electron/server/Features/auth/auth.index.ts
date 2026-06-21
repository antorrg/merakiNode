import authLogin from './schemas/auth.schema.js';
import { authService } from '../../Shared/dependencies.js';
import { NodeValidator } from 'req-valid-express';


export default {
  login : (data:{email:string, password:string})=>{
    const verifiedData = NodeValidator.validateBody(data, authLogin)
    console.log('verifiedData',verifiedData)
    return authService.login(verifiedData)
  },
  getSession: (sessionId:string)=>{
    return authService.verifyService(sessionId, 'USER')
  },
  logout: (sessionId: string)=>{
    return authService.logout(sessionId)
  }
}