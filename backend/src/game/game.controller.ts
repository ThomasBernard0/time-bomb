import { Controller, UseGuards, Param, Get } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GameService } from './game.service';
@Controller('games')
@UseGuards(JwtAuthGuard)
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get(':code/verify')
  verifyGameCode(@Param('code') code: string) {
    return this.gameService.verifyGameCode(code);
  }
}
