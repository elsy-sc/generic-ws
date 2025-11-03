import { HttpException } from '@nestjs/common';

export class ResponseUtil {
    static success(data: any, message = 'Success', statusCode = 200) {
        throw new HttpException(
            {
                message,
                data,
                statusCode
            },
            statusCode
        );
    }

    static error(errors: any, message = 'An error occurred', data: any = null, statusCode = 500) {
        let errorValue = errors;
        if (Array.isArray(errors)) {
            errorValue = errors.length > 0 ? errors[0] : null;
        }

        throw new HttpException(
            {
                error: message,
                message: errorValue,
                data,
                statusCode
            },
            statusCode
        );
    }
}
