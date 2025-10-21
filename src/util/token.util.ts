import { JwtService } from "@nestjs/jwt";
import { DEFAULT_JWT_ACCESS_TOKEN_EXPIRATION, DEFAULT_JWT_REFRESH_TOKEN_EXPIRATION, DEFAULT_JWT_SECRET } from "./constante.util";
import { UnauthorizedException } from '@nestjs/common';

export class TokenUtil {
    static generateToken(payload: any, jwtService: JwtService, expiresIn: string = '-1'): string {
        if(expiresIn === '-1') {
            return jwtService.sign(payload);
        }
        return jwtService.sign(payload, { expiresIn: expiresIn as any  });
    }

    static generateAccessToken(payload: any, jwtService: JwtService): string {
        const accessTokenExpiration = process.env.JWT_ACCESS_TOKEN_EXPIRATION || DEFAULT_JWT_ACCESS_TOKEN_EXPIRATION;
        return this.generateToken(payload, jwtService, accessTokenExpiration);
    }

    static generateRefreshToken(payload: any, jwtService: JwtService): string {
        const refreshTokenExpiration = process.env.JWT_REFRESH_TOKEN_EXPIRATION || DEFAULT_JWT_REFRESH_TOKEN_EXPIRATION;
        return this.generateToken(payload, jwtService, refreshTokenExpiration);
    }

    static extractTokenFromHeader(authHeader: string): string {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('No token provided');
        }
        return authHeader.split(' ')[1];
    }

    static verifyJwtToken(token: string, jwtService: JwtService): any {
        try {
            return jwtService.verify(token, { secret: process.env.JWT_SECRET || DEFAULT_JWT_SECRET });
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }

    static parseExpiration(exp: string): number {
        const m = /^(\d+)\s*([smhd])$/i.exec(exp);
        if (!m) {
            return 7 * 24 * 60 * 60 * 1000;
        }
        const value = parseInt(m[1], 10);
        const unit = m[2].toLowerCase();
        switch (unit) {
            case "s": return value * 1000;
            case "m": return value * 60 * 1000;
            case "h": return value * 60 * 60 * 1000;
            case "d": return value * 24 * 60 * 60 * 1000;
            default: return 7 * 24 * 60 * 60 * 1000;
        }
    }
}