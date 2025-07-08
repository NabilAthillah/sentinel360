export type EmployeeDocumentPivot = {
    id: number;
    employee_id: number;
    document_id: number;
    file_name?: string;
    url?: string
    document: {
        id: number;
        name: string;
    }
}