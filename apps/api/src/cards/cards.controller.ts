import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common'
import { CardsService } from './cards.service'

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get()
  findAll() {
    return this.cardsService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cardsService.findOne(id)
  }

  @Post()
  create(@Body() body: { title: string; content: string; summary?: string; category?: string; difficulty?: string; tags?: string[] }) {
    return this.cardsService.create(body)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: { title?: string; content?: string; summary?: string; category?: string; difficulty?: string; status?: string; tags?: string[] }) {
    return this.cardsService.update(id, body)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cardsService.remove(id)
  }

  @Post(':id/records')
  addRecord(@Param('id') id: string, @Body() body: { action: string; note?: string }) {
    return this.cardsService.addRecord(id, body.action, body.note)
  }

  @Get(':id/records')
  getRecords(@Param('id') id: string) {
    return this.cardsService.getRecords(id)
  }
}
