import { Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Profile } from './profile.model';

@Table
export class Contract extends Model {
  @ForeignKey(() => Profile)
  @Column
  ClientId: number;

  @ForeignKey(() => Profile)
  @Column
  ContractorId: number;

  @Column
  terms: string;

  @Column
  status: string;
}
