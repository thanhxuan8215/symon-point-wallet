import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CardanoService } from '../cardano/cardano.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { WalletsService } from './wallets.service';

@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post()
  create(@Body() createWalletDto: CreateWalletDto) {
    return this.walletsService.create();
  }

  @Get('balance/:address')
  findOne(@Param('address') address: string) {
    return this.walletsService.getAddressBalance(address);
  }
}
