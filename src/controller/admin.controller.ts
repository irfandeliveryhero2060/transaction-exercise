import { Controller, Get, Query } from '@nestjs/common';
import { AdminService } from 'src/services/admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('best-profession')
  async bestProfession(@Query('start') start: string, @Query('end') end: string) {
    return this.adminService.getBestProfession(start, end);
  }

  @Get('best-clients')
  async bestClients(@Query('start') start: string, @Query('end') end: string, @Query('limit') limit: number = 2) {
    return this.adminService.getBestClients(start, end, limit);
  }
}
