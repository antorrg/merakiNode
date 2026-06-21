import { type Request, type Response, type NextFunction } from 'express'
import { type LoggerServiceDb } from './LoggerServiceDb.js'

export class LoggerController {
  protected service: LoggerServiceDb
  constructor (
    service: LoggerServiceDb
  ) {
    this.service = service
  }

  getAll = async (req: Request, res: Response) => {
    const query = req?.context?.query
    const { info, results } = await this.service.getAll(query!)
    res.status(200).json({ message: 'OK', results: { info, results } })
  }

  getById = async (req: Request, res: Response) => {
    const { id } = req.params
    const results = await this.service.getById(Number(id))
    res.status(200).json({ message: 'OK', results })
  }

  update = async (req: Request, res: Response) => {
    const { id } = req.params
    const data = req.body
    const { message, results } = await this.service.update(Number(id), data)
    res.status(200).json({ message, results })
  }

  delete = async (req: Request, res: Response) => {
    const { id } = req.params
    const results = await this.service.delete(Number(id))
    res.status(200).json({ message: 'OK', results })
  }

  deleteAll = async (req: Request, res: Response) => {
    const response = await this.service.deleteAll()
    res.status(200).json({ message: 'Logs limpiados correctamente', results: response })
  }
}
