export declare class CreateTemplateDto {
    name: string;
    description: string;
    schemaJson: any;
    templateId?: string;
    category?: string;
    tags?: string[];
    version?: string;
    status?: string;
    isPublic?: boolean;
    createdBy?: string;
    estimatedDuration?: number;
    difficulty?: string;
    industry?: string;
    equipmentType?: string;
}
export declare class UpdateTemplateDto {
    name?: string;
    description?: string;
    schemaJson?: any;
    category?: string;
    tags?: string[];
    version?: string;
    status?: string;
    isPublic?: boolean;
    lastModifiedBy?: string;
    estimatedDuration?: number;
    difficulty?: string;
    industry?: string;
    equipmentType?: string;
}
export declare class DuplicateTemplateDto {
    name: string;
    description?: string;
    category?: string;
    tags?: string[];
    createdBy?: string;
}
export declare class TemplateQueryDto {
    category?: string;
    status?: string;
    search?: string;
    tags?: string[];
    industry?: string;
    equipmentType?: string;
    createdBy?: string;
    isPublic?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
}
export declare class HeaderItemDto {
    item_id: string;
    type: string;
    label: string;
    options: {
        required?: boolean;
        default_to_current_time?: boolean;
        placeholder?: string;
        min?: number;
        max?: number;
    };
}
export declare class ResponseDto {
    id: string;
    label: string;
    score?: number | null;
    color: string;
}
export declare class ResponseSetDto {
    type: string;
    responses: ResponseDto[];
}
export declare class ConditionDto {
    field: string;
    operator: string;
    value: string;
}
export declare class InspectionItemDto {
    item_id: string;
    type: string;
    label: string;
    items?: InspectionItemDto[];
    parent_id?: string;
    options?: {
        required?: boolean;
        allow_photos?: boolean;
        placeholder?: string;
        min_rating?: number;
        max_rating?: number;
        multiple_selection?: boolean;
    };
    response_set?: ResponseSetDto;
    conditions?: ConditionDto[];
}
export declare class TemplateSchemaDto {
    template_id: string;
    name: string;
    description: string;
    header_items: HeaderItemDto[];
    items: InspectionItemDto[];
}
