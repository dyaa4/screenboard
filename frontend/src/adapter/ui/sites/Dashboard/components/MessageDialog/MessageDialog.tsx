import { CommunicationRepository } from '../../../../../../application/repositories/communicationRepository';
import { COMMUNICATION_REPOSITORY_NAME } from '@common/constants';
import { useCallback, useEffect, useRef, useState } from 'react';
import { container } from 'tsyringe';

const useSVGTextFit = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const textRef = useRef<SVGTextElement>(null);

  const fitText = useCallback(() => {
    const svg = svgRef.current;
    const text = textRef.current;
    if (!svg || !text) return;

    // Set a large font size to determine the maximum width
    text.style.fontSize = '1000px';

    const bbox = text.getBBox();
    const containerWidth = svg.clientWidth;
    const containerHeight = svg.clientHeight;

    // Calculate the scaling ratio
    const scale = Math.min(
      containerWidth / bbox.width,
      containerHeight / bbox.height,
    );

    // Set the calculated font size
    const fontSize = Math.floor(scale * 1000);
    text.style.fontSize = `${fontSize}px`;

    // Center the text
    text.setAttribute('x', '50%');
    text.setAttribute('y', '50%');
  }, []);

  useEffect(() => {
    fitText();
    window.addEventListener('resize', fitText);
    return () => window.removeEventListener('resize', fitText);
  }, [fitText]);

  return { svgRef, textRef, fitText };
};

interface MessageDialogProps {
  dashboardId: string | undefined;
}

const MessageDialog = ({ dashboardId }: MessageDialogProps) => {
  const [message, setMessage] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { svgRef, textRef, fitText } = useSVGTextFit();

  useEffect(() => {
    audioRef.current = new Audio('/sounds/notification.ogg');
    audioRef.current.load();
  }, []);

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((error) => {
        console.error('Failed to play sound:', error);
      });
    }
  };

  const hideMessage = useCallback(() => {
    setIsVisible(false);
  }, []);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(hideMessage, 10000);
  }, [hideMessage]);

  useEffect(() => {
    if (!dashboardId) {
      return;
    }

    // Speichern Sie die Service-Instanz
    const communicationService = container.resolve<CommunicationRepository>(
      COMMUNICATION_REPOSITORY_NAME,
    );

    // Initialisiere die Verbindung
    communicationService.connect(dashboardId);

    const messageHandler = (receivedMessage: string) => {
      console.log('Nachricht empfangen in der Komponente:', receivedMessage);
      setMessage(receivedMessage);
      setIsVisible(true);
      playNotificationSound();
      resetTimer();
      setTimeout(fitText, 0);
    };

    // Registriere den Handler
    communicationService.receiveCommunicationMessage(messageHandler);

    // Cleanup
    return () => {
      // Entferne den Handler
      communicationService.abmelden('communication-response');
      // Setze den Message-Handler zurück
      communicationService.receiveCommunicationMessage(() => {});
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [dashboardId, fitText, resetTimer]); // Nur die wirklich benötigten Dependencies
  useEffect(() => {
    fitText();
  }, [message, fitText]);

  if (!isVisible || !message) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <style>
        {`
          @keyframes borderGlow {
            0% { border-color: rgba(255, 0, 0, 0.2); }
            50% { border-color: rgba(255, 0, 0, 0.8); }
            100% { border-color: rgba(255, 0, 0, 0.2); }
          }
          @keyframes dotPulse {
            0% { transform: scale(0.95); opacity: 0.7; }
            50% { transform: scale(1.05); opacity: 1; }
            100% { transform: scale(0.95); opacity: 0.7; }
          }
        `}
      </style>
      <div
        className="bg-linear-to-br text-white p-8 rounded-2xl shadow-2xl flex items-center justify-center relative"
        style={{
          width: '70%',
          height: '350px',
          overflow: 'visible',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          background: 'rgba(0, 0, 0, 0.5)',
          border: '2px solid rgba(255, 0, 0, 0.2)',
          animation: 'borderGlow 3s ease-in-out infinite',
          transition: 'border-color 0.3s ease-in-out',
        }}
      >
        <div
          className="absolute top-4 right-4 w-4 h-4 bg-red-500 rounded-full z-10"
          style={{
            animation: 'dotPulse 1.5s ease-in-out infinite',
            boxShadow: '0 0 5px rgba(255, 0, 0, 0.4)',
          }}
        ></div>
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
        >
          <text
            ref={textRef}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontWeight="bold"
            style={{
              filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
            }}
          >
            {message}
          </text>
        </svg>
      </div>
    </div>
  );
};

export default MessageDialog;
