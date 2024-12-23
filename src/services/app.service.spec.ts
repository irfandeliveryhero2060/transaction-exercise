import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service'; // Import your service

describe('AppService', () => {
  let appService: AppService;

  // Set up the testing module
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService], // Provide the service for testing
    }).compile();

    appService = module.get<AppService>(AppService); // Get the service instance
  });

  it('should be defined', () => {
    expect(appService).toBeDefined(); // Check if service is defined
  });

  it('should return "Hello World!" when getHello is called', () => {
    expect(appService.getHello()).toBe('Hello World!'); // Test the method
  });
});
