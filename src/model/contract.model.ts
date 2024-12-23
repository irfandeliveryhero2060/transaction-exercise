import {
  Column,
  ForeignKey,
  Model,
  Table,
  BelongsTo,
  HasMany,
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

  @Column
  status: string;

  @BelongsTo(() => Profile, 'ClientId')
  client: Profile;

  @BelongsTo(() => Profile, 'ContractorId')
  contractor: Profile;

  @HasMany(() => Job)
  jobs: Job[];
}
