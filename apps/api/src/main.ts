import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { Reflector } from '@nestjs/core'
import { AppModule } from './app.module'
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter'
import { ResponseInterceptor } from './common/interceptors/response.interceptor'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService)
  const webOrigin = configService.get<string>('WEB_ORIGIN') ?? 'http://localhost:5033'
  const port = Number(configService.get<string>('API_PORT') ?? 5044)

  app.setGlobalPrefix('api')
  app.useGlobalInterceptors(new ResponseInterceptor(app.get(Reflector)))
  app.useGlobalFilters(new AllExceptionsFilter())
  app.enableCors({
    origin: webOrigin,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  })

  await app.listen(port)
}

void bootstrap()
