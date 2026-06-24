import { UserProps } from '../electron/server/Features/user/User.js';
export const usersSeed: UserProps[] = [
    {
      userId: "019d60b0-8fcd-7339-b8ea-9f16df713fb1",
      userEmail: "pericodelospalotes@gmail.com",
      password: 'L1234567',
      role: "ADMIN",
      userName: "Pedro del madero",
      nickname: "pericodelospalotes",
      enabled: true
    },
    {
      userId: "019d63fc-c2a9-745f-b742-ef36545d98a8",
      userEmail: "antoniorodrigueztkds@gmail.com",
      password: 'L1234567',
      role: "USER",
      userName: "No name",
      nickname: "antoniorodrigueztkds",
      enabled: true
    },
    {
      userId: "019d63fd-5d67-774a-b8ea-b97f571a99dc",
      userEmail: "josenomeacuerdo@gmail.com",
      password: 'L1234567',
      role: "USER",
      userName: "No name",
      nickname: "josenomeacuerdo",
      enabled: true
    }
]