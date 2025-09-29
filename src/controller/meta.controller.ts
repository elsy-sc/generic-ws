import { Controller, Get, Query, UseGuards, Logger } from '@nestjs/common';
import { JwtAuthGuard } from 'src/annotation/jwtAuth.annotation';
import { ReflectUtil } from 'src/util/reflect.util';
import { ResponseUtil } from 'src/util/response.util';
import { TableUtil } from 'src/util/table.util';

@Controller('api/meta')
@UseGuards(JwtAuthGuard)
export class MetaController {
    private readonly logger = new Logger(MetaController.name);
    
    @Get('fields')
    async fields(
        @Query('className') className: string,
        @Query('tableName') tableName: string
    ) {
        this.logger.log(`GET /api/meta/fields - Fetching fields for className: ${className}, tableName: ${tableName}`);
        
        try {
            const ClassConstructor = await ReflectUtil.getClass(className);
            const instance = new ClassConstructor();
            const classFields = ReflectUtil.getPropertyNames(instance);
            const tableColumns = await TableUtil.getTableColumns(tableName);
            const fields = classFields
                .filter(field => tableColumns.includes(field.toLowerCase()))
                .map(field => {
                    const type = Reflect.getMetadata('design:type', ClassConstructor.prototype, field)?.name || 'unknown';
                    return {
                        fieldName: field,
                        fieldType: type
                    };
                });
            
            this.logger.log(`Fields fetched successfully for ${className}/${tableName}: ${fields.length} fields found`);
            return ResponseUtil.success(fields, 'Fields fetched', 200);
        } catch (error) {
            this.logger.error(`Failed to fetch fields for ${className}/${tableName}: ${error.message}`);
            return ResponseUtil.error(error.message, 'Error fetching fields', 400);
        }
    }
}
