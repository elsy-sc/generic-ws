export class CorsUtil {
    static enableCors(app: any): void {
        app.enableCors({
            origin: '*',
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
            allowedHeaders: 'Content-Type, Authorization',
            credentials: true,
        });
    }
}