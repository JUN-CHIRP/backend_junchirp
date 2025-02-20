import { ConsoleLogger, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger as WinstonLogger, transports, createLogger } from 'winston';

@Injectable()
export class LoggerService extends ConsoleLogger {
  private readonly logger: WinstonLogger;

  constructor(private readonly configService: ConfigService) {
    super();
    const metadata = { service: this.configService.get<string>('serviceName') };
    this.logger = createLogger({
      level: this.configService.get<string>('loggerLevel'),
      defaultMeta: metadata,
      transports: [new transports.Console()],
    });
  }

  private metadata(context?: string, trace?: string): any {
    if (!context && !trace) {
      return undefined;
    }

    let meta = {};
    if (context) {
      meta = { context };
    }
    if (trace) {
      meta = { ...meta, trace };
    }
    return meta;
  }

  log(message: string, context?: string) {
    this.info(message, context);
  }

  error(message: string, context?: string, trace?: string) {
    this.logger.error(message, this.metadata(context, trace));
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, this.metadata(context));
  }

  info(message: string, context?: string) {
    this.logger.info(message, this.metadata(context));
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, this.metadata(context));
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, this.metadata(context));
  }

  silly(message: string, context?: string) {
    this.logger.silly(message, this.metadata(context));
  }

  innerLogger(): WinstonLogger {
    return this.logger;
  }
}
