import { PrismaService } from '../prisma.service';
export interface TemplateComponent {
    id: string;
    type: 'section' | 'question' | 'text' | 'signature' | 'photo' | 'rating' | 'dropdown' | 'checkbox';
    name: string;
    description: string;
    icon: string;
    category: string;
    defaultConfig: any;
}
export interface BuilderOperation {
    type: 'add' | 'update' | 'delete' | 'move' | 'duplicate';
    targetId?: string;
    parentId?: string;
    position?: number;
    data?: any;
}
export declare class TemplateBuilderService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getComponents(): TemplateComponent[];
    applyOperations(templateId: string, operations: BuilderOperation[]): Promise<any>;
    private applyOperation;
    private addItem;
    private updateItem;
    private deleteItem;
    private moveItem;
    private duplicateItem;
    private addItemToParent;
    private updateItemById;
    private removeItemById;
    private findItemById;
    private findAndRemoveItemById;
    private updateNestedItemIds;
    generateFromPattern(patternType: string, options: any): Promise<any>;
    private getSafetyInspectionPattern;
    private getEquipmentCheckPattern;
    private getQualityAuditPattern;
    private getMaintenanceLogPattern;
    private customizePattern;
}
