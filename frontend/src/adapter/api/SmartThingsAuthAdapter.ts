import { injectable } from 'tsyringe';
import axios from 'axios';
import { getApiUrl } from './helper';
import { CompleteAuthOutput } from '../../application/useCases/app/completeSmartThingsAuthUseCase/ports/outputs';

@injectable()
export default class SmartThingsAuthAdapter implements CompleteAuthOutput {
    async completeAuth(code: string, state: string): Promise<void> {
        console.log('SmartThingsAuthAdapter.completeAuth called with code and state');
        try {
            await axios.post(`${getApiUrl(`/api/auth/smartthings/complete`)}`, { code, state }, {
                headers: { 'Content-Type': 'application/json' },
            });
        } catch (error) {
            console.error('Error completing SmartThings auth:', error);
            throw new Error('Failed to complete SmartThings auth');
        }
    }
}