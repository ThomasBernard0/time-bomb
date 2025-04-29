import { Module } from '@nestjs/common';
import { BiMapUserSocket } from './BiMapUserSocket';

@Module({
  providers: [BiMapUserSocket],
  exports: [BiMapUserSocket],
})
export class BiMapUserSocketModule {}
