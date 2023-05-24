import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common'
import { HttpArgumentsHost } from '@nestjs/common/interfaces/features/arguments-host.interface'
import { Response } from 'express'
import { LoggerService } from 'src/logger/logger.service'

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  constructor(private logger: LoggerService) {}

  catch(exception: HttpException | Error, host: ArgumentsHost): void {
    const ctx: HttpArgumentsHost = host.switchToHttp()
    const response: Response = ctx.getResponse()
    let statusCode: HttpStatus
    let message: any
    
    if (exception instanceof HttpException) {
      const response: any = exception.getResponse()
      statusCode = exception.getStatus()
      message = response
    } else {
      statusCode = (exception as any).response?.status
        ? (exception as any).response.status
        : HttpStatus.INTERNAL_SERVER_ERROR
      message = (exception as any).response?.data?.message
        ? (exception as any).response.data.message
        : (exception as any).message
      this.logger.error(
        `ERROR - ${message} ` + (exception as any).stack || (exception as any).trace
      )
    }

    response.status(statusCode).json({
      statusCode,
      message,
    })
  }
}
