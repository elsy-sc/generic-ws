import { Controller, Post, Get, Put, Delete, Body, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { ReflectUtil } from 'src/util/reflect.util';
import { GenModel } from 'src/model/gen.model';
import { ResponseUtils } from 'src/util/response.util';
import { PaginationQuery } from 'src/interface/pagination.interface';
import { GenericRequest } from 'src/interface/request.interface';
import { JwtAuthGuard } from 'src/annotation/jwt-auth.annotation';
@Controller('api/gen')
@UseGuards(JwtAuthGuard)
export class GenController {
    @Post()
    async postAction(
        @Query('action') action: string,
        @Query('className') className: string,
        @Query('tableName') tableName: string,
        @Body() body: GenericRequest,
        @Query('page') page?: number | string,
        @Query('limit') limit?: number | string
    ): Promise<any> {
        switch (action?.toLowerCase()) {
            case 'create':
                return ResponseUtils.success(await this.handleCreate(className, tableName, body.data), 'Created successfully', 201);
            case 'read': {
                const data = body?.data ?? {};
                const afterWhere = body?.afterWhere;
                const parsedPage = page !== undefined ? Number(page) : undefined;
                const parsedLimit = limit !== undefined ? Number(limit) : undefined;
                return ResponseUtils.success(
                    await this.handleRead(className, tableName, data, afterWhere, { page: parsedPage, limit: parsedLimit }),
                    'Read successfully',
                    200
                );
            }
            default:
                throw new BadRequestException('POST: action not implemented');
        }
    }

    @Get()
    async getAction(): Promise<any> {
        throw new BadRequestException('GET: action not implemented');
    }

    @Put()
    async putAction(
        @Query('action') action: string,
        @Query('className') className: string,
        @Query('tableName') tableName: string,
        @Body() body: GenericRequest
    ): Promise<any> {
        switch (action?.toLowerCase()) {
            case 'update':
                return ResponseUtils.success(
                    await this.handleUpdate(className, tableName, body.objectToUpdate, body.objectToUpdateWith, body.afterWhere),
                    'Updated successfully',
                    200
                );
            default:
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
        switch (action?.toLowerCase()) {
            case 'delete': {
                const deletedCount = await this.handleDelete(className, tableName, body.data, body.afterWhere);
                return ResponseUtils.success({ deletedCount }, 'Deleted successfully', 200);
            }
            default:
                throw new BadRequestException('DELETE: action not implemented');
        }
    }

    private async handleCreate(className: string, tableName: string, data: any): Promise<any> {
        if (!data) {
            throw new BadRequestException('Data is required for create action');
        }

        try {
            const ClassConstructor = await ReflectUtil.getClass(`${className}`);
            const instance = new ClassConstructor();
            ReflectUtil.setPropertyValues(instance, data);
            ReflectUtil.setPropertyValues(instance, { tablename: tableName });
            const hasInstanceCreate = typeof instance.create === 'function';
            if (hasInstanceCreate) {
                return await instance.create();
            } else {
                return await GenModel.create(instance, tableName);
            }
        } catch (error) {
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
            ReflectUtil.setPropertyValues(instance, data);
            ReflectUtil.setPropertyValues(instance, { tablename: tableName });

            let results: any[];
            let total = 0;
            let page = 1;
            let limit: number | undefined = undefined;
            let totalPages = 1;

            const hasInstanceRead = typeof instance.read === 'function';
            const hasInstanceCount = typeof instance.count === 'function';

            if (pagination && pagination.limit && Number(pagination.limit) > 0) {
                limit = Number(pagination.limit);
                page = pagination.page && Number(pagination.page) > 0 ? Number(pagination.page) : 1;
                const offset = (page - 1) * limit;
                if (hasInstanceCount) {
                    total = await instance.count(afterWhere, undefined);
                } else {
                    total = await GenModel.count(instance, tableName, afterWhere);
                }
                if (hasInstanceRead) {
                    results = await instance.read(afterWhere, undefined, limit, offset);
                } else {
                    results = await GenModel.read(instance, tableName, afterWhere, undefined, limit, offset);
                }
                totalPages = Math.ceil(total / limit);
            } else {
                if (hasInstanceRead) {
                    results = await instance.read(afterWhere);
                } else {
                    results = await GenModel.read(instance, tableName, afterWhere);
                }
                total = results.length;
            }

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
            throw new BadRequestException(`Failed to read ${className}: ${error.message}`);
        }
    }

    private async handleUpdate(className: string, tableName: string, objectToUpdate: any, objectToUpdateWith: any, afterWhere?: string): Promise<any> {
        if (!objectToUpdate || !objectToUpdateWith) {
            throw new BadRequestException('objectToUpdate and objectToUpdateWith are required for update action');
        }

        try {
            const ClassConstructor = await ReflectUtil.getClass(`${className}`);
            
            const conditionInstance = new ClassConstructor();
            ReflectUtil.setPropertyValues(conditionInstance, objectToUpdate);
            ReflectUtil.setPropertyValues(conditionInstance, { tablename: tableName });

            const updateInstance = new ClassConstructor();
            ReflectUtil.setPropertyValues(updateInstance, objectToUpdateWith);

            const hasInstanceUpdate = typeof conditionInstance.update === 'function';
            if (hasInstanceUpdate) {
                return await conditionInstance.update(updateInstance, afterWhere);
            } else {
                return await GenModel.update(conditionInstance, updateInstance, tableName, afterWhere);
            }
        } catch (error) {
            throw new BadRequestException(`Failed to update ${className}: ${error.message}`);
        }
    }

    private async handleDelete(className: string, tableName: string, data: any, afterWhere?: string): Promise<number> {
        if (!data || Object.keys(data).length === 0) {
            throw new BadRequestException('At least one property is required for delete action');
        }
        try {
            const ClassConstructor = await ReflectUtil.getClass(`${className}`);
            const instance = new ClassConstructor();
            ReflectUtil.setPropertyValues(instance, data);
            ReflectUtil.setPropertyValues(instance, { tablename: tableName });

            const hasInstanceDelete = typeof instance.delete === 'function';
            if (hasInstanceDelete) {
                return await instance.delete(afterWhere);
            } else {
                return await GenModel.delete(instance, tableName, afterWhere);
            }
        } catch (error) {
            throw new BadRequestException(`Failed to delete ${className}: ${error.message}`);
        }
    }
}