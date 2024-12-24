import { Column, Model, Table, HasMany, DataType } from 'sequelize-typescript';
import { Contract } from './contract.model'; // Ensure the correct path

@Table({
  timestamps: false,
})
export class Profile extends Model {
  @Column({
    allowNull: false,
  })
  firstName: string;

  @Column({
    allowNull: false,
  })
  lastName: string;

  @Column({
    allowNull: false,
  })
  profession: string;

  @Column({
    validate: {
      min: 0, // Ensures the balance is not negative
    },
  })
  balance: number;

  @Column({
    type: DataType.ENUM('client', 'contractor'),
    allowNull: false,
  })
  type: string;

  // Define the one-to-many relationship: Profile can have many Contracts
  @HasMany(() => Contract)
  contracts: Contract[]; // This allows you to access the contracts for a profile
}
