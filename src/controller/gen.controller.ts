import { Controller, Post, Get, Put, Delete, Body, Query, UseGuards, BadRequestException, Logger } from '@nestjs/common';
import { ReflectUtil } from 'src/util/reflect.util';
import { GenModel } from 'src/model/gen.model';
import { ResponseUtil } from 'src/util/response.util';
import { PaginationQuery } from 'src/interface/pagination.interface';
import { GenericRequest } from 'src/interface/request.interface';
import { JwtAuthGuard } from 'src/annotation/jwtAuth.annotation';

@Controller('api/gen')
// @UseGuards(JwtAuthGuard)
export class GenController {
    private readonly logger = new Logger(GenController.name);

    @Post()
    async postAction(
        @Query('action') action: string,
        @Query('className') className: string,
        @Query('tableName') tableName: string,
        @Body() body: GenericRequest,
        @Query('page') page?: number | string,
        @Query('limit') limit?: number | string
    ): Promise<any> {
        this.logger.log(`POST /api/gen - Action: ${action}, Class: ${className}, Table: ${tableName}`);
        
        switch (action?.toLowerCase()) {
            case 'create':
                this.logger.log(`Creating new ${className} record`);
                const createResult = await this.handleCreate(className, tableName, body.data);
                this.logger.log(`Successfully created ${className} record`);
                return ResponseUtil.success(createResult, 'Created successfully', 201);
            case 'read': {
                const data = body?.data ?? {};
                const afterWhere = body?.afterWhere;
                const parsedPage = page !== undefined ? Number(page) : undefined;
                const parsedLimit = limit !== undefined ? Number(limit) : undefined;
                
                this.logger.log(`Reading ${className} records with pagination - Page: ${parsedPage}, Limit: ${parsedLimit}`);
                const readResult = await this.handleRead(className, tableName, data, afterWhere, { page: parsedPage, limit: parsedLimit });
                this.logger.log(`Successfully read ${readResult.results.length} ${className} records`);
                
                return ResponseUtil.success(
                    readResult,
                    'Read successfully',
                    200
                );
            }
            default:
                this.logger.warn(`POST action '${action}' not implemented`);
                throw new BadRequestException('POST: action not implemented');
        }
    }

    @Get()
    async getAction(): Promise<any> {
        this.logger.warn('GET /api/gen - Action not implemented');
        throw new BadRequestException('GET: action not implemented');
    }

    @Put()
    async putAction(
        @Query('action') action: string,
        @Query('className') className: string,
        @Query('tableName') tableName: string,
        @Body() body: GenericRequest
    ): Promise<any> {
        this.logger.log(`PUT /api/gen - Action: ${action}, Class: ${className}, Table: ${tableName}`);
        
        switch (action?.toLowerCase()) {
            case 'update':
                this.logger.log(`Updating ${className} records`);
                const updateResult = await this.handleUpdate(className, tableName, body.objectToUpdate, body.objectToUpdateWith, body.afterWhere);
                this.logger.log(`Successfully updated ${className} records`);
                return ResponseUtil.success(
                    updateResult,
                    'Updated successfully',
                    200
                );
            default:
                this.logger.warn(`PUT action '${action}' not implemented`);
                throw new BadRequestException('PUT: action not implemented');
        }
    }

    @Delete()
    async deleteAction(
        @Query('action') action: string,
        @Query('className') className: string,
        @Query('tableName') tableName: string,
        @Body() body: GenericRequest
    ): Promise<any> {
        this.logger.log(`DELETE /api/gen - Action: ${action}, Class: ${className}, Table: ${tableName}`);
        
        switch (action?.toLowerCase()) {
            case 'delete': {
                this.logger.log(`Deleting ${className} records`);
                const deletedCount = await this.handleDelete(className, tableName, body.data, body.afterWhere);
                this.logger.log(`Successfully deleted ${deletedCount} ${className} records`);
                return ResponseUtil.success({ deletedCount }, 'Deleted successfully', 200);
            }
            default:
                this.logger.warn(`DELETE action '${action}' not implemented`);
                throw new BadRequestException('DELETE: action not implemented');
        }
    }

    private async handleCreate(className: string, tableName: string, data: any): Promise<any> {
        if (!data) {
            this.logger.error(`Create failed for ${className}: Data is required`);
            throw new BadRequestException('Data is required for create action');
        }

        try {
            const ClassConstructor = await ReflectUtil.getClass(`${className}`);
            const instance = new ClassConstructor();
            const tableNameFinal = tableName || instance.tableName;

            this.logger.debug(`Creating ${className} from ${tableNameFinal} with data: ${JSON.stringify(data)}`);

            GenModel.setPropertyValues(instance, data);
            GenModel.setPropertyValues(instance, { tablename: tableNameFinal });

            const hasInstanceCreate = typeof instance.create === 'function';
            if (hasInstanceCreate) {
                return await instance.create();
            } else {
                return await GenModel.create(instance, tableNameFinal);
            }
        } catch (error) {
            this.logger.error(`Failed to create ${className}: ${error.message}`);
            throw new BadRequestException(`Failed to create ${className}: ${error.message}`);
        }
    }

