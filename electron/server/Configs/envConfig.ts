import path from 'path'
import { app } from 'electron'

const isTest = process.env.NODE_ENV === 'test'

const isDev = process.env.NODE_ENV === 'development'


const Status = isDev? 'development' : isTest? 'test': null

const databaseName = isTest
  ? 'database.test.sqlite'
  : isDev
    ? 'database.dev.sqlite'
    : 'database.sqlite'

const databaseDir =
  isDev || isTest
    ? path.resolve(process.cwd(), 'data')
    : app.getPath('userData')




const envConfig = {
  Status,
  DatabasePath: path.join(databaseDir, databaseName)
}

export default envConfig