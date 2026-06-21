import { UuidHandler } from "../../Shared/Utils/UuidHandler.js";
import { UserApplications } from "./applications/UserApplictions.js";

export interface UserProps {
  userId: string;
  userEmail: string;
  password: string;
  role: string;
  userName: string;
  nickname: string;
  enabled: boolean;
}
export type UserCreate = {userEmail:string, hashedPassword:string, role:string}
export type UserUpdate = Omit<UserProps, 'userId'|'password'| 'role'| 'enabled'>

export class User {
    protected readonly userId: string
    protected userEmail: string
    protected password: string
    protected role: string
    protected userName: string
    protected nickname: string
    protected enabled: boolean
  

  constructor({ userId, userEmail, password, role, userName, nickname, enabled }: UserProps) {
    this.userId = UserApplications.Id(userId)
    this.userEmail = UserApplications.Email(userEmail)
    this.password = User.validatePasswordHash(password)
    this.role = UserApplications.Role(role)
    this.userName = User.validateName(userName)
    this.nickname = User.validateNickname(nickname)
    this.enabled = User.validateEnabled(enabled)
  }
  static validatePasswordHash(prop:string):string{
    if(typeof prop !== 'string' || prop.length < 20) throw new Error('Invalid password hash')
        return prop
  }
  static validateName(prop:string):string{
       if(typeof prop !== 'string'|| prop.length < 5) throw new Error('Invalid userName')
        return prop
  }
  static validateNickname(prop:string):string{
       if(typeof prop !== 'string') throw new Error('Invalid nickname')
        return prop
  }
  static validateEnabled(prop:boolean):boolean{
       if(typeof prop !== 'boolean') throw new Error('Invalid enabled')
        return prop
  }
  static register({userEmail, hashedPassword, role}:UserCreate){
   if(!userEmail || !hashedPassword || !role) throw new Error('Missing parameters')
   return new User({
        userId: UuidHandler.idCreator(),
        userEmail: userEmail,
        password: hashedPassword,
        userName: 'No name',
        nickname: userEmail?.split('@')[0] ?? 'user',
        role: role,
        enabled: true
    })
  }
  // Métodos de dominio (cambios de estado autorizados)
  disableUser() {
    this.enabled = false;
  }
  enabledUser(){
    this.enabled = true
  }

 changePassword(hashedPassword: string) {
    this.password = User.validatePasswordHash(hashedPassword);
  }

changeRole(role:string) {
    this.role = UserApplications.Role(role)
  }

updateProfile(user: UserUpdate){ 
        this.userEmail = user.userEmail
        this.userName = user.userName
        this.nickname = user.nickname
  }
changeEmail(email:string) {
    this.userEmail = UserApplications.Email(email)
  }

  // Mapeos para Infraestructura (DB) y Cliente (DTO)
  toPersistence() {
    return {
      user_id: this.userId,
      user_email: this.userEmail,
      password: this.password,
      role: this.role as any,
      user_name: this.userName,
      nickname: this.nickname,
      enabled: this.enabled ? 1 : 0
    }
  }

  toDTO() {
    return {
      userId: this.userId,
      user_email: this.userEmail,
      role: this.role,
      user_name: this.userName,
      nickname: this.nickname,
      enabled: this.enabled
    }
  }
}