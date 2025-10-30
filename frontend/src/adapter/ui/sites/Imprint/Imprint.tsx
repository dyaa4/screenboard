import { Card, CardBody } from '@heroui/react';
import React from 'react';

const Impressum: React.FC = () => {
  return (
    <div className="p-4 min-h-screen flex items-center justify-center">
      <Card className="max-w-4xl w-full">
        <CardBody>
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold mb-4">Impressum</h1>

            <h3 className="text-2xl font-semibold mt-6">
              Angaben gemäß § 5 TMG
            </h3>
            <p>
              Mohammed Dyaa Kassoma
              <br />
              Bahnhofstraße 23
              <br />
              08056 Zwickau
            </p>

            <h3 className="text-2xl font-semibold mt-6">Kontakt</h3>
            <p>
              Telefon: 015731166118
              <br />
              E-Mail: dyaa.kassoma@gmail.com
            </p>

            <h3 className="text-2xl font-semibold mt-6">
              Hinweis zur Plattform
            </h3>
            <p>
              Diese Plattform ist ausschließlich für den privaten Gebrauch
              bestimmt und nur für eine geschlossene Benutzergruppe zugänglich.
              Es handelt sich nicht um ein öffentlich zugängliches Angebot.
            </p>

            <h3 className="text-2xl font-semibold mt-6">Urheberrecht</h3>
            <p>
              Die durch den Betreiber erstellten Inhalte und Werke auf diesen
              Seiten unterliegen dem deutschen Urheberrecht. Die
              Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
              Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der
              schriftlichen Zustimmung des Erstellers.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default Impressum;
