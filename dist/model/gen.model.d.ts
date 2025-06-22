export declare class GenModel {
    private tableName;
    constructor(tableName?: string);
    setTableName(tableName: string): void;
    getTableName(): string;
    static create(object: Object, tableName: string, client?: any): Promise<Object>;
    static read(object: Object, tableName: string, afterWhere?: string, client?: any): Promise<Object[]>;
    static update(objectToUpdate: Object, objectToUpdateWith: Object, tableName: string, afterWhere?: string, client?: any): Promise<Object>;
    static delete(object: Object, tableName: string, afterWhere?: string, client?: any): Promise<void>;
    create(client?: any): Promise<Object>;
    read(afterWhere?: string, client?: any): Promise<Object[]>;
    update(objectToUpdateWith: Object, afterWhere?: string, client?: any): Promise<Object>;
    delete(afterWhere?: string, client?: any): Promise<void>;
}
