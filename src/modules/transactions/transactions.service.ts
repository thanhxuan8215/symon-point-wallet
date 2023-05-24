import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { updateProperty } from 'src/utils/file';
import { CardanoService } from '../cardano/cardano.service';
import { MintTransactionDto } from './dto/mint-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    private configService: ConfigService,
    private cardanoService: CardanoService,
  ) {}

  mint(mintTransactionDto: MintTransactionDto) {
    const { address, amount, privateKey } = mintTransactionDto;

    const [account, cborHex] = privateKey.split('.');
    if (!account || !cborHex) {
      throw new BadRequestException('Invalid privateKey');
    }

    const wallet = this.cardanoService.getWallet(account);
    if (wallet.paymentAddr !== address) {
      throw new BadRequestException('Invalid address');
    }

    const ownerAccount = this.configService.get('OWNER_ACCOUNT');
    const ownerWallet = this.cardanoService.getWallet(ownerAccount);
    if (!ownerWallet.name) {
      throw new BadRequestException('No owner wallet');
    }

    const script = this.cardanoService.getScript(ownerWallet);
    const assetName = this.configService.get('ASSET_NAME');
    const asset = this.cardanoService.getAsset(script, assetName);

    const addressBalance = this.cardanoService.getAddressBalance(
      address,
      asset,
    );
    const lovelaceBalance = addressBalance.lovelace;
    if (!lovelaceBalance) {
      throw new BadRequestException('Invalid address balance');
    }

    const assetBalance = addressBalance[asset];
    if (amount < 0 && assetBalance < Math.abs(mintTransactionDto.amount)) {
      throw new BadRequestException(
        'Burn amount must be less or equal to existing points',
      );
    }

    const balance = wallet.balance();
    const txInfo = {
      txIn: balance.utxo,
      txOut: [
        {
          address,
          value: {
            ...balance.value,
            [asset]: assetBalance + amount,
          },
        },
      ],
      mint: [
        {
          action: 'mint',
          quantity: amount,
          asset,
          script,
        },
      ],
      witnessCount: 1,
    };
    const fee = this.cardanoService.estimateFee(txInfo);
    const minAdaRequire = +this.configService.get<number>('MINT_ADA_REQUIRE');

    if (lovelaceBalance < minAdaRequire + fee) {
      throw new BadRequestException('Invalid address balance');
    }

    txInfo.txOut[0].value.lovelace -= fee;
    const raw = this.cardanoService.createRawTransaction({ ...txInfo, fee });

    const skey = wallet['payment'].skey;
    updateProperty(skey, 'cborHex', cborHex);

    const signed = this.cardanoService.signMintTransaction(
      wallet,
      ownerWallet,
      raw,
    );

    updateProperty(skey, 'cborHex', '');

    const tip = this.cardanoService.queryTip();
    if (+tip.syncProgress !== 100) {
      throw new BadRequestException('Node has not synced yet');
    }
    const txHash = this.cardanoService.submitTransaction(signed);

    return txHash;
  }

  findOne(id: string) {
    return this.cardanoService.getTransaction(id);
  }
}
