import { DatabaseUtil } from 'src/util/database.util';

export class TableUtil {
    static async getTableColumns(tableName: string): Promise<string[]> {
        const pool = DatabaseUtil.getPool();
        const query = `SELECT column_name FROM information_schema.columns WHERE table_name = $1`;
        const result = await pool.query(query, [tableName]);
        return result.rows.map((row: any) => row.column_name);
    }
}
