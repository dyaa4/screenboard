export interface CompleteAuthOutput {
    completeAuth(code: string, state: string): Promise<void>;
}