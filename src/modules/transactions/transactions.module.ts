import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { CardanoModule } from '../cardano/cardano.module';

@Module({
  controllers: [TransactionsController],
  providers: [TransactionsService],
  imports: [CardanoModule],
})
export class TransactionsModule { }
