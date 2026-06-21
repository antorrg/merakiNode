export function fileTransport () {
  return {
    target: 'pino-pretty',
    options: {
      colorize: false,
      destination: './logs/app.log',
      mkdir: true
    }
  }
}
