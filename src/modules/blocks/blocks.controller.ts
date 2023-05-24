import { Controller, Get } from '@nestjs/common';
import { BlocksService } from './blocks.service';

@Controller('blocks')
export class BlocksController {
  constructor(private readonly blockService: BlocksService) {}

  @Get('latest')
  getLatestBlock() {
    return this.blockService.getLatestBlock();
  }
}
