import {
  Column,
  ForeignKey,
  Model,
  Table,
  HasMany,
  DataType,
} from 'sequelize-typescript';
import { Profile } from './profile.model';
import { Job } from './job.model';

@Table({
  timestamps: false,
})
export class Contract extends Model {
  @ForeignKey(() => Profile)
  @Column
  ClientId: number;

  @ForeignKey(() => Profile)
  @Column
  ContractorId: number;

  @Column
  terms: string;

  @Column({
    type: DataType.ENUM('new', 'in_progress', 'terminated'),
    allowNull: false,
  })
  status: string;

  @HasMany(() => Job)
  jobs: Job[];
}

export enum ContractStatus {
  NEW = 'new',
  IN_PROGRESS = 'in_progress',
  TERMINATED = 'terminated',
}
