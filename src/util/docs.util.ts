import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export class DocsUtil {
	static setupSwagger(app: any, version: string) {
		const config = new DocumentBuilder()
			.setTitle('Generic Web Service Documentation')
			.setDescription(
                'A NestJS-based web service providing dynamic CRUD operations for any model and table using reflection and metadata.\n' +
                'Features:\n' +
                '- JWT authentication\n' +
                '- PostgreSQL integration\n' +
                '- Automatic property mapping via decorators\n' +
                '- Pagination support\n' +
                '- Route aliasing\n\n' +
                'Endpoints:\n' +
                '- /api/gen: Dynamic CRUD for any table/model\n'
            )
			.setVersion(version)
			.addBearerAuth()
			.build();
		const document = SwaggerModule.createDocument(app, config);
		SwaggerModule.setup('api/docs', app, document);
	}
}