import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class CardsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.card.findMany({
      include: { tags: { include: { tag: true } } },
      orderBy: { updatedAt: 'desc' },
    })
  }

  findOne(id: string) {
    return this.prisma.card.findUnique({
      where: { id },
      include: { tags: { include: { tag: true } }, records: { orderBy: { createdAt: 'desc' } } },
    })
  }

  async create(data: {
    title: string
    content: string
    summary?: string
    category?: string
    difficulty?: string
    tags?: string[]
  }) {
    const { tags, ...rest } = data
    return this.prisma.card.create({
      data: {
        ...rest,
        tags: tags?.length
          ? {
              create: tags.map((name) => ({
                tag: {
                  connectOrCreate: { where: { name }, create: { name } },
                },
              })),
            }
          : undefined,
      },
      include: { tags: { include: { tag: true } } },
    })
  }

  async update(id: string, data: {
    title?: string; content?: string; summary?: string
    category?: string; difficulty?: string; status?: string; tags?: string[]
  }) {
    const { tags, ...rest } = data
    if (tags) {
      await this.prisma.cardTag.deleteMany({ where: { cardId: id } })
    }
    return this.prisma.card.update({
      where: { id },
      data: {
        ...rest,
        tags: tags?.length
          ? {
              create: tags.map((name) => ({
                tag: {
                  connectOrCreate: { where: { name }, create: { name } },
                },
              })),
            }
          : undefined,
      },
      include: { tags: { include: { tag: true } } },
    })
  }

  async remove(id: string) {
    return this.prisma.card.delete({ where: { id } })
  }

  async addRecord(cardId: string, action: string, note?: string) {
    return this.prisma.learningRecord.create({
      data: { cardId, action, note },
    })
  }

  async getRecords(cardId: string) {
    return this.prisma.learningRecord.findMany({
      where: { cardId },
      orderBy: { createdAt: 'desc' },
    })
  }
}
