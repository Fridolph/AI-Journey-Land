import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AiModule } from './ai/ai.module'
import { AuthModule } from './auth/auth.module'
import { DemosModule } from './demos/demos.module'
import { HealthController } from './health.controller'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['apps/api/.env', '.env'],
    }),
    AiModule,
    AuthModule,
    DemosModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
