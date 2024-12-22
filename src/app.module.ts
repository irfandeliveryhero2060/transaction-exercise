import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './infra/database.config';
import { AppController } from 'src/infra/controller/app.controller';
import { AppService } from './app.service';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,  // Make sure the variables are globally available in the app
      envFilePath: '.env',  // Path to your .env file
    }),
    DatabaseModule,
  ], // load env config
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {

}
