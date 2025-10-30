import React, { useEffect, useState } from 'react';
import { Image } from '@heroui/react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const AboutUs: React.FC = () => {
  const { t } = useTranslation();
  const [windowHeight, setWindowHeight] = useState(0);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, windowHeight], [0, 300]);

  useEffect(() => {
    setWindowHeight(window.innerHeight);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <motion.div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/images/aboutme-bg.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          y,
        }}
      />
      <div className="relative z-10 min-h-screen flex items-center bg-linear-to-br from-tertiary-300/80 to-secondary-300/80 dark:from-tertiary-900/80 dark:to-secondary-900/80 py-12">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-center justify-between gap-12">
            <motion.div
              className="w-full"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="flex flex-col sm:flex-row items-center mb-8">
                <motion.div
                  className="mb-4 sm:mb-0 sm:mr-8"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Image
                    src="/images/aboutme.jpg"
                    alt={t('sites.aboutus.imageAlt')}
                    width={200}
                    height={200}
                    className="rounded-full shadow-xl border-primary-500 border-4 object-cover"
                  />
                </motion.div>
                <div className="text-center sm:text-left">
                  <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-primary-600 mb-2">
                    {t('sites.aboutus.name')}
                  </h1>
                  <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-secondary-600 leading-tight">
                    {t('sites.aboutus.profession')}
                  </h2>
                </div>
              </div>
              <motion.p
                className="text-base md:text-lg dark:text-primary-50 text-primary-900 max-w-xl leading-relaxed mb-8 mx-auto sm:mx-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                {t('sites.aboutus.bio.part1')}
              </motion.p>
              <motion.p
                className="text-base md:text-lg dark:text-primary-50 text-primary-900 max-w-xl leading-relaxed mb-8 mx-auto sm:mx-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                {t('sites.aboutus.bio.part2')}
              </motion.p>
              <motion.p
                className="text-base md:text-lg dark:text-primary-50 text-primary-900 max-w-xl leading-relaxed mb-8 mx-auto sm:mx-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.9 }}
              >
                {t('sites.aboutus.bio.part3')}
              </motion.p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
