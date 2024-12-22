import { Column, Model, Table } from 'sequelize-typescript';

@Table
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
}
