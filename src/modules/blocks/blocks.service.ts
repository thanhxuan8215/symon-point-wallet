import { CardanoService } from './../cardano/cardano.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BlocksService {
  constructor(private readonly cardanoService: CardanoService) {}

  getLatestBlock() {
    return this.cardanoService.getLastestBlock();
  }
}
