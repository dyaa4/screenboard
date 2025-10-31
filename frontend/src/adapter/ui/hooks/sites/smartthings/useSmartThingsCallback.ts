import { SMARTTHINGS_REPOSITORY_NAME } from '@common/constants';
import { container } from 'tsyringe';
import { SmartThingsRepository } from '../../../../../application/repositories/smartThingsRepository';

/**
 * Hook to process the SmartThings OAuth callback in the popup window.
 * It extracts `code` and `state` from the URL (or accepts search string)
 * and calls the SmartThings repository to complete the auth on the backend.
 */
export const useSmartThingsCallback = () => {
    const processCallback = async (search: string): Promise<boolean> => {
        try {
            const params = new URLSearchParams(search.startsWith('?') ? search : search.replace(/^\?/, '?'));
            const code = params.get('code');
            const state = params.get('state');
            console.log('SmartThings Callback Params:', { code, state });
            if (!code || !state) {
                throw new Error('Missing code or state in callback URL');
            }

            const repo = container.resolve<SmartThingsRepository>(SMARTTHINGS_REPOSITORY_NAME);
            if (!repo || typeof repo.completeAuth !== 'function') {
                throw new Error('SmartThings repository is not available or does not implement completeAuth');
            }
            console.log('Completing SmartThings auth with code and state');
            await repo.completeAuth(code, state);
            return true;
        } catch (error) {
            console.error('Error processing SmartThings callback:', error);
            return false;
        }
    };

    return { processCallback };
};

export default useSmartThingsCallback;
