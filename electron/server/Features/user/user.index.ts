import { NodeValidator } from 'req-valid-express';
import * as sch from './schemas/user.schema.js';
import { userService } from '../../Shared/dependencies.js';
import { UuidHandler } from '../../Shared/Utils/UuidHandler.js';

///^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/


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
    const validId = NodeValidator.paramId({userId}, 'userId', UuidHandler.regexUuid)
    return userService.getById(validId)
},
updateUserProfile: (data: unknown)=>{
    console.log('datos de update', data)
    const validData = NodeValidator.validateBody(data, sch.updateProfileSchema)
    const {userId, email, name, nickname} = NodeValidator.splitObjectProps(validData, ['userId', 'email', 'name','nickname'])
    const validId = NodeValidator.paramId({userId}, 'userId', UuidHandler.regexUuid)
    const updateData: import('./User.js').UserUpdate = {
        userEmail: email as string,
        userName: name as string,
        nickname: nickname as string | null
    };
    return userService.updateProfile(validId, updateData)
},
updateStatusUser: (data: unknown)=>{
    const validData = NodeValidator.validateBody(data, sch.changeStatusSchema)
    const {userId, enabled,role} = NodeValidator.splitObjectProps(validData, ['userId','enabled', 'role'])
    const validId = NodeValidator.paramId({userId}, 'userId', UuidHandler.regexUuid)
    const validatedInput = {
        enabled,
        role
    }
    return userService.updateStatusUser(validId, validatedInput)
},
updatePasswordUser: (data: unknown)=>{
    const validData = NodeValidator.validateBody(data, sch.changePasswordSchema)
    const {userId, password, newPassword} = NodeValidator.splitObjectProps(validData, ['userId', 'password', 'newPassword'])
    const validId = NodeValidator.paramId({userId}, 'userId', UuidHandler.regexUuid)
    return userService.changePassword(validId, password, newPassword)
},
deleteUser: (userId:string) => {
    const validId = NodeValidator.paramId({userId}, 'userId', UuidHandler.regexUuid)
    return userService.deleteUser(validId)
}
}