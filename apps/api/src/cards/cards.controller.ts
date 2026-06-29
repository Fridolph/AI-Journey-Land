import { CardsService } from './cards.service'
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { QueryCardsDto } from './dto/query-cards.dto'
import { CreateCardDto } from './dto/create-card.dto'
import { UpdateCardDto } from './dto/update-card.dto'

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get()
  findAll(@Query() query: QueryCardsDto) {
    return this.cardsService.findAll(query)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cardsService.findOne(id)
  }

  @Post()
  create(@Body() dto: CreateCardDto) {
    return this.cardsService.create(dto)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCardDto) {
    return this.cardsService.update(id, dto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cardsService.remove(id)
  }
}
