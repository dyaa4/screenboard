import { inject, injectable } from 'tsyringe';
import { COMPLETE_SMARTTHINGS_AUTH_OUTPUT_PORT } from '@common/constants';
import type { CompleteAuthOutput } from './ports/outputs';
import type { CompleteAuthInput } from './ports/inputs';

@injectable()
export class CompleteSmartThingsAuthUseCase implements CompleteAuthInput {
    constructor(
        @inject(COMPLETE_SMARTTHINGS_AUTH_OUTPUT_PORT)
        private readonly output: CompleteAuthOutput,
    ) { }

    async execute(code: string, state: string): Promise<void> {
        await this.output.completeAuth(code, state);
    }
}