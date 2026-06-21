Sí: para React enviaría **un objeto de sesión público**, pero **no el objeto interno completo**.

Separaría dos cosas:

```txt
Sesión interna en main process:
- sessionId
- userId
- role
- permissions
- createdAt
- expiresAt
- rememberMe
- token/hash interno si existe

Sesión pública para React:
- authenticated
- user
- permissions
```

Ejemplo:

```ts
type PublicSession = {
  authenticated: true
  user: {
    id: string
    username: string
    role: 'OWNER' | 'ADMIN' | 'USER'
  }
  permissions: string[]
}
```

Y si no hay sesión:

```ts
type PublicSession = {
  authenticated: false
}
```

## Para guardar sesión persistente

No guardaría todo el usuario. Guardaría algo mínimo y verificable.

Por ejemplo:

```ts
type StoredSession = {
  userId: string
  sessionId: string
  expiresAt: number
}
```

Ese objeto lo cifrás con `safeStorage` y lo guardás en disco.

Conceptualmente:

```txt
login correcto
→ crear currentSession en memoria
→ si rememberMe = true:
   guardar StoredSession cifrada
```

Al abrir la app:

```txt
main process inicia
→ lee StoredSession cifrada
→ valida expiresAt
→ busca userId en DB
→ reconstruye currentSession
→ React pregunta auth:getSession
→ main responde PublicSession
```

## Ejemplo simple

```ts
let currentSession: Session | null = null

function toPublicSession(session: Session | null) {
  if (!session) {
    return { authenticated: false }
  }

  return {
    authenticated: true,
    user: {
      id: session.userId,
      username: session.username,
      role: session.role
    },
    permissions: session.permissions
  }
}
```

Handler IPC:

```ts
ipcMain.handle('auth:getSession', async () => {
  return toPublicSession(currentSession)
})
```

Login:

```ts
ipcMain.handle('auth:login', async (_event, credentials) => {
  const user = await authService.login(credentials)

  currentSession = {
    sessionId: crypto.randomUUID(),
    userId: user.id,
    username: user.username,
    role: user.role,
    permissions: getPermissionsByRole(user.role),
    createdAt: Date.now(),
    expiresAt: Date.now() + 1000 * 60 * 60 * 24
  }

  return toPublicSession(currentSession)
})
```

React recibe solo esto:

```ts
const session = await window.api.auth.login({
  username,
  password
})

if (session.authenticated) {
  setUser(session.user)
  setPermissions(session.permissions)
}
```

## Regla importante

No mandes a React:

```ts
sessionId
passwordHash
token interno
refresh token
csrf token
datos sensibles
```

React solo necesita saber:

```txt
¿está autenticado?
¿quién es?
¿qué puede ver/hacer en UI?
```

La autorización real se valida siempre en `main process` o servicios.
