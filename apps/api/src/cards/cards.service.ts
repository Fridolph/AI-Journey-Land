import { UpdateCardDto } from "./dto/update-card.dto";
import { CreateCardDto } from "./dto/create-card.dto";
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { QueryCardsDto } from "./dto/query-card.dto";
import { Prisma } from "@prisma/client";

@Injectable()
export class CardsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryCardsDto) {
    const page = Math.max(Number(query.page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(query.pageSize) || 10, 1), 100);
    const skip = (page - 1) * pageSize;
    const take = pageSize;
    const where: Prisma.CardWhereInput = {};

    if (query.keyword) {
      where.OR = [
        {
          title: {
            contains: query.keyword,
            mode: "insensitive",
          },
        },
        {
          summary: {
            contains: query.keyword,
            mode: "insensitive",
          },
        },
        {
          content: {
            contains: query.keyword,
            mode: "insensitive",
          },
        },
      ];
    }
    if (query.status) {
      where.status = query.status;
    }

    if (query.difficulty) {
      where.difficulty = query.difficulty;
    }

    if (query.category) {
      where.category = query.category;
    }

    const [items, total] = await Promise.all([
      this.prisma.card.findMany({
        where,
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.card.count({
        where,
      })
    ])

    return {
      items,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    }
  }

  async findOne(id: string) {
    const card = await this.prisma.card.findUnique({
      where: { id },
    });

    if (!card) throw new NotFoundException("卡片不存在");

    return card;
  }

  async create(createCardDto: CreateCardDto) {
    return this.prisma.card.create({
      data: {
        title: createCardDto.title,
        summary: createCardDto.summary,
        content: createCardDto.content || "",
      },
    });
  }

  async update(id: string, updateCardDto: UpdateCardDto) {
    await this.findOne(id);

    return this.prisma.card.update({
      where: { id },
      data: {
        title: updateCardDto.title,
        summary: updateCardDto.summary,
        content: updateCardDto.content,
        category: updateCardDto.category,
        difficulty: updateCardDto.difficulty,
        status: updateCardDto.status,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.card.delete({
      where: { id },
    });
  }
}
