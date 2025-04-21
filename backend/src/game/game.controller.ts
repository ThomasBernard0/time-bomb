import { Controller, Post, UseGuards, Req, Param, Get } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GameService } from './game.service';
@Controller('games')
@UseGuards(JwtAuthGuard)
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post()
  async create(@Req() req) {
    const userId = req.user.sub;
    return this.gameService.createGame(userId);
  }

  @Post('join/:code')
  async joinGame(@Param('code') code: string, @Req() req) {
    const userId = req.user.sub;
    return this.gameService.joinGame(code, userId);
  }

  @Get(':code/players')
  async getPlayers(@Param('code') code: string) {
    return this.gameService.getPlayersInGame(code);
  }
}
