import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AiModule } from './ai/ai.module'
import { AiChatModule } from './ai-chat/ai-chat.module'
import { AuthModule } from './auth/auth.module'
import { DemosModule } from './demos/demos.module'
// [LEARN] Cards/Prisma 待从零构建，暂时注释
// import { CardsModule } from './cards/cards.module'
import { HealthController } from './health.controller'
// import { PrismaModule } from './prisma/prisma.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['apps/api/.env', '.env'],
    }),
    // PrismaModule,
    AiModule,
    AiChatModule,
    AuthModule,
    DemosModule,
    // CardsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
