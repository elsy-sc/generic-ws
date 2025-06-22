import { Pool } from 'pg';

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
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '5432'),
                database: process.env.DB_NAME || 'postgres',
                user: process.env.DB_USER || 'postgres',
                password: process.env.DB_PASSWORD || 'password',
                max: 10,
                idleTimeoutMillis: 30000,
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
