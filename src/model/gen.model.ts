import { DatabaseUtil } from "src/util/database.util";
import { ReflectUtil } from "src/util/reflect.util";

export class GenModel {
    private tableName: string;

    constructor(tableName?: string) {
        if (tableName) {
            this.tableName = tableName;
        }
    }

    setTableName(tableName: string): void {
        this.tableName = tableName;
    }

    getTableName(): string {
        return this.tableName;
    }

    static async create(object: Object, tableName: string, client?: any): Promise<Object> {
        if (!tableName) {
            throw new Error('Table name is not set');
        }
        const queryExecutor = client || DatabaseUtil.getPool();
        const properties = ReflectUtil.getPropertyValues(object);

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

    static async read(object: Object, tableName: string, afterWhere?: string, client?: any): Promise<Object[]> {
        if (!tableName) {
            throw new Error('Table name is not set');
        }
        const queryExecutor = client || DatabaseUtil.getPool();
        const properties = ReflectUtil.getPropertyValues(object);
        const conditions = Object.keys(properties).map((key, index) => `${key} = $${index + 1}`).join(' AND ');
        const values = Object.values(properties);

        let query = `SELECT * FROM ${tableName}`;
        query += ` WHERE ${conditions} ${afterWhere ? afterWhere : ''}`;
        
        const result = await queryExecutor.query(query, values);
        return result.rows;
    }

    static async update(objectToUpdate: Object, objectToUpdateWith: Object, tableName: string, afterWhere?: string, client?: any): Promise<Object> {
        if (!tableName) {
            throw new Error('Table name is not set');
        }
        const queryExecutor = client || DatabaseUtil.getPool();
        const propertiesToUpdate = ReflectUtil.getPropertyValues(objectToUpdateWith);
        const conditions = ReflectUtil.getPropertyValues(objectToUpdate);

        if (propertiesToUpdate === null || Object.keys(propertiesToUpdate).length === 0){
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

    static async delete(object: Object, tableName: string, afterWhere?: string, client?: any): Promise<void> {
        if (!tableName) {
            throw new Error('Table name is not set');
        }
        const queryExecutor = client || DatabaseUtil.getPool();
        const properties = ReflectUtil.getPropertyValues(object);
        const conditions = Object.keys(properties).map((key, index) => `${key} = $${index + 1}`).join(' AND ');
        const values = Object.values(properties);

        const query = `DELETE FROM ${tableName} WHERE ${conditions} ${afterWhere ? afterWhere : ''}`;

        await queryExecutor.query(query, values);
    }

    async create(client?: any): Promise<Object> {
        return await GenModel.create(this, this.tableName, client);
    }

    async read(afterWhere?: string, client?: any): Promise<Object[]> {
        return await GenModel.read(this, this.tableName, afterWhere, client);
    }

    async update(objectToUpdateWith: Object, afterWhere?: string, client?: any): Promise<Object> {
        return await GenModel.update(this, objectToUpdateWith, this.tableName, afterWhere, client);
    }

    async delete(afterWhere?: string, client?: any): Promise<void> {
        await GenModel.delete(this, this.tableName, afterWhere, client);
    }
}