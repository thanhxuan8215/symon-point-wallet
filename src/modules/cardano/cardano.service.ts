import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CardanocliJs } from 'cardanocli-js';
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';

const Cardanocli = require('cardanocli-js');

@Injectable()
export class CardanoService {
  private readonly logger = new Logger(CardanoService.name);
  private cli: CardanocliJs;
  private blockfrost: BlockFrostAPI;

  constructor(private configService: ConfigService) {
    const options = {
      shelleyGenesisPath: this.configService.get('SHELLEY_PATH'),
      network: this.configService.get('NETWORK'),
      socketPath: this.configService.get('SOCKET_PATH'),
    };
    this.cli = new Cardanocli(options);
    this.blockfrost = new BlockFrostAPI({
      projectId: this.configService.get('BLOCKFROST_PROJECT_ID'),
    });
  }

  async createWallet(account: string) {
    const payment = this.cli.addressKeyGen(account);
    const stake = this.cli.stakeAddressKeyGen(account);
    this.cli.stakeAddressBuild(account);
    this.cli.addressBuild(account, {
      paymentVkey: payment.vkey,
      stakeVkey: stake.vkey,
    });
    const wallet = this.cli.wallet(account);

    const { skey } = wallet['payment'];
    return { address: wallet.paymentAddr, skey };
  }

  getWallet(account: string) {
    try {
      return this.cli.wallet(account);
    } catch (error) {
      this.logger.log(`getWallet: ${JSON.stringify(error)}`);
      throw new Error('Invalid wallet');
    }
  }

  estimateFee(transaction) {
    let raw = this.cli.transactionBuildRaw(transaction);
    return this.cli.transactionCalculateMinFee({
      ...transaction,
      txBody: raw,
    });
  }

  createRawTransaction(transaction) {
    return this.cli.transactionBuildRaw(transaction);
  }

  signMintTransaction(wallet, ownerWallet, txBody) {
    try {
      return this.cli.transactionSign({
        signingKeys: [wallet.payment.skey, ownerWallet.payment.skey],
        txBody,
      });
    } catch (error) {
      this.logger.log(`signMintTransaction: ${JSON.stringify(error)}`);
      throw new Error('Invalid private key');
    }
  }

  submitTransaction(transaction) {
    return this.cli.transactionSubmit(transaction);
  }

  getScript(wallet) {
    const pubKeyHash = this.cli.addressKeyHash(wallet.name);
    return {
      keyHash: pubKeyHash,
      type: 'sig',
    };
  }

  getAsset(script, assetName) {
    const assetHex = Buffer.from(assetName).toString('hex');
    const policy = this.cli.transactionPolicyid(script);

    return `${policy}.${assetHex}`;
  }

  getAddressBalance(address: string, asset: string) {
    const utxos = this.cli.queryUtxo(address);
    const balance = utxos.reduce(
      (result, item) => {
        const lovelace = item.value?.lovelace || 0;
        const assetBalance = item.value?.[asset] || 0;
        return {
          lovelace: result.lovelace + lovelace,
          [asset]: result[asset] + assetBalance,
        };
      },
      { lovelace: 0, [asset]: 0 },
    );

    return balance;
  }

  queryTip() {
    return this.cli.queryTip();
  }

  async getTransaction(txid: string) {
    try {
      const transaction = await this.blockfrost.txs(txid);
      return transaction;
    } catch (error) {
      this.logger.log(`getTransaction: ${JSON.stringify(error)}`);
      throw new Error(`Can not get transaction information with ID ${txid}`);
    }
  }

  async getLastestBlock() {
    try {
      const latestBlock = await this.blockfrost.blocksLatest();
      return latestBlock;
    } catch (error) {
      this.logger.log(`getLatestBlock: ${JSON.stringify(error)}`);
      throw new Error(`Can not get latest block`);
    }
  }

  getTransactionStatus(txid: string) {}
}
