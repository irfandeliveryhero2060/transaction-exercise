import { Column, Model, Table, HasMany } from 'sequelize-typescript';
import { Job } from './job.model';  // Ensure correct import path for the Job model

@Table({
  timestamps: false, // Disable auto-handling of createdAt and updatedAt
})
export class Profile extends Model {
  @Column
  firstName: string;

  @Column
  lastName: string;

  @Column
  profession: string;

  @Column
  balance: number;

  @Column
  type: string;

  // Explicitly define the type of clientJobs and contractorJobs
  @HasMany(() => Job, { foreignKey: 'ClientId' })
  clientJobs: Job[];

  @HasMany(() => Job, { foreignKey: 'ContractorId' })
  contractorJobs: Job[];
}
