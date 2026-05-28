import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AiModule } from './ai/ai.module'
import { AuthModule } from './auth/auth.module'
import { DemosModule } from './demos/demos.module'
import { CardsModule } from './cards/cards.module'
import { HealthController } from './health.controller'
import { PrismaModule } from './prisma/prisma.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['apps/api/.env', '.env'],
    }),
    PrismaModule,
    AiModule,
    AuthModule,
    DemosModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
