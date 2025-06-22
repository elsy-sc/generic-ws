"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseUtil = void 0;
const pg_1 = require("pg");
class DatabaseUtil {
    static instance;
    static pool;
    constructor() { }
    static getInstance() {
        if (!DatabaseUtil.instance) {
            DatabaseUtil.instance = new DatabaseUtil();
        }
        return DatabaseUtil.instance;
    }
    static setPool(pool) {
        DatabaseUtil.pool = pool;
    }
    static getPool() {
        if (!DatabaseUtil.pool) {
            DatabaseUtil.pool = new pg_1.Pool({
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
    async withTransaction(callback) {
        const pool = DatabaseUtil.getPool();
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
}
exports.DatabaseUtil = DatabaseUtil;
//# sourceMappingURL=database.util.js.map