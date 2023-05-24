import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, NotEquals } from 'class-validator';

export class MintTransactionDto {
  @ApiProperty()
  @IsNotEmpty()
  address: string;

  @ApiProperty()
  @IsNotEmpty()
  privateKey: string;

  @ApiProperty()
  @NotEquals(0)
  amount: number;
}
