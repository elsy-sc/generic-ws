import { Logger } from "@nestjs/common";
import { DatabaseUtil } from "src/util/database.util";
import { ReflectUtil } from "src/util/reflect.util";

export class GenModel {
    private tableName: string;
    private sequenceName?: string;
    private sequencePrefix?: string;

    constructor(sequenceName?: string, sequencePrefix?: string, tableName?: string) {
        if (tableName) {
            this.tableName = tableName;
        }
        if (sequenceName) {
            this.sequenceName = sequenceName;
        }
        if (sequencePrefix) {
            this.sequencePrefix = sequencePrefix;
        }
    }

    setSequence(sequenceName: string, sequencePrefix?: string): void {
        this.sequenceName = sequenceName;
        this.sequencePrefix = sequencePrefix;
    }

    async getSeqNextVal(client?: any): Promise<number> {
        if (!this.sequenceName) {
            throw new Error('Sequence name is not set');
        }
        
        const queryExecutor = client || DatabaseUtil.getPool();
        const query = `SELECT nextval('${this.sequenceName}') as next_value`;

        const result = await queryExecutor.query(query);
        return result.rows[0].next_value;
    }

    async getId(client?: any): Promise<string> {
        if (!this.sequencePrefix) {
            throw new Error('Sequence prefix is not set');
        }
        return `${this.sequencePrefix}${await this.getSeqNextVal(client)}`;
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
    
        const hasIdProperty = 'id' in object;
        const idValue = hasIdProperty ? (object as any).id : undefined;
    
        if (hasIdProperty && (idValue === null || idValue === undefined)) {
            if (typeof (object as any).getId === 'function') {
                (object as any).id = await (object as any).getId(client);
            }
        }
        
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
        const keys = Object.keys(properties);
        const values = Object.values(properties);

        let query = `SELECT * FROM ${tableName}`;
        if (keys.length > 0) {
            const conditions = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');
            query += ` WHERE ${conditions}`;
            if (afterWhere) {
                query += ` ${afterWhere}`;
            }
        } else if (afterWhere) {
            query += ` ${afterWhere}`;
        }

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

        if (!propertiesToUpdate || Object.keys(propertiesToUpdate).length === 0) {
            throw new Error('No properties to update');
        }

        if (!conditions || Object.keys(conditions).length === 0) {
            throw new Error('No conditions provided for update');
        }

        const setClause = Object.keys(propertiesToUpdate)
            .map((key, index) => `${key} = $${index + 1}`)
            .join(', ');
        const whereClause = Object.keys(conditions)
            .map((key, index) => `${key} = $${index + 1 + Object.keys(propertiesToUpdate).length}`)
            .join(' AND ');

        const values = [...Object.values(propertiesToUpdate), ...Object.values(conditions)];

        const query = `UPDATE ${tableName} SET ${setClause} WHERE ${whereClause}${afterWhere ? ' ' + afterWhere : ''} RETURNING *`;

        const result = await queryExecutor.query(query, values);
        return result.rows[0];
    }

    static async delete(object: Object, tableName: string, afterWhere?: string, client?: any): Promise<void> {
        if (!tableName) {
            throw new Error('Table name is not set');
        }
        const queryExecutor = client || DatabaseUtil.getPool();
        const properties = ReflectUtil.getPropertyValues(object);
        const keys = Object.keys(properties);
        const values = Object.values(properties);

        let query = `DELETE FROM ${tableName}`;
        if (keys.length > 0) {
            const conditions = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');
            query += ` WHERE ${conditions}`;
            if (afterWhere) {
                query += ` ${afterWhere}`;
            }
        } else if (afterWhere) {
            query += ` ${afterWhere}`;
        }

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