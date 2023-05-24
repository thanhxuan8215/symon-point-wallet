import { Injectable } from '@nestjs/common';
import { ServerStatus } from './shared/enums';

@Injectable()
export class AppService {
  checkHealth(): ServerStatus {
    return ServerStatus.Ok;
  }
}
