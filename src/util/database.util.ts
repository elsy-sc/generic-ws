import { Pool } from 'pg';
import { DEFAULT_DB_HOST, DEFAULT_DB_PORT, DEFAULT_DB_NAME, DEFAULT_DB_USER, DEFAULT_DB_PASSWORD } from './constante.util';

export class DatabaseUtil {
    private static instance: DatabaseUtil;
    private static pool: Pool;

    private constructor() {}

    static getInstance(): DatabaseUtil {
        if (!DatabaseUtil.instance) {
            DatabaseUtil.instance = new DatabaseUtil();
        }
        return DatabaseUtil.instance;
    }

    static setPool(pool: Pool) {
        DatabaseUtil.pool = pool;
    }

    static getPool(): Pool {
        if (!DatabaseUtil.pool) {
            DatabaseUtil.pool = new Pool({
                host: process.env.DB_HOST || DEFAULT_DB_HOST,
                port: parseInt(process.env.DB_PORT || DEFAULT_DB_PORT.toString()),
                database: process.env.DB_NAME || DEFAULT_DB_NAME,
                user: process.env.DB_USER || DEFAULT_DB_USER,
                password: process.env.DB_PASSWORD || DEFAULT_DB_PASSWORD,
            });
        }
        return DatabaseUtil.pool;
    }

    async withTransaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
        const pool = DatabaseUtil.getPool();
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}
