import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AdminService } from 'src/services/admin.service';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

class BestProfessionQueryDto {
  @IsNotEmpty()
  @IsString()
  @IsDateString()
  start: string;

  @IsNotEmpty()
  @IsString()
  @IsDateString()
  end: string;
}

class BestClientsQueryDto {
  @IsNotEmpty()
  @IsString()
  @IsDateString()
  start: string;

  @IsNotEmpty()
  @IsString()
  @IsDateString()
  end: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 2;
}

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('best-profession')
  @UsePipes(new ValidationPipe({ transform: true }))
  async bestProfession(@Query() query: BestProfessionQueryDto) {
    const { start, end } = query;
    return this.adminService.getBestProfession(start, end);
  }

  @Get('best-clients')
  @UsePipes(new ValidationPipe({ transform: true }))
  async bestClients(@Query() query: BestClientsQueryDto) {
    const { start, end, limit } = query;
    return this.adminService.getBestClients(start, end, limit);
  }
}
