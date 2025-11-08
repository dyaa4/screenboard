import { Button, Card, CardBody, CardHeader, Chip, Divider } from '@heroui/react';
import { motion } from 'framer-motion';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiCheck, FiGrid } from 'react-icons/fi';

interface WidgetCardProps {
  iconClass: string;
  title: string;
  description: string;
  delay?: number;
}

const WidgetCard: React.FC<WidgetCardProps> = ({
  iconClass,
  title,
  description,
  delay = 0,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
  >
    <Card className="h-full shadow-lg hover:shadow-2xl transition-shadow duration-300 bg-gradient-to-br from-white/50 to-default-50 dark:from-default-100 dark:to-default-200">
      <CardHeader className="pb-0 pt-6 px-6 flex-col items-start">
        <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-secondary shadow-md mb-3">
          <i className={`${iconClass} text-2xl text-white`}></i>
        </div>
        <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {title}
        </h3>
      </CardHeader>
      <CardBody className="px-6 py-4">
        <p className="text-default-600 text-sm leading-relaxed">{description}</p>
      </CardBody>
    </Card>
  </motion.div>
);

interface IntegrationLogoProps {
  name: string;
  link: string;
}

const IntegrationLogo: React.FC<IntegrationLogoProps> = ({ name, link }) => (
  <motion.div
    className="flex flex-col items-center gap-3"
    whileHover={{ y: -8 }}
    transition={{ duration: 0.3 }}
  >
    <Card className="w-32 h-32 p-4 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-default-100/50 to-default-50/50 border border-primary/10 hover:border-primary/30 dark:from-default-100/20 dark:to-default-200/20">
      <CardBody className="p-0 flex items-center justify-center">
        <img
          src={link}
          alt={`${name} logo`}
          className="w-full h-full object-contain opacity-80 hover:opacity-100 transition-opacity"
        />
      </CardBody>
    </Card>
    <span className="text-xs text-default-600 font-semibold uppercase tracking-wide">{name}</span>
  </motion.div>
);

const IntegrationsBar: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="w-full relative py-20 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl opacity-40 pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-40 pointer-events-none" />

      <div className="container mx-auto px-6 md:px-8 lg:px-12 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h3 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent mb-4">
            {t('sites.home.integrations.title')}
          </h3>
          <p className="text-default-600 text-lg max-w-2xl mx-auto">
            {t('sites.home.integrations.subtitle')}
          </p>
        </motion.div>

        <div className="flex justify-center items-center">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, staggerChildren: 0.1 }}
          >
            <IntegrationLogo name={t('sites.home.integrations.googleCalendar')} link="./images/google.png" />
            <IntegrationLogo name={t('sites.home.integrations.spotify')} link="./images/spotify.png" />
            <IntegrationLogo name={t('sites.home.integrations.microsoft')} link="./images/microsoft.png" />
            <IntegrationLogo name={t('sites.home.integrations.smartthings')} link="./images/smartthings.png" />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const { t } = useTranslation();

  const features = [
    t('sites.home.features.dashboards'),
    t('sites.home.features.realtime'),
    t('sites.home.features.multidevice'),
    t('sites.home.features.darkmode'),
  ];

  return (
    <div className="flex flex-col">
      <style>{`
        @keyframes shimmerGradient {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        .shimmer-text {
          background: linear-gradient(
            90deg,
            #964ED8 0%,
            #40BFF8 25%,
            #964ED8 50%,
            #40BFF8 75%,
            #964ED8 100%
          );
          background-size: 200% auto;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmerGradient 8s linear infinite;
        }
        
        .float-animation {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>

      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center bg-gradient-to-br from-background via-default-50 to-default-100 dark:from-background dark:via-default-100 dark:to-default-200 py-12 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />
        <div className="container mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <motion.div
              className="flex-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Chip
                color="secondary"
                variant="flat"
                size="lg"
                className="mb-6"
              >
                {t('sites.home.cta.welcome')}
              </Chip>

              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6 leading-tight shimmer-text">
                {t('sites.home.shortDesc1')}
                <br />
                {t('sites.home.shortDesc2')}
              </h1>

              <h2 className="text-2xl md:text-3xl font-semibold text-default-700 mb-6">
                {t('sites.home.shortDesc3')}
              </h2>

              <p className="text-base md:text-lg text-default-600 max-w-xl leading-relaxed mb-8">
                {t('sites.home.longDesc')}
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                {features.map((feature, index) => (
                  <Chip
                    key={index}
                    startContent={<FiCheck className="text-success" />}
                    variant="flat"
                    color="success"
                    size="lg"
                  >
                    {feature}
                  </Chip>
                ))}
              </div>

              <div className="flex gap-4">
                <Button
                  color="primary"
                  size="lg"
                  variant="shadow"
                  className="font-semibold px-8"
                  startContent={<FiGrid />}
                >
                  {t('sites.home.getStarted')}
                </Button>
                <Button
                  color="default"
                  size="lg"
                  variant="flat"
                  className="font-semibold px-8"
                >
                  {t('sites.home.cta.learnMore')}
                </Button>
              </div>
            </motion.div>

            <motion.div
              className="flex-1 flex justify-center relative"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* Glow Effect Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-3xl blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />

              {/* Display Frame Container - Premium Black */}
              <div className="relative z-10 p-5 rounded-3xl bg-black shadow-2xl float-animation border-2 border-slate-800" style={{
                boxShadow: '0 0 80px rgba(150, 78, 216, 0.4), inset 0 1px 0 rgba(255,255,255,0.05), 0 20px 60px rgba(0,0,0,0.8)',
                maxWidth: '380px',
              }}>
                {/* Display Bezel - Thicker black frame */}
                <div className="relative rounded-2xl overflow-hidden bg-black p-2 shadow-inner border border-slate-900/50">

                  {/* Screen Gloss Effect */}
                  <div className="absolute inset-0 z-30 pointer-events-none rounded-xl bg-gradient-to-b from-white/10 via-transparent to-transparent" />

                  <Card className="relative z-10 rounded-lg overflow-hidden border-0 bg-black shadow-none">
                    <CardBody className="p-0 relative overflow-x-hidden">
                      {/* Shine Effect Overlay */}
                      <div className="absolute inset-0 z-20 pointer-events-none">
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          animate={{
                            x: ['0%', '100%'],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: 'linear',
                          }}
                        />
                      </div>

                      <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-auto"
                        style={{
                          objectFit: 'cover',
                          objectPosition: 'center',
                          width: '100%',
                          height: 'auto',
                          maxWidth: '100%',
                          display: 'block',
                          overflow: 'hidden',
                        }}
                      >
                        <source src="/videos/preview.mp4" type="video/mp4; codecs=avc1" />
                      </video>
                    </CardBody>
                  </Card>
                </div>

                {/* Display Logo on Bezel Bottom */}
                <div className="mx-auto mt-2 w-full flex flex-col items-center gap-1.5">
                  <img src="/images/logo-white.png" alt="ScreenBoard Logo" className="h-3 opacity-60 hover:opacity-80 transition-opacity" />
                  <div className="w-1/2 h-1 bg-gradient-to-b from-slate-700 to-slate-900 rounded-full shadow-lg" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Integrations Section */}
      <IntegrationsBar />

      {/* Widgets Section */}
      <div className="min-h-screen flex items-center bg-background py-20">
        <div className="container mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
              {t('sites.home.widgetsTitle')}
            </h2>
            <p className="text-xl text-default-600 max-w-2xl mx-auto">
              {t('sites.home.cta.widgetsSubtitle')}
            </p>
            <Divider className="my-8 max-w-xs mx-auto opacity-50" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <WidgetCard
              iconClass="fas fa-calendar-alt"
              title={t('sites.home.widgets.event.title')}
              description={t('sites.home.widgets.event.description')}
              delay={0}
            />
            <WidgetCard
              iconClass="fas fa-newspaper"
              title={t('sites.home.widgets.news.title')}
              description={t('sites.home.widgets.news.description')}
              delay={0.1}
            />
            <WidgetCard
              iconClass="fas fa-sun"
              title={t('sites.home.widgets.weather.title')}
              description={t('sites.home.widgets.weather.description')}
              delay={0.2}
            />
            <WidgetCard
              iconClass="fas fa-qrcode"
              title={t('sites.home.widgets.qr.title')}
              description={t('sites.home.widgets.qr.description')}
              delay={0.3}
            />
            <WidgetCard
              iconClass="fas fa-music"
              title={t('sites.home.widgets.music.title')}
              description={t('sites.home.widgets.music.description')}
              delay={0.4}
            />
            <WidgetCard
              iconClass="fas fa-video"
              title={t('sites.home.widgets.video.title')}
              description={t('sites.home.widgets.video.description')}
              delay={0.5}
            />
            <WidgetCard
              iconClass="fas fa-clock"
              title={t('sites.home.widgets.clock.title')}
              description={t('sites.home.widgets.clock.description')}
              delay={0.6}
            />
            <WidgetCard
              iconClass="fas fa-quote-right"
              title={t('sites.home.widgets.quote.title')}
              description={t('sites.home.widgets.quote.description')}
              delay={0.7}
            />
            <WidgetCard
              iconClass="fas fa-sticky-note"
              title={t('sites.home.widgets.note.title')}
              description={t('sites.home.widgets.note.description')}
              delay={0.8}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mt-16"
          >
            <Card className="max-w-2xl mx-auto bg-gradient-to-br from-primary/5 to-secondary/5 shadow-xl">
              <CardBody className="p-12">
                <h3 className="text-2xl font-bold text-default-800 mb-4">
                  {t('sites.home.widgets.liveMessage')}
                </h3>
                <p className="text-default-600 mb-6">
                  {t('sites.home.cta.createDashboard')}
                </p>
                <Button
                  color="secondary"
                  size="lg"
                  variant="shadow"
                  className="font-semibold px-8"
                  startContent={<FiGrid />}
                >
                  {t('sites.home.widgets.getStarted')}
                </Button>
              </CardBody>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
