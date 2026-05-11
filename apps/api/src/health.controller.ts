import { Controller, Get } from '@nestjs/common'
import { Public } from './auth/public.decorator'

@Public()
@Controller('health')
export class HealthController {
  /**
   * 返回 API 服务健康状态。
   */
  @Get()
  getHealth() {
    return {
      status: 'ok',
      service: 'ai-journey-land-api',
      timestamp: new Date().toISOString(),
    }
  }
}
