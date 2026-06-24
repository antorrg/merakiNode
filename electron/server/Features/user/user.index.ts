import { NodeValidator } from 'req-valid-express';
import * as sch from './schemas/user.schema.js';
import { userService } from '../../Shared/dependencies.js';




export default {

createUser: async(data: unknown)=>{
    const valid = NodeValidator.validateBody(data, sch.createUserSchema)
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
updateUserProfile: (data: unknown)=>{
    const validData = NodeValidator.validateBody(data, sch.updateProfileSchema)
    const {userId, rest} = NodeValidator.splitObjectProps(validData, ['userId'])
    const validId = NodeValidator.paramId('userId', userId, NodeValidator.ValidReg.UUIDv4)
    const updateData: import('./User.js').UserUpdate = {
        userEmail: (rest as any).email as string,
        userName: (rest as any).name as string,
        nickname: (rest as any).nickname as string | null
    };
    return userService.updateProfile(validId, updateData)
},
updateStatusUser: (data: unknown)=>{
    const validData = NodeValidator.validateBody(data, sch.changeStatusSchema)
    const {userId, enabled} = NodeValidator.splitObjectProps(validData, ['userId'])
    const validId = NodeValidator.paramId('userId', userId, NodeValidator.ValidReg.UUIDv4)
    return userService.changeStatus(validId, enabled as boolean)
},
updateRoleUser: (data: unknown)=>{
    const validData = NodeValidator.validateBody(data, sch.changeRoleSchema)
    const {userId, role} = NodeValidator.splitObjectProps(validData, ['userId'])
    const validId = NodeValidator.paramId('userId', userId, NodeValidator.ValidReg.UUIDv4)
    return userService.changeRole(validId, role)
},
updatePasswordUser: (data: unknown)=>{
    const validData = NodeValidator.validateBody(data, sch.changePasswordSchema)
    const {userId, password, newPassword} = NodeValidator.splitObjectProps(validData, ['userId'])
    const validId = NodeValidator.paramId('userId', userId, NodeValidator.ValidReg.UUIDv4)
    return userService.changePassword(validId, password, newPassword)
},
}