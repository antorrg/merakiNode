import { NodeValidator } from 'req-valid-express';
import * as sch from './schemas/user.schema.js';
import { userService } from '../../Shared/dependencies.js';




export default {

createUser: async(data:any)=>{
    const valid = NodeValidator.validateBody(data as any, sch.createUserSchema)
    const response = await userService.createUser(valid)
    return response
},
getUsers: ()=> {
    return userService.getAll()
},
getUserById: (userId:string)=>{
    const validId = NodeValidator.paramId('userId',userId, NodeValidator.ValidReg.UUIDv4)
    return userService.getById(validId)
},
updateUserProfile: (data:any)=>{
    const validData = NodeValidator.validateBody(data, sch.updateProfileSchema)
    const {userId, rest} = NodeValidator.splitObjectProps(validData, ['userId'])
    const validId = NodeValidator.paramId('userId', userId, NodeValidator.ValidReg.UUIDv4)
    return userService.updateProfile(validId, rest)
},
updateStatusUser: (data:any)=>{
    const validData = NodeValidator.validateBody(data, sch.changeStatusSchema)
    const {userId, enabled} = NodeValidator.splitObjectProps(validData, ['userId'])
    const validId = NodeValidator.paramId('userId', userId, NodeValidator.ValidReg.UUIDv4)
    return userService.changeStatus(validId, enabled as boolean)
},
updateRoleUser: (data:any)=>{
    const validData = NodeValidator.validateBody(data, sch.changeRoleSchema)
    const {userId, role} = NodeValidator.splitObjectProps(validData, ['userId'])
    const validId = NodeValidator.paramId('userId', userId, NodeValidator.ValidReg.UUIDv4)
    return userService.changeRole(validId, role)
},
updatePasswordUser: (data:any)=>{
    const validData = NodeValidator.validateBody(data, sch.changePasswordSchema)
    const {userId, password, newPassword} = NodeValidator.splitObjectProps(validData, ['userId'])
    const validId = NodeValidator.paramId('userId', userId, NodeValidator.ValidReg.UUIDv4)
    return userService.changePassword(validId, password, newPassword)
},
}