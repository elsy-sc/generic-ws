import { JwtService } from "@nestjs/jwt";
import { DEFAULT_JWT_EXPIRATION, DEFAULT_JWT_SECRET } from "./constante.util";
import { UnauthorizedException } from '@nestjs/common';

export class JwtAuthUtil {
    static generateToken(payload: any, jwtService: JwtService, expiresIn: string = process.env.JWT_EXPIRATION || DEFAULT_JWT_EXPIRATION): string {
        return jwtService.sign(payload, { expiresIn });
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

}