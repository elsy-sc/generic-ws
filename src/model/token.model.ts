import { TokenUtil } from "src/util/token.util";
import { GenModel } from "./gen.model";
import { DEFAULT_JWT_REFRESH_TOKEN_EXPIRATION } from "src/util/constante.util";
import { Sequence } from "src/annotation/sequence.annotation";

export class Token {
    @Sequence({ name: 'token_seq', prefix: 'TKN' })
    id: string;
    
    payload?: Object;
    
    refreshToken?: string;

    expirationDate?: Date;

    revokedDate?: Date | null;

    private static tableName = "token";

    constructor(payload?: Object, refreshToken?: string, expirationDate?: Date) {
        this.payload = payload;
        this.refreshToken = refreshToken;
        this.expirationDate = expirationDate;
        this.revokedDate;
    }

    async save(jwtService: any, client?: any): Promise<any> {
        return await Token.save(this, jwtService, client);
    }

    async verify(jwtService: any, client?: any): Promise<any> {
        return await Token.verify(this.refreshToken, jwtService, client);
    }

    async refresh(token: Token, jwtService: any, client?: any) : Promise<any> {
        return await Token.refresh(this.refreshToken, token, jwtService, client);
    }

    async revoke(jwtService: any, client?: any) {
        return await Token.revoke(this.refreshToken, jwtService, client);
    }

    static async save(token: Token, jwtService: any, client?: any): Promise<any> {
        if (!token.refreshToken) {
            token.refreshToken = TokenUtil.generateRefreshToken(token.payload, jwtService);
        }
        if (!token.expirationDate) {
            token.expirationDate = new Date(Date.now() + TokenUtil.parseExpiration(process.env.JWT_REFRESH_TOKEN_EXPIRATION || DEFAULT_JWT_REFRESH_TOKEN_EXPIRATION));
        }
        let tokenCreated = await GenModel.create(token, Token.tableName, client);
        let accessToken = TokenUtil.generateAccessToken(token.payload, jwtService);
        return { ...tokenCreated, accessToken };
    }

    static async verify(refreshToken: string | undefined, jwtService: any, client?: any): Promise<any> {
        if (!refreshToken) {
            return null;
        }
        const isValid = TokenUtil.verifyJwtToken(refreshToken, jwtService);
        if (!isValid) {
            return null;
        }
        const tokens = await GenModel.read(new Token(), Token.tableName, "refreshtoken = '" + refreshToken + "'", client);
        if (tokens && tokens.length > 0) {
            const token = tokens[0] as Token;
            if (!token.revokedDate && (token.expirationDate && token.expirationDate > new Date())) {
                return token;
            }
        }
        return null;
    }

    static async refresh(refreshToken: string | undefined, token: Token, jwtService: any, client?: any): Promise<any> {
        const isValidRefreshToken = await Token.verify(refreshToken, jwtService, client);
        if (isValidRefreshToken) {
            const newAccessToken = TokenUtil.generateAccessToken(token.payload, jwtService);
            return { accessToken: newAccessToken, refreshToken: token.refreshToken };
        }
        return null;
    }

    static async revoke(refreshToken: string | undefined, jwtService: any, client?: any): Promise<any> {
        const token = await Token.verify(refreshToken, jwtService, client);
        if (!token) {
            return null;
        }
        return await GenModel.update(token, { revokedDate: new Date() }, Token.tableName, "", client);
    }

}