import { Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Contract } from './contract.model';

@Table
export class Job extends Model {
  @ForeignKey(() => Contract)
  @Column
  ContractId: number;

  @Column
  description: string;

  @Column
  price: number;

  @Column
  paid: boolean;

  @Column
  paymentDate: Date;
}
