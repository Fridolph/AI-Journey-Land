import { describe, it, expect } from 'vitest'
import { Test } from '@nestjs/testing'
import { ConfigModule } from '@nestjs/config'
import { HealthController } from './health.controller'

describe('HealthController', () => {
  it('returns status ok', async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      controllers: [HealthController],
    }).compile()

    const controller = module.get(HealthController)
    const result = controller.getHealth()
    expect(result.status).toBe('ok')
    expect(result.service).toBe('ai-journey-land-api')
  })
})
