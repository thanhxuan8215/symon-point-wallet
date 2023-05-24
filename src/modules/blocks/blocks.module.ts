import { CardanoModule } from './../cardano/cardano.module';
import { Module } from '@nestjs/common';
import { BlocksService } from './blocks.service';
import { BlocksController } from './blocks.controller';

@Module({
  providers: [BlocksService],
  controllers: [BlocksController],
  imports: [CardanoModule],
})
export class BlocksModule {}
