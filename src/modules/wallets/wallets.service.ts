import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getProperty, updateProperty } from 'src/utils/file';
import { CardanoService } from '../cardano/cardano.service';

@Injectable()
export class WalletsService {
  constructor(
    private configService: ConfigService,
    private readonly cardanoService: CardanoService,
  ) {}

  async create() {
    const account = new Date().valueOf().toString();
    const wallet = await this.cardanoService.createWallet(account);

    const cborHex = getProperty(wallet.skey, 'cborHex');
    updateProperty(wallet.skey, 'cborHex', '');

    return {
      address: wallet.address,
      privateKey: [account, cborHex].join('.'),
    };
  }

  getAddressBalance(address: string) {
    try {
      const ownerAccount = this.configService.get('OWNER_ACCOUNT');
      const ownerWallet = this.cardanoService.getWallet(ownerAccount);
      const script = this.cardanoService.getScript(ownerWallet);

      const assetName = this.configService.get('ASSET_NAME');
      const asset = this.cardanoService.getAsset(script, assetName);

      const addressBalance = this.cardanoService.getAddressBalance(
        address,
        asset,
      );

      return {
        lovelace: addressBalance.lovelace,
        [assetName.toLowerCase()]: addressBalance[asset],
      };
    } catch (error) {
      throw new BadRequestException(`Can query balance of ${address}`);
    }
  }
}
