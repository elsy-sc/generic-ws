interface GenericRequest {
    data?: any;
    objectToUpdate?: any;
    objectToUpdateWith?: any;
    afterWhere?: string;
}
export declare class GenController {
    handleAction(action: string, className: string, tableName: string, body: GenericRequest): Promise<any>;
    private handleCreate;
    private handleRead;
    private handleUpdate;
    private handleDelete;
}
export {};
