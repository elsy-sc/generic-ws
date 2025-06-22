import { Pool } from 'pg';
export declare class DatabaseUtil {
    private static instance;
    private static pool;
    private constructor();
    static getInstance(): DatabaseUtil;
    static setPool(pool: Pool): void;
    static getPool(): Pool;
    withTransaction<T>(callback: (client: any) => Promise<T>): Promise<T>;
}
