import { DatabaseUtil } from "src/util/database.util";
import { ReflectUtil } from "src/util/reflect.util";
import { getSequenceName, getSequencePrefix } from "src/annotation/sequence.annotation";
import { BadRequestException, Logger } from '@nestjs/common';
import { GenUtil } from "src/util/gen.util";

export class GenModel {
    private tableName: string;

    constructor(tableName?: string) {
        if (tableName) this.tableName = tableName;
    }

    setTableName(tableName: string) { this.tableName = tableName; }
    getTableName(): string { return this.tableName; }


    static async getSeqNextVal(object: Object, client?: any): Promise<number> {
        if (!object) throw new BadRequestException('Object is required');
        const seqName = getSequenceName(object);
        if (!seqName) throw new BadRequestException('Sequence name is not set');
        const queryExecutor = client || DatabaseUtil.getPool();
        const query = `SELECT nextval('${seqName}') as next_value`;
        const result = await queryExecutor.query(query);
        return result.rows[0].next_value;
    }

    static async getId(object: Object, client?: any): Promise<string> {
        if (!object) throw new BadRequestException('Object is required');
        const prefix = getSequencePrefix(object);
        if (!prefix) throw new BadRequestException('Sequence prefix is not set');
        const seqNextVal = await GenModel.getSeqNextVal(object, client);
        return `${prefix}${seqNextVal}`;
    }

