import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './infra/database.config';
import { AppController } from 'src/infra/controller/app.controller';
import { ContractsController } from 'src/infra/controller/contract.controller';
import { JobsController } from 'src/infra/controller/job.controller';
import { AdminController } from 'src/infra/controller/admin.controller';
import { BalancesController } from 'src/infra/controller/balance.controller';
import { AppService } from 'src/infra/services/app.service';
import { ContractsService } from 'src/infra/services/contract.service';
import { AdminService } from 'src/infra/services/admin.service';
import { JobsService } from 'src/infra/services/job.service';
import { BalancesService } from 'src/infra/services/balance.service';
import { GetProfileMiddleware } from './infra/middleware/profile.middleware';
import { SequelizeModule } from '@nestjs/sequelize';
import { Profile } from 'src/infra/model/profile.model';
import { Contract } from 'src/infra/model/contract.model';
import { Job } from 'src/infra/model/job.model';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,  // Make sure the variables are globally available in the app
      envFilePath: '.env',  // Path to your .env file
    }),
    DatabaseModule,
    SequelizeModule.forFeature([Profile, Contract, Job]),
  ], // load env config
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
  }
}
