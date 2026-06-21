import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import crypto from 'crypto'
import { Session, SessionData } from './Session.js'

describe('Session', () => {
    const validUserId = crypto.randomUUID()
    const validSessionData: SessionData = {
        userId: validUserId,
        username: 'Tony Stark',
        role: 'ADMIN'
    }

    beforeEach(() => {
        // Usamos fake timers de vitest para manipular el tiempo sin tener que esperar
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    describe('createSession', () => {
        it('debería crear una sesión válida con los valores por defecto (no rolling)', () => {
            const session = Session.createSession(validSessionData)
            
            expect(session).toBeInstanceOf(Session)
            expect(session.id).toBeDefined()
            
            const clientData = session.toClient()
            expect(clientData.userId).toBe(validUserId)
            expect(clientData.username).toBe('Tony Stark')
            expect(clientData.role).toBe('ADMIN')
            
            const dbData = session.toJSON()
            expect(dbData.rolling).toBe(false)
            expect(dbData.createdAt).toBeLessThanOrEqual(Date.now())
            // El tiempo por defecto es 1800000 (30 minutos)
            expect(dbData.expiresAt).toBeGreaterThan(dbData.createdAt)
        })

        it('debería crear una sesión rolling si se le especifica', () => {
            const session = Session.createSession(validSessionData, true, 3600000)
            const dbData = session.toJSON()
            expect(dbData.rolling).toBe(true)
            expect(dbData.expiresAt - dbData.createdAt).toBe(3600000)
        })
    })

    describe('verify & rolling behavior', () => {
        it('debería retornar true si la sesión todavía está activa', () => {
            const session = Session.createSession(validSessionData)
            expect(session.verify()).toBe(true)
        })

        it('debería retornar false si la sesión ha expirado', () => {
            const session = Session.createSession(validSessionData, false, 1000) // 1 segundo de vida
            
            // Avanzamos el reloj artificialmente 2 segundos
            vi.advanceTimersByTime(2000)
            
            expect(session.verify()).toBe(false)
        })

        it('debería extender el expiresAt si rolling es true y es verificada exitosamente', () => {
            const session = Session.createSession(validSessionData, true, 1000)
            const initialExpiresAt = session.toJSON().expiresAt
            
            // Avanzamos el tiempo 500ms
            vi.advanceTimersByTime(500)
            
            // Verificarla debería devolver true y empujar el expiresAt al futuro
            expect(session.verify(1000)).toBe(true)
            
            const newExpiresAt = session.toJSON().expiresAt
            expect(newExpiresAt).toBeGreaterThan(initialExpiresAt)
        })
    })

    describe('destroy', () => {
        it('debería invalidar la sesión inmediatamente', () => {
            const session = Session.createSession(validSessionData)
            expect(session.verify()).toBe(true)
            
            session.destroy()
            
            expect(session.verify()).toBe(false)
            expect(session.toJSON().expiresAt).toBe(0)
        })
    })

    describe('hasAccess (Validación de Roles)', () => {
        it('debería dar acceso si el rol es mayor o igual al requerido', () => {
            const adminSession = Session.createSession({ ...validSessionData, role: 'ADMIN' })
            expect(adminSession.hasAccess('ADMIN')).toBe(true)
            expect(adminSession.hasAccess('MODERATOR')).toBe(true)
            expect(adminSession.hasAccess('USER')).toBe(true)
        })

        it('debería denegar el acceso si el usuario tiene un nivel menor al requerido', () => {
            const userSession = Session.createSession({ ...validSessionData, role: 'USER' })
            expect(userSession.hasAccess('ADMIN')).toBe(false)
            expect(userSession.hasAccess('MECANICO')).toBe(false)
            expect(userSession.hasAccess('USER')).toBe(true)
        })
    })
    
    describe('toClient & toJSON exports', () => {
        it('toClient solo debería retornar datos seguros sin fechas internas o estado de rolling', () => {
            const session = Session.createSession(validSessionData)
            const clientData = session.toClient()
            
            expect(clientData).not.toHaveProperty('createdAt')
            expect(clientData).not.toHaveProperty('expiresAt')
            expect(clientData).not.toHaveProperty('rolling')
            
            expect(clientData.userId).toBe(validUserId)
        })

        it('toJSON debería contener todos los datos incluyendo los internos para guardar en Base de Datos', () => {
            const session = Session.createSession(validSessionData)
            const dbData = session.toJSON()
            
            expect(dbData).toHaveProperty('createdAt')
            expect(dbData).toHaveProperty('expiresAt')
            expect(dbData).toHaveProperty('rolling')
            expect(dbData.sessionId).toBe(session.id)
        })
    })
})
