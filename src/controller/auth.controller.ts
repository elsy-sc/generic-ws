import { Controller, Post, Body, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiBody } from '@nestjs/swagger';
import { ResponseUtil } from 'src/util/response.util';

@Controller('api/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly jwtService: JwtService) {}

}