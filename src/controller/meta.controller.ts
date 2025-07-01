import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/annotation/jwtAuth.annotation';
import { ReflectUtil } from 'src/util/reflect.util';
import { ResponseUtils } from 'src/util/response.util';
import { TableUtil } from 'src/util/table.util';

@Controller('api/meta')
@UseGuards(JwtAuthGuard)
export class MetaController {
    @Get('fields')
    async fields(
        @Query('className') className: string,
        @Query('tableName') tableName: string
    ) {
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
            return ResponseUtils.success(fields, 'Fields fetched', 200);
        } catch (error) {
            return ResponseUtils.error(error.message, 'Error fetching fields', 400);
        }
    }
}
