import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { GameGateway } from './game.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { BiMapUserSocketModule } from 'src/utils/BiMapUserSocket.module';

@Module({
  imports: [AuthModule, BiMapUserSocketModule],
  providers: [GameGateway, GameService],
  controllers: [GameController],
})
export class GameModule {}
