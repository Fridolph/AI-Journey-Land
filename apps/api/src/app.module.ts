import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { DemosModule } from './demos/demos.module'
import { HealthController } from './health.controller'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['apps/api/.env', '.env'],
    }),
    DemosModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
