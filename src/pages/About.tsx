import { useLanguage } from '../i18n/LanguageContext';

export function About() {
  const { t } = useLanguage();

  return (
    <main className="about-page">
      <div className="about-page__inner">
        <header className="about-page__header">
          <h1 className="about-page__title">{t.about.title}</h1>
          <p className="about-page__subtitle">{t.about.subtitle}</p>
        </header>

        <section className="about-page__section">
          <h2 className="about-page__section-title">{t.about.missionTitle}</h2>
          <p className="about-page__text">{t.about.missionText}</p>
        </section>

        <section className="about-page__section">
          <h2 className="about-page__section-title">{t.about.howItWorksTitle}</h2>
          <p className="about-page__text">{t.about.howItWorksText}</p>
        </section>
      </div>
    </main>
  );
}
