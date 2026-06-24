import {usersSeed,} from './seeds.js'
import { userService } from '../electron/server/Shared/dependencies.js'
import { BaseRepository } from '../electron/server/Shared/Repositories/BaseRepository.js'
import { Hasher } from '../electron/server/Shared/Utils/Hasher.js'
import { UserProps } from '../electron/server/Features/user/User.js'

const userseed = userService
const userRepo = new BaseRepository('users', 'user_id')


const dataSeedUsers = async( seeds: UserProps[])=>{
    const users = await userseed.getAll()
    if(users.length > 0){
        // console.dir(users)
        console.log(`La db ya contiene usuarios`)
    }else{
        const usersCreated = seeds.map(async (s) => {
            const hashedPassword = await Hasher.hash(s.password!);
            const userToInsert = {
                ...s,
                password: hashedPassword
            };
            return userRepo.create(userToInsert);
        });
        await Promise.all(usersCreated)
        console.log(`la tabla usuarios fue poblada con datos`)
    }
}

export const fillDbWithSeeds = async()=>{
    await Promise.all([
        dataSeedUsers(usersSeed)
    ])
}
