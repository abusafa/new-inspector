import { PrismaService } from '../prisma.service';
export declare class UsersController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    get(id: string): Promise<{
        id: string;
        phoneNumber: string;
        name: string;
        role: string;
        email: string | null;
        department: string | null;
        location: string | null;
        employeeId: string | null;
        supervisor: string | null;
        createdAt: Date;
        updatedAt: Date;
        loginTime: Date;
        settings: import("@prisma/client/runtime/library").JsonValue | null;
    } | null>;
    login(body: {
        phoneNumber: string;
    }): Promise<{
        id: string;
        phoneNumber: string;
        name: string;
        role: string;
        email: string | null;
        department: string | null;
        location: string | null;
        employeeId: string | null;
        supervisor: string | null;
        createdAt: Date;
        updatedAt: Date;
        loginTime: Date;
        settings: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
