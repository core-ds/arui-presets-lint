export type Manifest = Record<string, unknown>;

export type Edit = {
    file: string;
    before: string | null;
    after: string;
};

export type SetupPlan = {
    edits: Edit[];
    warnings: string[];
};

export const isRecord = (value: unknown): value is Manifest =>
    typeof value === 'object' && value !== null && !Array.isArray(value);
