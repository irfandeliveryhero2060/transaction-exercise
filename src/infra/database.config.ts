import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Profile } from './model/profile.model';
import { Contract } from './model/contract.model';
import { Job } from './model/job.model';
import { Sequelize } from 'sequelize-typescript';

//todo: read from env
@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: '127.0.0.1',
      port:  5432,
      username: 'postgres',
      password:  'postgres',
      database: 'task-trader-db',
      autoLoadModels: true, // Automatically load models
      synchronize: true, // Sync database schema (use with caution in production)
    }),
    SequelizeModule.forFeature([Profile, Contract, Job]),
  ],
  providers: [
    {
      provide: 'SEQUELIZE_SYNC',
      useFactory: async (sequelize: Sequelize) => {
        // Force sync the database when the app starts
        // await sequelize.sync({ force: true });
      },
      inject: [Sequelize],  // Inject Sequelize instance
    },
  ],
})
export class DatabaseModule {}
