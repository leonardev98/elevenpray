import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return this.appService.getHello();
  }

  /** Comprobación explícita (útil detrás de proxies / apps móviles). */
  @Get('health')
  health() {
    return this.appService.getHello();
  }
}
