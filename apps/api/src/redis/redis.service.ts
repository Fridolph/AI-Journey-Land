import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private _client: Redis | null = null

  constructor(private readonly configService: ConfigService) {}

  get client(): Redis {
    if (!this._client) throw new Error('Redis 未连接，请先调用 onModuleInit')
    return this._client
  }

  async onModuleInit() {
    this._client = new Redis({
      host: this.configService.get<string>('REDIS_HOST') ?? 'localhost',
      port: Number(this.configService.get<number>('REDIS_PORT') ?? 6379),
      db: Number(this.configService.get<number>('REDIS_DB') ?? 0),
      lazyConnect: true,
    })

    await this._client.connect()
  }

  async onModuleDestroy() {
    if (this._client) {
      await this._client.quit()
      this._client = null
    }
  }
}
