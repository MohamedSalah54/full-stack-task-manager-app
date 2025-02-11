import { Injectable, InternalServerErrorException } from '@nestjs/common';
import puppeteer from 'puppeteer-extra';
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

@Injectable()
export class ScrapingService {
  async scrapeLinkedin(url: string): Promise<{ name: string; linkedinPhoto: string; linkedinBio: string }> {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();

      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36'
      );

      const email = process.env.LINKEDIN_EMAIL;
      const password = process.env.LINKEDIN_PASSWORD;
      if (!email || !password) {
        throw new InternalServerErrorException('LinkedIn credentials are not set in environment variables');
      }

      await page.goto('https://www.linkedin.com/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForSelector('input#username', { timeout: 30000 });
      await page.waitForSelector('input#password', { timeout: 30000 });

      await page.type('input#username', email, { delay: 100 });
      await page.type('input#password', password, { delay: 100 });

      await page.click('button[type="submit"]');
      await page.waitForSelector('.global-nav__me-photo', { timeout: 120000 });

      console.log('After login, current URL:', page.url());

      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

      try {
        await page.waitForSelector('img.profile-photo-edit__preview', { timeout: 60000 });
      } catch (e) {
        console.error('Profile photo selector not found.');
      }
      try {
        await page.waitForSelector('.text-body-medium.break-words', { timeout: 60000 });
      } catch (e) {
        console.error('Bio selector not found.');
      }
      try {
        await page.waitForSelector('.PhQqqZvhLUCwMdDrCqRiMGMJYiboVpjDE', { timeout: 60000 });
      } catch (e) {
        console.error('Name selector not found.');
      }

      const name = await page.$eval(
        '.PhQqqZvhLUCwMdDrCqRiMGMJYiboVpjDE',
        (el: HTMLElement) => el.innerText.trim()
      ).catch(() => '');

      const linkedinPhoto = await page.$eval(
        'img.profile-photo-edit__preview',
        (img: HTMLImageElement) => img.src
      ).catch(() => '');

      const linkedinBio = await page.$eval(
        '.text-body-medium.break-words',
        (el: HTMLElement) => el.textContent?.trim() || 'No bio available'
      ).catch(() => 'No bio available');

      return { name, linkedinPhoto, linkedinBio };
    } catch (error) {
      console.error('Puppeteer error:', error);
      throw new InternalServerErrorException('Failed to scrape LinkedIn data');
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}
