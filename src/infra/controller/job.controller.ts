import { Controller, Get, Post, Param, Body,  Request } from "@nestjs/common";
import { JobsService } from '../services/job.service';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get('unpaid')
  async getUnpaidJobs(@Request() req) {
    const userProfile = req.profile;
    return this.jobsService.getUnpaidJobs(userProfile.id);
  }

  @Post(':job_id/pay')
  async payJob(@Request() req,@Param('job_id') jobId: number, @Body() paymentDto: { amount: number }) {
    const userProfile = req.profile;
    return this.jobsService.payForJob(jobId, paymentDto.amount, userProfile.id);
  }
}
