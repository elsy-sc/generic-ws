import { ApiProperty } from "@nestjs/swagger";
import { GenericRequest as IGenericRequest } from "src/interface/request.interface";

export class GenericRequest implements IGenericRequest {
    @ApiProperty({ required: false, type: Object, description: 'Data payload for the request' })
    data?: any;

    @ApiProperty({ required: false, type: Object, description: 'Object to update' })
    objectToUpdate?: any;
    
    @ApiProperty({ required: false, type: Object, description: 'Object to update with' })
    objectToUpdateWith?: any;
    
    @ApiProperty({ required: false, type: String, description: 'After where clause' })
    afterWhere?: string;
}