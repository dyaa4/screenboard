import { Card, CardBody } from '@heroui/react';
import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="p-4 min-h-screen flex items-center justify-center">
      <Card className="max-w-4xl w-full">
        <CardBody>
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold mb-4">Datenschutzerklärung</h1>

            <h3 className="text-2xl font-semibold mt-6">1. Einleitung</h3>
            <p>
              Willkommen auf unserer privaten Screen Board Plattform. Diese
              Webseite befindet sich derzeit im Entwicklungsprozess und ist
              ausschließlich für den privaten Gebrauch und eine geschlossene
              Benutzergruppe bestimmt. Der Schutz Ihrer persönlichen Daten ist
              uns wichtig. In dieser Datenschutzerklärung informieren wir Sie
              darüber, welche Daten wir erheben, wie wir diese verwenden und
              welche Rechte Sie in Bezug auf Ihre Daten haben.
            </p>

            <h3 className="text-2xl font-semibold mt-6">2. Verantwortlicher</h3>
            <p>
              Verantwortlicher für die Datenverarbeitung auf dieser Plattform
              ist:
              <br />
              Dyaa Kassoma
              <br />
              01573 1166118
            </p>

            <h3 className="text-2xl font-semibold mt-6">
              3. Erhebung und Verarbeitung von Daten
            </h3>
            <p>
              <strong className="text-md font-semibold">
                3.1 Nutzerkonten und Authentifizierung
              </strong>
              <br />
              Wir verwenden Auth0 zur Authentifizierung der Benutzer. Auth0
              speichert die Authentifizierungsdaten, die für den Zugriff auf
              unser System erforderlich sind. Wir speichern lediglich das Access
              Token von Auth0 temporär im Arbeitsspeicher, um die
              Authentifizierung mit unserem Server zu ermöglichen.
              <br />
              <br />
              <strong className="text-md font-semibold">
                3.2 Google Kalender API
              </strong>
              <br />
              Um Ihnen Kalender-Events anzeigen zu können, integrieren wir die
              Google Kalender API. Hierbei wird ein separates Access Token zum
              Abrufen von Kalenderdaten temporär im Arbeitsspeicher gespeichert.
              Wir speichern keine Kalenderdaten lokal auf unserem Server.
            </p>

            <h3 className="text-2xl font-semibold mt-6">
              4. Zweck der Datenverarbeitung
            </h3>
            <p>
              Die von uns erhobenen Daten werden ausschließlich für die
              folgenden Zwecke verwendet:
              <br />
              - Authentifizierung und Verwaltung von Benutzerkonten
              <br />- Zugriff auf und Anzeige von Google Kalender-Events
            </p>

            <h3 className="text-2xl font-semibold mt-6">5. Sicherheit</h3>
            <p>
              Wir treffen angemessene technische und organisatorische Maßnahmen,
              um Ihre Daten vor unbefugtem Zugriff, Verlust oder Zerstörung zu
              schützen. Dazu gehört die Nutzung von HTTPS für die sichere
              Übertragung von Daten.
            </p>

            <h3 className="text-2xl font-semibold mt-6">6. Cookies</h3>
            <p>
              Unsere Plattform verwendet keine Cookies zur Speicherung von
              Benutzerdaten. Alle notwendigen Daten werden temporär im
              Arbeitsspeicher gehalten.
            </p>

            <h3 className="text-2xl font-semibold mt-6">
              7. Datenweitergabe an Dritte
            </h3>
            <p>
              Wir geben Ihre persönlichen Daten nicht an Dritte weiter, es sei
              denn, dies ist zur Erfüllung der oben genannten Zwecke
              erforderlich oder gesetzlich vorgeschrieben.
            </p>

            <h3 className="text-2xl font-semibold mt-6">8. Ihre Rechte</h3>
            <p>
              Sie haben das Recht, Auskunft über die über Sie gespeicherten
              Daten zu verlangen, diese zu berichtigen oder zu löschen. Für die
              Wahrnehmung Ihrer Rechte können Sie uns unter den oben angegebenen
              Kontaktdaten erreichen.
            </p>

            <h3 className="text-2xl font-semibold mt-6">
              9. Änderungen der Datenschutzerklärung
            </h3>
            <p>
              Wir behalten uns das Recht vor, diese Datenschutzerklärung
              jederzeit zu ändern. Änderungen werden auf unserer Plattform
              veröffentlicht. Bitte überprüfen Sie regelmäßig die
              Datenschutzerklärung, um über die aktuellen Datenschutzpraktiken
              informiert zu bleiben.
            </p>

            <h3 className="text-2xl font-semibold mt-6">10. Kontakt</h3>
            <p>
              Bei Fragen zur Datenschutzerklärung oder zum Datenschutz können
              Sie uns unter den folgenden Kontaktdaten erreichen:
              <br />
              Dyaa Kassoma
              <br />
              Software Developer
              <br />
              01573 1166118
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default PrivacyPolicy;
