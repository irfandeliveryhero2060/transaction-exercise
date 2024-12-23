import { Column, ForeignKey, Model, Table, BelongsTo, HasMany } from "sequelize-typescript";
import { Profile } from './profile.model';
import { Job } from "src/infra/model/job.model";

@Table({
  timestamps: false, // Disable auto-handling of createdAt and updatedAt
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
  contractor: Profile; // This establishes the relationship to Contractor

  // Add this to establish a one-to-many relationship with Job
  @HasMany(() => Job)
  jobs: Job[]; // Now each contract can have many jobs
}