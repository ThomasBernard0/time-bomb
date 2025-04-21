import {
  Controller,
  Post,
  UseGuards,
  Req,
  Param,
  Get,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
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

  @Get('verify/:code')
  async verifyGameCode(@Param('code') code: string) {
    const game = await this.gameService.verifyGameCode(code);
    if (!game) {
      throw new NotFoundException('Code de partie invalide');
    }

    if (game.status === 'FINISHED') {
      throw new ForbiddenException('Cette partie est terminée');
    }

    return game;
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
