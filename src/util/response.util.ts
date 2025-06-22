export class ResponseUtils {
    static success(data: any, message = 'Success', statusCode = 200) {
        return {
            message,
            data,
            statusCode
        };
    }

    static error(errors: any, message = 'An error occurred', statusCode = 500) {
        let errorValue = errors;
        if (Array.isArray(errors)) {
            errorValue = errors.length > 0 ? errors[0] : null;
        }
        return {
            error: message,
            message: errorValue,
            statusCode
        };
    }
}
