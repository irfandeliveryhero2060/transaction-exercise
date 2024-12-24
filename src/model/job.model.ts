import {
  BelongsTo,
  Column,
  DataType,
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

  @Column({
    allowNull: false,
  })
  description: string;

  @Column({
    allowNull: false,
  })
  price: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  paid: boolean;

  @Column
  paymentDate: Date;
}
