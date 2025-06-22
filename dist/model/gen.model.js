"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenModel = void 0;
const database_util_1 = require("../util/database.util");
const reflect_util_1 = require("../util/reflect.util");
class GenModel {
    tableName;
    constructor(tableName) {
        if (tableName) {
            this.tableName = tableName;
        }
    }
    setTableName(tableName) {
        this.tableName = tableName;
    }
    getTableName() {
        return this.tableName;
    }
    static async create(object, tableName, client) {
        if (!tableName) {
            throw new Error('Table name is not set');
        }
        const queryExecutor = client || database_util_1.DatabaseUtil.getPool();
        const properties = reflect_util_1.ReflectUtil.getPropertyValues(object);
        if (Object.keys(properties).length === 0) {
            throw new Error('No properties found');
        }
        const columns = Object.keys(properties).join(', ');
        const placeholders = Object.keys(properties).map((_, index) => `$${index + 1}`).join(', ');
        const values = Object.values(properties);
        const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders}) RETURNING *`;
        const result = await queryExecutor.query(query, values);
        return result.rows[0];
    }
    static async read(object, tableName, afterWhere, client) {
        if (!tableName) {
            throw new Error('Table name is not set');
        }
        const queryExecutor = client || database_util_1.DatabaseUtil.getPool();
        const properties = reflect_util_1.ReflectUtil.getPropertyValues(object);
        const conditions = Object.keys(properties).map((key, index) => `${key} = $${index + 1}`).join(' AND ');
        const values = Object.values(properties);
        let query = `SELECT * FROM ${tableName}`;
        query += ` WHERE ${conditions} ${afterWhere ? afterWhere : ''}`;
        const result = await queryExecutor.query(query, values);
        return result.rows;
    }
    static async update(objectToUpdate, objectToUpdateWith, tableName, afterWhere, client) {
        if (!tableName) {
            throw new Error('Table name is not set');
        }
        const queryExecutor = client || database_util_1.DatabaseUtil.getPool();
        const propertiesToUpdate = reflect_util_1.ReflectUtil.getPropertyValues(objectToUpdateWith);
        const conditions = reflect_util_1.ReflectUtil.getPropertyValues(objectToUpdate);
        if (propertiesToUpdate === null || Object.keys(propertiesToUpdate).length === 0) {
            throw new Error('No properties to update');
        }
        if (conditions === null || Object.keys(conditions).length === 0) {
            throw new Error('No conditions provided for update');
        }
        const setClause = Object.keys(propertiesToUpdate)
            .map((key, index) => `${key} = $${index + 1}`)
            .join(', ');
        const whereClause = Object.keys(conditions)
            .map((key, index) => `${key} = $${index + 1 + Object.keys(propertiesToUpdate).length}`)
            .join(' AND ');
        const values = [...Object.values(propertiesToUpdate), ...Object.values(conditions)];
        const query = `UPDATE ${tableName} SET ${setClause} WHERE ${whereClause} ${afterWhere ? afterWhere : ''} RETURNING *`;
        const result = await queryExecutor.query(query, values);
        return result.rows[0];
    }
    static async delete(object, tableName, afterWhere, client) {
        if (!tableName) {
            throw new Error('Table name is not set');
        }
        const queryExecutor = client || database_util_1.DatabaseUtil.getPool();
        const properties = reflect_util_1.ReflectUtil.getPropertyValues(object);
        const conditions = Object.keys(properties).map((key, index) => `${key} = $${index + 1}`).join(' AND ');
        const values = Object.values(properties);
        const query = `DELETE FROM ${tableName} WHERE ${conditions} ${afterWhere ? afterWhere : ''}`;
        await queryExecutor.query(query, values);
    }
    async create(client) {
        return await GenModel.create(this, this.tableName, client);
    }
    async read(afterWhere, client) {
        return await GenModel.read(this, this.tableName, afterWhere, client);
    }
    async update(objectToUpdateWith, afterWhere, client) {
        return await GenModel.update(this, objectToUpdateWith, this.tableName, afterWhere, client);
    }
    async delete(afterWhere, client) {
        await GenModel.delete(this, this.tableName, afterWhere, client);
    }
}
exports.GenModel = GenModel;
//# sourceMappingURL=gen.model.js.map