import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService)
  const webOrigin = configService.get<string>('WEB_ORIGIN') ?? 'http://localhost:3000'
  const port = Number(configService.get<string>('API_PORT') ?? 3001)

  app.setGlobalPrefix('api')
  app.enableCors({
    origin: webOrigin,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  })

  await app.listen(port)
}

void bootstrap()
