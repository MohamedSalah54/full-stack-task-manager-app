import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { ScrapingService } from './scraping.service';

@Controller('scrape')
export class ScrapingController {
  constructor(private readonly scrapingService: ScrapingService) {}

  @Get('linkedin')
  async scrapeLinkedin(@Query('url') url: string) {
    if (!url) {
      throw new BadRequestException('URL parameter is required');
    }
    return this.scrapingService.scrapeLinkedin(url);
  }
}
