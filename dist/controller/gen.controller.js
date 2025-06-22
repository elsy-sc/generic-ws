"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenController = void 0;
const common_1 = require("@nestjs/common");
const reflect_util_1 = require("../util/reflect.util");
const gen_model_1 = require("../model/gen.model");
let GenController = class GenController {
    async handleAction(action, className, tableName, body) {
        try {
            switch (action?.toLowerCase()) {
                case 'create':
                    return await this.handleCreate(className, tableName, body.data);
                case 'read':
                    return await this.handleRead(className, tableName, body.data, body.afterWhere);
                case 'update':
                    return await this.handleUpdate(className, tableName, body.objectToUpdate, body.objectToUpdateWith, body.afterWhere);
                case 'delete':
                    return await this.handleDelete(className, tableName, body.data, body.afterWhere);
                default:
                    throw new Error(`Unsupported action: ${action}`);
            }
        }
        catch (error) {
            throw new Error(`Error processing ${action}: ${error.message}`);
        }
    }
    async handleCreate(className, tableName, data) {
        if (!data) {
            throw new Error('Data is required for create action');
        }
        try {
            const ClassConstructor = await reflect_util_1.ReflectUtil.getClass(`${className.toLowerCase()}`);
            const instance = new ClassConstructor();
            reflect_util_1.ReflectUtil.setPropertyValues(instance, data);
            return await gen_model_1.GenModel.create(instance, tableName);
        }
        catch (error) {
            throw new Error(`Failed to create ${className}: ${error.message}`);
        }
    }
    async handleRead(className, tableName, data, afterWhere) {
        try {
            const ClassConstructor = await reflect_util_1.ReflectUtil.getClass(`${className.toLowerCase()}`);
            const instance = new ClassConstructor();
            reflect_util_1.ReflectUtil.setPropertyValues(instance, data);
            return await gen_model_1.GenModel.read(instance, tableName, afterWhere);
        }
        catch (error) {
            throw new Error(`Failed to read ${className}: ${error.message}`);
        }
    }
    async handleUpdate(className, tableName, objectToUpdate, objectToUpdateWith, afterWhere) {
        if (!objectToUpdate || !objectToUpdateWith) {
            throw new Error('objectToUpdate and objectToUpdateWith are required for update action');
        }
        try {
            const ClassConstructor = await reflect_util_1.ReflectUtil.getClass(`${className.toLowerCase()}`);
            const conditionInstance = new ClassConstructor();
            reflect_util_1.ReflectUtil.setPropertyValues(conditionInstance, objectToUpdate);
            const updateInstance = new ClassConstructor();
            reflect_util_1.ReflectUtil.setPropertyValues(updateInstance, objectToUpdateWith);
            return await gen_model_1.GenModel.update(conditionInstance, updateInstance, tableName, afterWhere);
        }
        catch (error) {
            throw new Error(`Failed to update ${className}: ${error.message}`);
        }
    }
    async handleDelete(className, tableName, data, afterWhere) {
        if (!data) {
            throw new Error('Data is required for delete action');
        }
        try {
            const ClassConstructor = await reflect_util_1.ReflectUtil.getClass(`${className.toLowerCase()}`);
            const instance = new ClassConstructor();
            reflect_util_1.ReflectUtil.setPropertyValues(instance, data);
            await gen_model_1.GenModel.delete(instance, tableName, afterWhere);
        }
        catch (error) {
            throw new Error(`Failed to delete ${className}: ${error.message}`);
        }
    }
};
exports.GenController = GenController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Query)('action')),
    __param(1, (0, common_1.Query)('className')),
    __param(2, (0, common_1.Query)('tableName')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], GenController.prototype, "handleAction", null);
exports.GenController = GenController = __decorate([
    (0, common_1.Controller)('api/gen')
], GenController);
//# sourceMappingURL=gen.controller.js.map