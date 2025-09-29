import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export class DocsUtil {
	static setupSwagger(app: any, version: string) {
		const config = new DocumentBuilder()
			.setTitle('Generic Web Service Documentation')
			.setDescription('')
			.setVersion(version)
			.addBearerAuth()
			.build();
		const document = SwaggerModule.createDocument(app, config);
		SwaggerModule.setup('api/docs', app, document);
	}
}