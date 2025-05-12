import { Controller, UseGuards, Param, Get } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GameService } from './game.service';

@Controller('api/games')
@UseGuards(JwtAuthGuard)
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get()
  createGame() {
    return this.gameService.createGame();
  }

  @Get('verify/:code')
  verifyGameCode(@Param('code') code: string) {
    return this.gameService.verifyGameCode(code);
  }
}
