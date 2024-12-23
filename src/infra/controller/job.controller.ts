import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { JobsService } from '../services/job.service';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  //TODO: Read from profile
  @Get('unpaid')
  async getUnpaidJobs() {
    return this.jobsService.getUnpaidJobs(234);
  }

  @Post(':job_id/pay')
  async payJob(@Param('job_id') jobId: number, @Body() paymentDto: { amount: number }) {
    return this.jobsService.payForJob(jobId, paymentDto.amount, 123);
  }
}
