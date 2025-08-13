import { TemplateBuilderService, BuilderOperation } from './template-builder.service';
export declare class TemplateBuilderController {
    private readonly builderService;
    constructor(builderService: TemplateBuilderService);
    getComponents(): import("./template-builder.service").TemplateComponent[];
    getPatterns(): {
        id: string;
        name: string;
        description: string;
        category: string;
        icon: string;
        estimatedDuration: number;
    }[];
    generateFromPattern(patternType: string, options: any): Promise<any>;
    applyOperations(templateId: string, body: {
        operations: BuilderOperation[];
    }): Promise<any>;
    addComponent(templateId: string, body: {
        componentType: string;
        parentId?: string;
        position?: number;
        customConfig?: any;
    }): Promise<any>;
    updateItem(templateId: string, itemId: string, updateData: any): Promise<any>;
    duplicateItem(templateId: string, itemId: string, body: {
        parentId?: string;
        position?: number;
    }): Promise<any>;
    moveItem(templateId: string, itemId: string, body: {
        parentId?: string;
        position?: number;
    }): Promise<any>;
    deleteItem(templateId: string, itemId: string): Promise<any>;
}
