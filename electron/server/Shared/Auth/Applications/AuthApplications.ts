import { UuidHandler } from "../../Utils/UuidHandler"
type Role = 'ADMIN' | 'MODERATOR' | 'MECANICO' | 'USER'

export class AuthApplications {



  static #allowedRoles: Role[] = ['ADMIN', 'MODERATOR', 'MECANICO', 'USER']

  static #uuidValidator(id: string): string {
    if (!id) {
      throw new Error('Missing UUID')
    }

    if (typeof id !== 'string') {
      throw new Error('Invalid UUID type')
    }

    return UuidHandler.idValidator(id)
  }

  static sessionIdVALID(sessionId: string): string {
    return AuthApplications.#uuidValidator(sessionId)
  }

  static userIdVALID(userId: string): string {
    return AuthApplications.#uuidValidator(userId)
  }

  static usernameVALID(username: string): string {
    if (!username) {
      throw new Error('Missing username')
    }

    if (typeof username !== 'string') {
      throw new Error('Invalid username type')
    }

    const cleanUsername = username.trim()

    if (cleanUsername.length < 2) {
      throw new Error('Username too short')
    }

    return cleanUsername
  }

  static roleVALID(role: string): Role {
    if (!role) {
      throw new Error('Missing role')
    }

    if (!AuthApplications.#allowedRoles.includes(role as Role)) {
      throw new Error('Invalid role')
    }

    return role as Role
  }

  static createdAtVALID(createdAt: number): number {
    if (!createdAt) {
      throw new Error('Missing createdAt')
    }

    if (typeof createdAt !== 'number') {
      throw new Error('Invalid createdAt type')
    }

    if (!Number.isInteger(createdAt)) {
      throw new Error('Invalid createdAt format')
    }

    if (createdAt > Date.now()) {
      throw new Error('createdAt cannot be in the future')
    }

    return createdAt
  }

  static expiresAtVALID(expiresAt: number): number {
    if (!expiresAt) {
      throw new Error('Missing expiresAt')
    }

    if (typeof expiresAt !== 'number') {
      throw new Error('Invalid expiresAt type')
    }

    if (!Number.isInteger(expiresAt)) {
      throw new Error('Invalid expiresAt format')
    }

    if (Date.now() >= expiresAt) {
      throw new Error('Session expired')
    }

    return expiresAt
  }
}