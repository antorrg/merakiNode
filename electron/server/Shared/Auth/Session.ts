import crypto from 'crypto'
import { AuthApplications } from './Applications/AuthApplications.js'

export interface SessionProp {
    sessionId:string
    userId: string
    userName: string
    role: string
    createdAt: number
    expiresAt: number
    rolling: boolean
}
export type SessionData = {
    userId: string
    userName: string
    role: string

}
/*/*  sessionClient: {
    sessionId: '6ebab21b-bb36-44fe-91b8-aef802a6892a',
    userId: '019f5dc0-f686-769e-9902-118cfa453925',
    userName: 'Pedro del Madero',
    role: 'PROPIETARIO'
  }*/
export class Session{
    protected readonly sessionId: string
    protected readonly userId: string
    protected userName: string
    protected role: string
    protected createdAt: number
    protected expiresAt: number
    protected rolling : boolean
 constructor({sessionId, userId, userName, role, createdAt, expiresAt, rolling= false}: SessionProp){
    this.sessionId = AuthApplications.sessionIdVALID(sessionId)
    this.userId = AuthApplications.userIdVALID(userId)
    this.userName = AuthApplications.usernameVALID(userName)
    this.role = AuthApplications.roleVALID(role)
    this.createdAt = AuthApplications.createdAtVALID(createdAt)
    this.expiresAt = AuthApplications.expiresAtVALID(expiresAt)
    this.rolling = rolling
 }
 
    static createSession(sessionData: SessionData, rolling: boolean = false, maxAge?:number): Session {
       const maxTimeToExpire = maxAge? maxAge : 1800000 // 30 min por defecto
       const id = crypto.randomUUID()
       const created_at = Date.now()
       const timeToExpire = created_at + maxTimeToExpire

       return new Session({
        sessionId: id,
        userId: sessionData.userId,
        userName:sessionData.userName,
        role: sessionData.role,
        createdAt: created_at,
        expiresAt: timeToExpire,
        rolling: rolling
       })
    }

    // 1. Verify: Chequea si expiró. Si es rolling y aún es válida, extiende su tiempo.
    verify(maxAge: number = 1800000): boolean {
        const now = Date.now()
        
        if (now >= this.expiresAt) {
            return false // Expirada
        }

        if (this.rolling) {
            this.expiresAt = now + maxAge // Renueva la expiración
        }

        return true
    }

    // 2. Destroy: Invalida la sesión forzando su expiración al instante
    destroy(): void {
        this.expiresAt = 0
    }

    // 3. Validación por roles: Verifica si el nivel del usuario es mayor o igual al requerido
    hasAccess(requiredRole: string): boolean {
        const userLevel = Number(Session.#convertRole(this.role))
        const requiredLevel = Number(Session.#convertRole(requiredRole))

        return userLevel >= requiredLevel
    }

    // Getter para obtener el id fácilmente y buscar en la DB
    get id() {
        return this.sessionId
    }

    // Exportar los datos limpios para guardarlos en la base de datos (SQLite)
    toJSON(): SessionProp {
        return {
            sessionId: this.sessionId,
            userId: this.userId,
            userName: this.userName,
            role: this.role,
            createdAt: this.createdAt,
            expiresAt: this.expiresAt,
            rolling: this.rolling
        }
    }

    // Exportar solo los datos seguros/públicos que necesita el Frontend tras el login
    toClient() {
        return {
            sessionId: this.sessionId,
            userId: this.userId,
            userName: this.userName,
            role: this.role
        }
    }
    static LevelRoles: Record<string, number> = Object.freeze({
        PROPIETARIO: 9,
        PROFESIONAL: 3,
        SECRETARIO: 1
    })

    static #convertRole(p: number | string): number {
        if (typeof p === 'number') {
            return p
        }

        const key = p.trim()
        const val = Session.LevelRoles[key]
        return typeof val === 'number' ? val : Session.LevelRoles.SECRETARIO
    }

}
