import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import { Profile } from 'src/model/profile.model';
import { Contract } from 'src/model/contract.model';
import { Job } from 'src/model/job.model';
import { Sequelize } from 'sequelize-typescript';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        dialect: 'postgres',
        host: configService.get<string>('DB_HOST', '127.0.0.1'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USER', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_NAME', 'task-trader-db'),
        autoLoadModels: true,
        synchronize: true, // Sync database schema (use with caution in production)
      }),
    }),
    SequelizeModule.forFeature([Profile, Contract, Job]),
  ],
  providers: [
    {
      provide: 'SEQUELIZE_SYNC',
      useFactory: async (sequelize: Sequelize) => {
        // Force sync the database when the app starts
        // await sequelize.sync({ force: true });
        // console.log('db name', process.env.DB_NAME)
      },
      inject: [Sequelize],
    },
  ],
})
export class DatabaseModule {}