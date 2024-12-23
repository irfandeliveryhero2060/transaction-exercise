import { Column, Model, Table, HasMany } from 'sequelize-typescript';
import { Contract } from './contract.model'; // Ensure the correct path

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

  @Column({
    validate: {
      min: 0, // Ensures the balance is not negative
    },
  })
  balance: number;

  @Column
  type: string;

  // Define the one-to-many relationship: Profile can have many Contracts
  @HasMany(() => Contract)
  contracts: Contract[]; // This allows you to access the contracts for a profile
}
