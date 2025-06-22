export interface GenericRequest {
    data?: any;
    objectToUpdate?: any;
    objectToUpdateWith?: any;
    afterWhere?: string;
}

export interface PaginationQuery {
    page?: number;
    limit?: number;
}