    static async create(object: Object, tableName: string, client?: any): Promise<Object> {
        if (!tableName) {
            throw new BadRequestException('Table name is not set');
        }
        const queryExecutor = client || DatabaseUtil.getPool();
    
        const hasIdProperty = 'id' in object;
        const idValue = hasIdProperty ? (object as any).id : undefined;
    
        if (hasIdProperty && (idValue === null || idValue === undefined || idValue.toString().trim() === '')) {
            if (typeof (object as any).getId === 'function') {
                const newId = await (object as any).getId(client);
                GenModel.setPropertyValues(object, { id: newId });
            } else {
                const newId = await GenModel.getId(object, client);
                GenModel.setPropertyValues(object, { id: newId });
            }
        }
        
        const properties = ReflectUtil.getPropertyValues(object);

        if (Object.keys(properties).length === 0) {
            throw new BadRequestException('No properties found');
        }

        const columns = Object.keys(properties).join(', ');
        const placeholders = Object.keys(properties).map((_, index) => `$${index + 1}`).join(', ');
        const values = Object.values(properties);

        const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders}) RETURNING *`;

        const result = await queryExecutor.query(query, values);
        return GenUtil.toModelPropertiesCase(object, result.rows)[0];
    }

    static async read(
        object: Object,
        tableName: string,
        afterWhere?: string,
        client?: any,
        limit?: number,
        offset?: number
    ): Promise<Object[]> {
        if (!tableName) {
            throw new BadRequestException('Table name is not set');
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
                query += ` AND ${afterWhere}`;
            }
        } else if (afterWhere) {
            query += ` WHERE ${afterWhere}`;
        }
        if (typeof limit === 'number' && typeof offset === 'number' && limit > 0 && offset >= 0) {
            query += ` LIMIT ${limit} OFFSET ${offset}`;
        }
        const result = await queryExecutor.query(query, values);
        return GenUtil.toModelPropertiesCase(object, result.rows);
    }

    static async count(object: Object, tableName: string, afterWhere?: string, client?: any): Promise<number> {
        if (!tableName) {
            throw new BadRequestException('Table name is not set');
        }
        const queryExecutor = client || DatabaseUtil.getPool();
        const properties = ReflectUtil.getPropertyValues(object);
        const keys = Object.keys(properties);
        const values = Object.values(properties);

        let query = `SELECT COUNT(*) as total FROM ${tableName}`;
        if (keys.length > 0) {
            const conditions = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');
            query += ` WHERE ${conditions}`;
            if (afterWhere) {
                query += ` AND ${afterWhere}`;
            }
        } else if (afterWhere) {
            query += ` WHERE ${afterWhere}`;
        }
        const result = await queryExecutor.query(query, values);
        return parseInt(result.rows[0].total, 10);
    }

    static async update(objectToUpdate: Object, objectToUpdateWith: Object, tableName: string, afterWhere?: string, client?: any): Promise<Object> {
        if (!tableName) {
            throw new BadRequestException('Table name is not set');
        }
        const queryExecutor = client || DatabaseUtil.getPool();
        const propertiesToUpdate = ReflectUtil.getPropertyValues(objectToUpdateWith);
        const conditions = ReflectUtil.getPropertyValues(objectToUpdate);

        if (!propertiesToUpdate || Object.keys(propertiesToUpdate).length === 0) {
            throw new BadRequestException('No properties to update');
        }

        if (!conditions || Object.keys(conditions).length === 0 && !afterWhere) {
            throw new BadRequestException('No conditions provided for update');
        }

        const setClause = Object.keys(propertiesToUpdate)
            .map((key, index) => `${key} = $${index + 1}`)
            .join(', ');
        const keys = Object.keys(conditions);
        const values = [...Object.values(propertiesToUpdate), ...Object.values(conditions)];

        let query = `UPDATE ${tableName} SET ${setClause}`;
        if (keys.length > 0) {
            const whereConditions = keys.map((key, index) => `${key} = $${index + 1 + Object.keys(propertiesToUpdate).length}`).join(' AND ');
            query += ` WHERE ${whereConditions}`;
            if (afterWhere) {
                query += ` AND ${afterWhere}`;
            }
        } else if (afterWhere) {
            query += ` WHERE ${afterWhere}`;
        }
        query += ' RETURNING *';
        const result = await queryExecutor.query(query, values);
        return GenUtil.toModelPropertiesCase(objectToUpdate, result.rows)[0];
    }

    static async delete(object: Object, tableName: string, afterWhere?: string, client?: any): Promise<number> {
        if (!tableName) {
            throw new BadRequestException('Table name is not set');
        }
        const queryExecutor = client || DatabaseUtil.getPool();
        const properties = ReflectUtil.getPropertyValues(object);
        const keys = Object.keys(properties);
        const values = Object.values(properties);

        if (keys.length === 0 && !afterWhere) {
            throw new BadRequestException('At least one property is required for delete action');
        }

        let query = `DELETE FROM ${tableName}`;
        if (keys.length > 0) {
            const conditions = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');
            query += ` WHERE ${conditions}`;
            if (afterWhere) {
                query += ` AND ${afterWhere}`;
            }
        } else if (afterWhere) {
            query += ` WHERE ${afterWhere}`;
        }

        const result = await queryExecutor.query(query + ' RETURNING *', values);
        return result.rowCount;
    }

    static async executeNotReturnedQuery(query: string, client: any): Promise<void> {
        if (!query) throw new BadRequestException('Query is required');
        const queryExecutor = client || DatabaseUtil.getPool();
        await queryExecutor.query(query);
    }

    static async executeReturnedQuery(query: string, instance: Object, client?: any): Promise<Object[]> {
        if (!query) throw new BadRequestException('Query is required');
        if (!instance) throw new BadRequestException('Instance is required');
        const queryExecutor = client || DatabaseUtil.getPool();
        const result = await queryExecutor.query(query);
        const ClassConstructor = Object.getPrototypeOf(instance).constructor as { new (): any };
        return GenUtil.toModelPropertiesCase(instance, result.rows.map((row: Record<string, unknown>) => Object.assign(new ClassConstructor(), row)));
    }

    // Method to set properties using automatic setters
    static setPropertyValues(instance: any, values: Record<string, any>): void {
        ReflectUtil.setPropertyValues(instance, values);
    }

    // Instance method to set properties
    setPropertyValues(values: Record<string, any>): void {
        GenModel.setPropertyValues(this, values);
    }

    async getId(client?: any): Promise<string> {
        return await GenModel.getId(this, client);
    }

    async getSeqNextVal(client?: any): Promise<number> {
        return await GenModel.getSeqNextVal(this, client);
    }

    async executeReturnedQuery (query: string, client?: any): Promise<Object[]> {
        return await GenModel.executeReturnedQuery(query, this, client);
    }

    async create(client?: any): Promise<Object> {
        return await GenModel.create(this, this.tableName, client);
    }

    async read(afterWhere?: string, client?: any, limit?: number, offset?: number): Promise<Object[]> {
        return await GenModel.read(this, this.tableName, afterWhere, client, limit, offset);
    }

    async update(objectToUpdateWith: Object, afterWhere?: string, client?: any): Promise<Object> {
        return await GenModel.update(this, objectToUpdateWith, this.tableName, afterWhere, client);
    }

    async delete(afterWhere?: string, client?: any): Promise<void> {
        await GenModel.delete(this, this.tableName, afterWhere, client);
    }
}