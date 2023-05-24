import { Module } from '@nestjs/common';
import { CardanoModule } from '../cardano/cardano.module';
import { WalletsController } from './wallets.controller';
import { WalletsService } from './wallets.service';

@Module({
  controllers: [WalletsController],
  imports: [CardanoModule],
  providers: [WalletsService]
})
export class WalletsModule {}
