import { Module } from '@nestjs/common'
import { AiService } from './ai.service'

/**
 * API 层 AI 基础模块。
 */
@Module({
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
