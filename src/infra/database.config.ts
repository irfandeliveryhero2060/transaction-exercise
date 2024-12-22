import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Profile } from './model/profile.model';
import { Contract } from './model/contract.model';
import { Job } from './model/job.model';

//todo: read from env
@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: '127.0.0.1',
      port:  5432,
      username: 'postgres',
      password:  'postgres',
      database: process.env.DB_NAME,
      autoLoadModels: true, // Automatically load models
      synchronize: true // Sync database schema (use with caution in production)
    }),
    SequelizeModule.forFeature([Profile, Contract, Job]),
  ],
})
export class DatabaseModule {}
