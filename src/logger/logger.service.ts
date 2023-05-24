import { ConsoleLogger, Injectable } from '@nestjs/common';

@Injectable()
export class LoggerService extends ConsoleLogger {
  error(message: any, stack?: string, context?: string) {
    // add your tailored logic here
    super.error(message, stack, context);
  }

  warn(message: any, context?: string) {
    super.warn(message, context)
  }

  log(message: any, context?: string) {
    super.log(message, context)
  }

  debug(message: any, context?: string) {
    super.debug(message, context)
  }

  verbose(message: any, context?: string) {
    super.verbose(message, context)
  }
}
