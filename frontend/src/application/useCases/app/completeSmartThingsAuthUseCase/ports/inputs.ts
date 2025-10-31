export interface CompleteAuthInput {
    execute(code: string, state: string): Promise<void>;
}