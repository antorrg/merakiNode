import { UuidHandler } from "../../Shared/Utils/UuidHandler.js";
import { UserApplications } from "./applications/UserApplictions.js";
import { BooleanConverter } from "../../Shared/Utils/BooleanConverter.js";

export interface UserProps {
  userId: string;
  userEmail: string;
  password?: string;
  role: string;
  userName: string | null;
  nickname: string | null;
  enabled: boolean | number;
  createdAt?: string;
  updatedAt?: string;
}

export type UserCreate = {userEmail:string, password?:string, role:string}
export type UserUpdate = Omit<UserProps, 'userId'|'password'| 'role'| 'enabled'|'createdAt'|'updatedAt'>

export class User {
    protected readonly userId: string
    protected userEmail: string
    protected password?: string
    protected role: string
    protected userName: string | null
    protected nickname: string | null
    protected enabled: boolean
    public readonly createdAt?: string
    public readonly updatedAt?: string

  constructor({ userId, userEmail, password, role, userName, nickname, enabled, createdAt, updatedAt }: UserProps) {
    this.userId = UserApplications.Id(userId)
    this.userEmail = UserApplications.Email(userEmail)
    this.password = password ? User.validatePasswordHash(password) : undefined
    this.role = UserApplications.Role(role)
    this.userName = userName ? User.validateName(userName) : null
    this.nickname = nickname ? User.validateNickname(nickname) : null
    this.enabled = typeof enabled === 'number' ? BooleanConverter.intToBool(enabled) : User.validateEnabled(enabled as boolean)
    this.createdAt = createdAt
    this.updatedAt = updatedAt
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
  static register({userEmail, password, role}:UserCreate){
   if(!userEmail || !password || !role) throw new Error('Missing parameters')
   return new User({
        userId: UuidHandler.idCreator(),
        userEmail: userEmail,
        password: password,
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
      password: this.password as string,
      role: this.role,
      user_name: this.userName ?? undefined,
      nickname: this.nickname ?? undefined,
      enabled: this.enabled
    }
  }

  toDTO() {
    return {
      userId: this.userId,
      userEmail: this.userEmail,
      role: this.role,
      userName: this.userName,
      nickname: this.nickname,
      enabled: this.enabled,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }
}