    private async handleRead(
        className: string,
        tableName: string,
        data: any,
        afterWhere?: string,
        pagination?: PaginationQuery
    ): Promise<any> {
        try {
            const ClassConstructor = await ReflectUtil.getClass(`${className}`);
            const instance = new ClassConstructor();
            const tableNameFinal = tableName || instance.tableName;

            this.logger.debug(`Reading ${className} from ${tableNameFinal} with data: ${JSON.stringify(data)}`);

            GenModel.setPropertyValues(instance, data);
            GenModel.setPropertyValues(instance, { tablename: tableNameFinal });

            let results: any[];
            let total = 0;
            let page = 1;
            let limit: number | undefined = undefined;
            let totalPages = 1;

            const hasInstanceRead = typeof instance.read === 'function';

            if (pagination && pagination.limit && Number(pagination.limit) > 0) {
                limit = Number(pagination.limit);
                page = pagination.page && Number(pagination.page) > 0 ? Number(pagination.page) : 1;
                const offset = (page - 1) * limit;

                this.logger.debug(`Paginated read - Page: ${page}, Limit: ${limit}, Offset: ${offset}`);

                total = await GenModel.count(instance, tableNameFinal, afterWhere);
                if (hasInstanceRead) {
                    results = await instance.read(afterWhere, undefined, limit, offset);
                } else {
                    results = await GenModel.read(instance, tableNameFinal, afterWhere, undefined, limit, offset);
                }
                totalPages = Math.ceil(total / limit);
            } else {
                this.logger.debug('Non-paginated read');
                if (hasInstanceRead) {
                    results = await instance.read(afterWhere);
                } else {
                    results = await GenModel.read(instance, tableNameFinal, afterWhere);
                }
                total = results.length;
            }

            this.logger.debug(`Read completed - Found ${results.length} records, Total: ${total}`);

            return {
                results,
                pagination: {
                    total,
                    page,
                    limit: limit ?? total,
                    totalPages: limit ? totalPages : 1
                }
            };
        } catch (error) {
            this.logger.error(`Failed to read ${className}: ${error.message}`);
            throw new BadRequestException(`Failed to read ${className}: ${error.message}`);
        }
    }

    private async handleUpdate(className: string, tableName: string, objectToUpdate: any, objectToUpdateWith: any, afterWhere?: string): Promise<any> {
        if ((!objectToUpdate || !objectToUpdateWith) && !afterWhere) {
            this.logger.error(`Update failed for ${className}: Missing required objects`);
            throw new BadRequestException('objectToUpdate and objectToUpdateWith are required for update action');
        }

        try {
            this.logger.debug(`Updating ${className} - Condition: ${JSON.stringify(objectToUpdate)}, Update: ${JSON.stringify(objectToUpdateWith)}`);

            const ClassConstructor = await ReflectUtil.getClass(`${className}`);
            const conditionInstance = new ClassConstructor();
            const tableNameFinal = tableName || conditionInstance.tableName;

            GenModel.setPropertyValues(conditionInstance, objectToUpdate);
            GenModel.setPropertyValues(conditionInstance, { tablename: tableNameFinal });

            const updateInstance = new ClassConstructor();
            GenModel.setPropertyValues(updateInstance, objectToUpdateWith);

            const hasInstanceUpdate = typeof conditionInstance.update === 'function';
            let result;
            if (hasInstanceUpdate) {
                result = await conditionInstance.update(updateInstance, afterWhere);
            } else {
                result = await GenModel.update(conditionInstance, updateInstance, tableNameFinal, afterWhere);
            }

            this.logger.debug(`Update completed for ${className}`);
            return result;
        } catch (error) {
            this.logger.error(`Failed to update ${className}: ${error.message}`);
            throw new BadRequestException(`Failed to update ${className}: ${error.message}`);
        }
    }

    private async handleDelete(className: string, tableName: string, data: any, afterWhere?: string): Promise<number> {
        if ((!data || Object.keys(data).length === 0) && !afterWhere) {
            this.logger.error(`Delete failed for ${className}: At least one property is required`);
            throw new BadRequestException('At least one property is required for delete action');
        }

        try {
            this.logger.debug(`Deleting ${className} with conditions: ${JSON.stringify(data)}`);

            const ClassConstructor = await ReflectUtil.getClass(`${className}`);
            const instance = new ClassConstructor();
            const tableNameFinal = tableName || instance.tableName;

            GenModel.setPropertyValues(instance, data);
            GenModel.setPropertyValues(instance, { tablename: tableNameFinal });

            const hasInstanceDelete = typeof instance.delete === 'function';
            let deletedCount;
            if (hasInstanceDelete) {
                deletedCount = await instance.delete(afterWhere);
            } else {
                deletedCount = await GenModel.delete(instance, tableNameFinal, afterWhere);
            }

            this.logger.debug(`Delete completed for ${className} - ${deletedCount} records affected`);
            return deletedCount;
        } catch (error) {
            this.logger.error(`Failed to delete ${className}: ${error.message}`);
            throw new BadRequestException(`Failed to delete ${className}: ${error.message}`);
        }
    }
}