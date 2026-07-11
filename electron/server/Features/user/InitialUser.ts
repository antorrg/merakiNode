import { app } from 'electron'
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'

export class InitialUser{
    static generatePassword(length = 12) {
    const lower = 'abcdefghijklmnopqrstuvwxyz'
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const digits = '0123456789'
    const symbols = '!@#$%&*()-_¿+[]{};:<>/?'

    const all = lower + digits + upper// + symbols

    let password = ''

    // 1. Garantizar al menos una mayúscula y un símbolo
    password += upper[crypto.randomInt(upper.length)]
    password += symbols[crypto.randomInt(symbols.length)]

    // 2. Completar el resto hasta el largo deseado
    for (let i = 2; i < length; i++) {
      password += all[crypto.randomInt(all.length)]
    }

    // 3. Mezclar el resultado para que la mayúscula no quede siempre al principio
    return password
      .split('')
      .sort(() => crypto.randomInt(2) - 1)
      .join('')
    }
    static async writePassword(value:string, nameFile: string='user'){
       const documentsPath = app.getPath('documents')
        const filePath = path.join(documentsPath, `${nameFile}.txt`)
        const content = `DOCUMENTO GENERADO AUTOMATICAMENTE, NO EDITAR\n\n${value}`

        return await writeFile(filePath, content, 'utf8')
    }
}