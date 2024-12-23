import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from 'src/database.config';

import { AppController } from 'src/controller/app.controller';
import { ContractsController } from 'src/controller/contract.controller';
import { JobsController } from 'src/controller/job.controller';
import { AdminController } from 'src/controller/admin.controller';
import { BalancesController } from 'src/controller/balance.controller';

import { AppService } from 'src/services/app.service';
import { ContractsService } from 'src/services/contract.service';
import { AdminService } from 'src/services/admin.service';
import { JobsService } from 'src/services/job.service';
import { BalancesService } from 'src/services/balance.service';

import { GetProfileMiddleware } from './middleware/profile.middleware';

import { Profile } from 'src/model/profile.model';
import { Contract } from 'src/model/contract.model';
import { Job } from 'src/model/job.model';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make sure the variables are globally available in the app
      envFilePath: '.env', // Path to your .env file
    }),
    DatabaseModule,
    SequelizeModule.forFeature([Profile, Contract, Job]),
  ],
  controllers: [
    AppController,
    ContractsController,
    JobsController,
    AdminController,
    BalancesController,
  ],
  providers: [
    AppService,
    ContractsService,
    JobsService,
    AdminService,
    BalancesService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply middleware to all routes or specific ones
    consumer.apply(GetProfileMiddleware).forRoutes(ContractsController);
    consumer.apply(GetProfileMiddleware).forRoutes(JobsController);
  }
}
