import { Controller, Post, Body, Req, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Token } from '../model/token.model';
import { ResponseUtil } from 'src/util/response.util';

@Controller('api/token')
export class TokenController {
	constructor(private readonly jwtService: JwtService) {}

    @Post('save')
    async save(@Body() payload: any, @Req() req: any) {
        try {
            const token = new Token(payload);
            const result = await token.save(this.jwtService);
            return ResponseUtil.success(result, 'Token saved', 201);
        } catch (error) {
            return ResponseUtil.error(error.message, 'Error saving token', 400);
        }
    }

    @Post('verify')
    async verify(@Body('refreshToken') refreshToken: string, @Req() req: any) {
        try {
            const result = await Token.verify(refreshToken, this.jwtService);
            if (result) {
                return ResponseUtil.success(result, 'Token verified', 200);
            }
            return ResponseUtil.error('Invalid or expired token', 'Verification failed', 401);
        } catch (error) {
            return ResponseUtil.error(error.message, 'Error verifying token', 400);
        }
    }

    @Post('refresh')
    async refresh(@Body() body: any, @Req() req: any) {
        try {
            const { refreshToken, payload } = body;
            const token = new Token(payload, refreshToken);
            const result = await Token.refresh(refreshToken, token, this.jwtService);
            if (result) {
                return ResponseUtil.success(result, 'Token refreshed', 200);
            }
            return ResponseUtil.error('Invalid refresh token', 'Refresh failed', 401);
        } catch (error) {
            return ResponseUtil.error(error.message, 'Error refreshing token', 400);
        }
    }

    @Post('revoke')
    async revoke(@Body('refreshToken') refreshToken: string, @Req() req: any) {
        try {
            const result = await Token.revoke(refreshToken, this.jwtService);
            if (result) {
                return ResponseUtil.success(result, 'Token revoked', 200);
            }
            return ResponseUtil.error('Invalid token', 'Revoke failed', 401);
        } catch (error) {
            return ResponseUtil.error(error.message, 'Error revoking token', 400);
        }
    }
}
