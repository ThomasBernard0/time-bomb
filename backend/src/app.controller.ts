import { Controller, Get, Req, Res } from '@nestjs/common';
import { join } from 'path';

@Controller()
export class AppController {
  constructor() {}

  @Get('*')
  serveClient(@Req() req: any, @Res() res: any) {
    if (req.originalUrl.startsWith('/api/')) {
      res.status(404).json({ message: 'API route not found' });
      return;
    }

    res.sendFile(join(__dirname, '..', 'public', 'index.html'));
  }
}
