import { Controller, Get, Logger } from '@nestjs/common';
import { DashboardService } from './dashboard.service.js';

@Controller('dashboard')
export class DashboardController {
  private readonly logger = new Logger(DashboardController.name);

  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getStats() {
    this.logger.log('Fetching dashboard stats');
    return this.dashboardService.getStats();
  }

  @Get('messages')
  async getMessages() {
    this.logger.log('Fetching dashboard latest messages');
    return this.dashboardService.getLatestMessages();
  }

  @Get('chart')
  async getChartData() {
    this.logger.log('Fetching dashboard chart data');
    return this.dashboardService.getChartData();
  }

  @Get('orders')
  async getOrders() {
    this.logger.log('Fetching orders (leads)');
    return this.dashboardService.getOrders();
  }
}
