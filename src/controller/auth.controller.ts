import { Controller, Post, Body } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthUtil } from 'src/util/jwt-auth.util';
import { ResponseUtils } from 'src/util/response.util';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly jwtService: JwtService) {}

  @Post('token')
  async generateToken(@Body() payload: any) {
    try {
        if (!payload || typeof payload !== 'object') {
            throw new Error('Invalid payload for token generation');
        }
        const token = JwtAuthUtil.generateToken(payload, this.jwtService);
        return ResponseUtils.success({ token }, 'Token generated', 200);
    } catch (error) {
        return ResponseUtils.error(error.message, 'Token generation failed', 400);
    }
  }
}