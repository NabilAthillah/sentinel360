export type EmployeeDocumentPivot = {
    id: number;
    employee_id: number;
    document_id: number;
    document: {
        id: number;
        name: string;
    }
}