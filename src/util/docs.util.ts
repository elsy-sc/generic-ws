import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { DEFAULT_DOCS_DESCRIPTION, DEFAULT_DOCS_PATH, DEFAULT_DOCS_TITLE, DEFAULT_DOCS_VERSION } from './constante.util';

export class DocsUtil {
	static setupSwagger(app: any) {
		const config = new DocumentBuilder()
			.setTitle(process.env.DOCS_TITLE || DEFAULT_DOCS_TITLE)
			.setDescription(process.env.DOCS_DESCRIPTION || DEFAULT_DOCS_DESCRIPTION)
			.setVersion(process.env.DOCS_VERSION || DEFAULT_DOCS_VERSION)
            .addBearerAuth()
            .build();
		const document = SwaggerModule.createDocument(app, config);
		SwaggerModule.setup(process.env.DOCS_PATH || DEFAULT_DOCS_PATH, app, document);
	}
}