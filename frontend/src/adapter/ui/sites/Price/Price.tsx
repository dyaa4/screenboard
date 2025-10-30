import { Button, Card, Divider } from '@heroui/react';

const Pricing = () => {
  const plans = [
    {
      title: 'Basic',
      price: '€9',
      period: 'Monat',
      features: ['Feature 1', 'Feature 2', 'Feature 3'],
      buttonText: 'Jetzt starten',
    },
    {
      title: 'Pro',
      price: '€19',
      period: 'Monat',
      features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4'],
      buttonText: 'Kostenlos testen',
    },
    {
      title: 'Enterprise',
      price: '€49',
      period: 'Monat',
      features: [
        'Feature 1',
        'Feature 2',
        'Feature 3',
        'Feature 4',
        'Feature 5',
      ],
      buttonText: 'Kontakt aufnehmen',
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-12 min-h-full">
      <h1 className="text-4xl font-bold text-center mb-6 text-gray-800 dark:text-gray-200">
        Unsere Preise
      </h1>
      <p className="text-center mb-12 text-gray-600 dark:text-gray-400">
        Wähle den Plan, der am besten zu dir passt.
      </p>
      {/* Container for the cards */}
      <div className="flex flex-wrap justify-center gap-8">
        {plans.map((plan) => (
          <Card
            key={plan.title}
            className="w-full sm:w-72 p-6 bg-white dark:bg-content1 shadow-md rounded-lg transition duration-300 transform hover:scale-105"
          >
            <h2 className="text-2xl font-semibold text-center mb-4 text-gray-800 dark:text-gray-200">
              {plan.title}
            </h2>
            <p className="text-center text-gray-500 dark:text-gray-400 text-lg">
              <span className="text-4xl font-bold text-gray-800 dark:text-gray-200">
                {plan.price}
              </span>{' '}
              / {plan.period}
            </p>
            <Divider className="my-4" />
            <ul className="mb-6">
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  className="text-gray-600 dark:text-gray-400 text-center mb-2"
                >
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              color="primary"
              className="w-full"
              size="lg"
              variant="bordered"
              radius="full"
            >
              {plan.buttonText}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Pricing;
