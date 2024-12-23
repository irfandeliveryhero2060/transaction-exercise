import {
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Contract } from './contract.model';

@Table({
  timestamps: false,
})
export class Job extends Model {
  @ForeignKey(() => Contract)
  @Column
  ContractId: number;

  @BelongsTo(() => Contract)
  contract: Contract;

  @Column
  description: string;

  @Column
  price: number;

  @Column
  paid: boolean;

  @Column
  paymentDate: Date;
}
