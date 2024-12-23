import { Controller, Get, Post, Param, Request } from '@nestjs/common';
import { JobsService } from 'src/services/job.service';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get('unpaid')
  async getUnpaidJobs(@Request() req) {
    const userProfile = req.profile;
    return this.jobsService.getUnpaidJobs(userProfile.id);
  }

  @Post(':job_id/pay')
  async payJob(@Request() req, @Param('job_id') jobId: number) {
    const userProfile = req.profile;
    return this.jobsService.payForJob(jobId, userProfile.id);
  }
}
