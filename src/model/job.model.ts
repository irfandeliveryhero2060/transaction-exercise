import { BelongsTo, Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Contract } from 'src/model/contract.model';

@Table({
  timestamps: false, // Disable auto-handling of createdAt and updatedAt
})
export class Job extends Model {
  @ForeignKey(() => Contract)
  @Column
  ContractId: number;

  @BelongsTo(() => Contract)
  contract: Contract;  // This will ensure the relationship is defined in the Job model

  @Column
  description: string;

  @Column
  price: number;

  @Column
  paid: boolean;

  @Column
  paymentDate: Date;
}
