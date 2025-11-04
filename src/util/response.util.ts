import { HttpException } from '@nestjs/common';

export class ResponseUtil {
    private static respond(message: string, data: any, statusCode: number) {
        throw new HttpException(
            {
                message,
                data,
                statusCode
            },
            statusCode
        );
    }

    static success(data: any, message = 'Success', statusCode = 200) {
        this.respond(message, data, statusCode);
    }

    static error(data: any = null, message = 'An error occurred', statusCode = 500) {
        this.respond(message, data, statusCode);
    }
}