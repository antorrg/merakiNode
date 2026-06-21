import {usersSeed, clientSeed} from './seeds.js'
import { userService } from '../electron/server/Shared/dependencies.js'
import { BaseRepository } from '../electron/server/Shared/Repositories/BaseRepository.js'
import { Hasher } from '../electron/server/Shared/Utils/Hasher.js'

const userseed = userService
const userRepo = new BaseRepository('users', 'user_id')
const clientseed = new BaseRepository('clients', 'client_id')
// const createSeed = (data:any, modelName:string)=>{
//     try{
//     const columns = Object.keys(data)
//     const values = Object.values(data)
//     const placeholders = columns.map(() => "?").join(", ");
//     const stmt = db.db.prepare(`
//         INSERT INTO ${modelName} (${columns.join(", ")})
//         VALUES (${placeholders})
//         `)
//     const result = stmt.run(values)
//     if(!result){throw new Error(`Error creando "${modelName}"`)}
//     return 
//     }catch(error){
//         throw error
//     }
// }
// const findOldSeeds = (modelName:string)=>{
//     try {
//         const result = db.db.prepare(`SELECT * FROM ${modelName}`).all()
//         return result
//     } catch (error) {
//         throw error
//     }
// }
// const dataSeed = async(tableName:string, seeds: any[])=>{
//     const users = findOldSeeds(tableName)
//     if(users.length >0){
//         console.log(`La db ya contiene ${tableName}`)
//     }else{
//         seeds.forEach(s => createSeed(s, tableName))
//         console.log(`${tableName} fue poblada con datos`)
//     }
// }
const dataSeedUsers = async( seeds: any[])=>{
    const users = await userseed.getAll()
    if(users.length > 0){
        // console.dir(users)
        console.log(`La db ya contiene usuarios`)
    }else{
        const usersCreated = seeds.map(async (s) => {
            const hashedPassword = await Hasher.hash(s.password);
            const userToInsert = {
                ...s,
                password: hashedPassword
            };
            return userRepo.create(userToInsert);
        });
        await Promise.all(usersCreated)
        // const datos = await userseed.getAll()
        // console.dir(datos)
        console.log(`la tabla usuarios fue poblada con datos`)
    }
}
const dataSeedclient = async( seeds: any[])=>{
    const users = clientseed.getAll()
    if(users.results!.length >0){
        console.dir(users.results)
        console.log(`La db ya contiene clientes`)
    }else{
        seeds.forEach(s => clientseed.create(s))
        console.log(`la tabla clientes fue poblada con datos`)
    }
}
export const fillDbWithSeeds = async()=>{
    await Promise.all([
        dataSeedUsers(usersSeed),
        dataSeedclient (clientSeed)
    ])
}
