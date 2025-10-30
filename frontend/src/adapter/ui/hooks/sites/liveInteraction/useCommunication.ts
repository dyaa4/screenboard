// useCommunication.ts
import { CommunicationRepository } from '../../../../../application/repositories/communicationRepository';
import { COMMUNICATION_REPOSITORY_NAME } from '@common/constants';
import { useEffect, useRef, useState } from 'react';
import { container } from 'tsyringe';

export const useCommunication = (dashboardId: string | undefined) => {
  const [lastReceivedMessage, setLastReceivedMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const communicationRef = useRef<CommunicationRepository | null>(null);

  useEffect(() => {
    if (!dashboardId) {
      return;
    }

    try {
      communicationRef.current = container.resolve<CommunicationRepository>(
        COMMUNICATION_REPOSITORY_NAME,
      );

      const messageHandler = (receivedMessage: string) => {
        setLastReceivedMessage(receivedMessage);
      };

      communicationRef.current.receiveCommunicationMessage(messageHandler);
      communicationRef.current.connect(dashboardId); // Type cast wegen Interface
      return () => {
        // If CommunicationRepository has an unsubscribe method, use it here
        // communicationRef.current?.unsubscribe(messageHandler);
      };
    } catch (err) {
      setError('Failed to initialize communication');
      console.error(err);
    }
  }, [dashboardId]);

  const sendMessage = async (
    message: string,
    dashboardId: string | undefined,
  ) => {
    if (!dashboardId) {
      return;
    }
    try {
      communicationRef.current?.sendCommunicationMessage(message);
      await communicationRef.current?.connect(dashboardId);
    } catch (err) {
      setError('Failed to send message');
      console.error(err);
    }
  };

  return { sendMessage, lastReceivedMessage, error };
};
