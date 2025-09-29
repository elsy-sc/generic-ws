import { Controller, Post, Body, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiBody } from '@nestjs/swagger';
import { JwtAuthUtil } from 'src/util/jwtAuth.util';
import { ResponseUtil } from 'src/util/response.util';

@Controller('api/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly jwtService: JwtService) {}

  @ApiBody({ schema: { example: {}}})
  @Post('token')
  async generateToken(@Body() payload: any) {
    this.logger.log('POST /api/auth/token - Token generation requested');

    try {
        if (!payload || typeof payload !== 'object') {
            this.logger.warn('Invalid payload provided for token generation');
            throw new BadRequestException('Invalid payload for token generation');
        }

        const token = JwtAuthUtil.generateToken(payload, this.jwtService);
        this.logger.log('Token generated successfully');

        return ResponseUtil.success({ token }, 'Token generated', 200);
    } catch (error) {
        this.logger.error(`Token generation failed: ${error.message}`);
        return ResponseUtil.error(error.message, 'Token generation failed', 400);
    }
  }
}