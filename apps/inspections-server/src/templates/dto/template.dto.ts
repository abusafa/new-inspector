import { IsString, IsOptional, IsBoolean, IsArray, IsInt, IsIn, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTemplateDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsObject()
  schemaJson: any;

  @IsOptional()
  @IsString()
  templateId?: string;

  @IsOptional()
  @IsString()
  category?: string = 'General';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[] = [];

  @IsOptional()
  @IsString()
  version?: string = '1.0.0';

  @IsOptional()
  @IsIn(['draft', 'published', 'archived'])
  status?: string = 'draft';

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean = false;

  @IsOptional()
  @IsString()
  createdBy?: string;

  @IsOptional()
  @IsInt()
  estimatedDuration?: number;

  @IsOptional()
  @IsIn(['easy', 'medium', 'hard'])
  difficulty?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  equipmentType?: string;
}

export class UpdateTemplateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  schemaJson?: any;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  @IsIn(['draft', 'published', 'archived'])
  status?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsString()
  lastModifiedBy?: string;

  @IsOptional()
  @IsInt()
  estimatedDuration?: number;

  @IsOptional()
  @IsIn(['easy', 'medium', 'hard'])
  difficulty?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  equipmentType?: string;
}

export class DuplicateTemplateDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  createdBy?: string;
}

export class TemplateQueryDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsIn(['draft', 'published', 'archived'])
  status?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  equipmentType?: string;

  @IsOptional()
  @IsString()
  createdBy?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  limit?: number = 20;

  @IsOptional()
  @IsIn(['createdAt', 'updatedAt', 'name', 'category'])
  sortBy?: string = 'updatedAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: string = 'desc';
}

// Template validation schemas
export class HeaderItemDto {
  @IsString()
  item_id: string;

  @IsIn(['datetime', 'text', 'number'])
  type: string;

  @IsString()
  label: string;

  @IsObject()
  options: {
    required?: boolean;
    default_to_current_time?: boolean;
    placeholder?: string;
    min?: number;
    max?: number;
  };
}

export class ResponseDto {
  @IsString()
  id: string;

  @IsString()
  label: string;

  @IsOptional()
  score?: number | null;

  @IsIn(['green', 'red', 'yellow', 'grey'])
  color: string;
}

export class ResponseSetDto {
  @IsIn(['multiple-choice', 'rating', 'dropdown'])
  type: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseDto)
  responses: ResponseDto[];
}

export class ConditionDto {
  @IsString()
  field: string;

  @IsIn(['is', 'is_not', 'contains', 'greater_than', 'less_than'])
  operator: string;

  @IsString()
  value: string;
}

export class InspectionItemDto {
  @IsString()
  item_id: string;

  @IsIn(['section', 'question', 'text', 'signature', 'photo', 'rating', 'dropdown', 'checkbox'])
  type: string;

  @IsString()
  label: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InspectionItemDto)
  items?: InspectionItemDto[];

  @IsOptional()
  @IsString()
  parent_id?: string;

  @IsOptional()
  @IsObject()
  options?: {
    required?: boolean;
    allow_photos?: boolean;
    placeholder?: string;
    min_rating?: number;
    max_rating?: number;
    multiple_selection?: boolean;
  };

  @IsOptional()
  @ValidateNested()
  @Type(() => ResponseSetDto)
  response_set?: ResponseSetDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConditionDto)
  conditions?: ConditionDto[];
}

export class TemplateSchemaDto {
  @IsString()
  template_id: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HeaderItemDto)
  header_items: HeaderItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InspectionItemDto)
  items: InspectionItemDto[];
}

