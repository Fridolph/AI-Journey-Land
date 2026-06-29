import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { Prisma } from '@prisma/client'
import { QueryCardsDto } from './dto/query-cards.dto'
import { CreateCardDto } from './dto/create-card.dto'
import { UpdateCardDto } from './dto/update-card.dto'

@Injectable()
export class CardsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryCardsDto) {
    const { keyword, page, pageSize, difficulty, status, category } = query
    const skip = (page - 1) * pageSize
    const take = pageSize
    const where: Prisma.CardWhereInput = {}

    if (keyword) {
      where.OR = [
        { title:   { contains: keyword, mode: 'insensitive' } },
        { summary: { contains: keyword, mode: 'insensitive' } },
        { content: { contains: keyword, mode: 'insensitive' } },
      ]
    }
    if (difficulty) where.difficulty = difficulty
    if (status) where.status = status
    if (category) where.category = category

    const orderBy = {
      [query.sortBy]: query.sortOrder,
    } satisfies Prisma.CardOrderByWithRelationInput
    const [items, total] = await this.prisma.$transaction([
      this.prisma.card.findMany({ where, skip, take, orderBy }),
      this.prisma.card.count({ where }),
    ])
    return {
      items,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      },
    }
  }

  async findOne(id: string) {
    const card = await this.prisma.card.findUnique({ where: { id } })
    if (!card) throw new NotFoundException('未找到匹配记录')
    return card
  }

  async create(dto: CreateCardDto) {
    return this.prisma.card.create({
      data: {
        title: dto.title,
        summary: dto.summary || '',
        content: dto.content || '',
        category: dto.category || '',
        difficulty: dto.difficulty,
        status: dto.status,
      },
    })
  }

  async update(id: string, dto: UpdateCardDto) {
    const card = await this.prisma.card.findUnique({ where: { id } })
    if (!card) throw new NotFoundException('更新失败，未找到匹配项')
    const data: Prisma.CardUpdateInput = {}
    if (dto.title !== undefined) data.title = dto.title
    if (dto.summary !== undefined) data.summary = dto.summary
    if (dto.content !== undefined) data.content = dto.content
    if (dto.category !== undefined) data.category = dto.category
    if (dto.difficulty !== undefined) data.difficulty = dto.difficulty
    if (dto.status !== undefined) data.status = dto.status
    return this.prisma.card.update({ where: { id }, data })
  }

  async remove(id: string) {
    const card = await this.prisma.card.findUnique({ where: { id } })
    if (!card) throw new NotFoundException('删除失败，未找到匹配项')
    return this.prisma.card.delete({ where: { id } })
  }
}
