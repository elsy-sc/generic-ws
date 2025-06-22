import { Controller, Get, Post, Body, Param, Query, Logger } from '@nestjs/common';
import { ReflectUtil } from 'src/util/reflect.util';
import { GenModel } from 'src/model/gen.model';
import { ResponseUtils } from 'src/util/response.util';

interface GenericRequest {
    data?: any;
    objectToUpdate?: any;
    objectToUpdateWith?: any;
    afterWhere?: string;
}

@Controller('api/gen')
export class GenController {
    
    @Post()
    async handleAction(
        @Query('action') action: string,
        @Query('className') className: string,
        @Query('tableName') tableName: string,
        @Body() body: GenericRequest
    ): Promise<any> {        
        try {
            switch (action?.toLowerCase()) {
                case 'create':
                    return ResponseUtils.success(await this.handleCreate(className, tableName, body.data), 'Created successfully', 201);
                case 'read':
                    return ResponseUtils.success(await this.handleRead(className, tableName, body.data, body.afterWhere), 'Read successfully', 200);
                case 'update':
                    return ResponseUtils.success(await this.handleUpdate(className, tableName, body.objectToUpdate, body.objectToUpdateWith, body.afterWhere), 'Updated successfully', 200);
                case 'delete':
                    await this.handleDelete(className, tableName, body.data, body.afterWhere);
                    return ResponseUtils.success(null, 'Deleted successfully', 200);
                default:
                    return ResponseUtils.error(`Unsupported action: ${action}`, 'Bad Request', 400);
            }
        } catch (error) {
            return ResponseUtils.error(error.message, `Error processing ${action}`, 400);
        }
    }

    private async handleCreate(className: string, tableName: string, data: any): Promise<any> {
        if (!data) {
            throw new Error('Data is required for create action');
        }

        try {
            const ClassConstructor = await ReflectUtil.getClass(`${className.toLowerCase()}`);
            const instance = new ClassConstructor();
            ReflectUtil.setPropertyValues(instance, data);

            return await GenModel.create(instance, tableName);
        } catch (error) {
            throw new Error(`Failed to create ${className}: ${error.message}`);
        }
    }

    private async handleRead(className: string, tableName: string, data: any, afterWhere?: string): Promise<any[]> {
        try {
            const ClassConstructor = await ReflectUtil.getClass(`${className.toLowerCase()}`);
            const instance = new ClassConstructor();

            ReflectUtil.setPropertyValues(instance, data);

            return await GenModel.read(instance, tableName, afterWhere);
        } catch (error) {
            throw new Error(`Failed to read ${className}: ${error.message}`);
        }
    }

    private async handleUpdate(className: string, tableName: string, objectToUpdate: any, objectToUpdateWith: any, afterWhere?: string): Promise<any> {
        if (!objectToUpdate || !objectToUpdateWith) {
            throw new Error('objectToUpdate and objectToUpdateWith are required for update action');
        }

        try {
            const ClassConstructor = await ReflectUtil.getClass(`${className.toLowerCase()}`);
            
            const conditionInstance = new ClassConstructor();
            ReflectUtil.setPropertyValues(conditionInstance, objectToUpdate);

            const updateInstance = new ClassConstructor();
            ReflectUtil.setPropertyValues(updateInstance, objectToUpdateWith);

            return await GenModel.update(conditionInstance, updateInstance, tableName, afterWhere);
        } catch (error) {
            throw new Error(`Failed to update ${className}: ${error.message}`);
        }
    }

    private async handleDelete(className: string, tableName: string, data: any, afterWhere?: string): Promise<void> {
        if (!data) {
            throw new Error('Data is required for delete action');
        }

        try {
            const ClassConstructor = await ReflectUtil.getClass(`${className.toLowerCase()}`);
            const instance = new ClassConstructor();
            
            ReflectUtil.setPropertyValues(instance, data);

            await GenModel.delete(instance, tableName, afterWhere);
        } catch (error) {
            throw new Error(`Failed to delete ${className}: ${error.message}`);
        }
    }
}