import { COMMUNICATION_REPOSITORY_NAME } from '@common/constants';
import { useEffect, useState } from 'react';
import { container } from 'tsyringe';
import { CommunicationRepository } from '../../../../application/repositories/communicationRepository';

export const useCommunicationRepository = (dashboardId: string | undefined) => {
  const [communicationRepository, setCommunicationRepository] =
    useState<CommunicationRepository | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!dashboardId) {
      return;
    }
    const repo = container.resolve<CommunicationRepository>(
      COMMUNICATION_REPOSITORY_NAME,
    );
    // Hier kannst du auch async init machen falls nötig
    // await repo.initialize();
    repo.connect(dashboardId);
    setCommunicationRepository(repo);
    setInitialized(true);
  }, [dashboardId]);

  return { communicationRepository, initialized };
};
