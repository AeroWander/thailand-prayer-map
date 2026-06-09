import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';

type GuideSectionProps = {
  title: string;
  items: string[];
};

function GuideSection({ title, items }: GuideSectionProps) {
  return (
    <section className="prayer-guide__section">
      <h2 className="prayer-guide__section-title">{title}</h2>
      <ul className="prayer-guide__list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export function PrayerGuide() {
  const { t } = useLanguage();
  const guide = t.prayerGuide;

  return (
    <main className="prayer-guide">
      <div className="prayer-guide__inner">
        <header className="prayer-guide__header">
          <h1 className="prayer-guide__title">{guide.title}</h1>
          <p className="prayer-guide__subtitle">{guide.subtitle}</p>
        </header>

        <GuideSection title={guide.beforeYouGo.title} items={guide.beforeYouGo.items} />
        <GuideSection title={guide.whenYouArrive.title} items={guide.whenYouArrive.items} />
        <GuideSection title={guide.prayerPoints.title} items={guide.prayerPoints.items} />
        <GuideSection title={guide.afterYourWalk.title} items={guide.afterYourWalk.items} />

        <section className="prayer-guide__section">
          <h2 className="prayer-guide__section-title">{guide.keyScriptures.title}</h2>
          <ul className="prayer-guide__scriptures">
            {guide.keyScriptures.items.map((scripture) => (
              <li key={scripture.reference} className="prayer-guide__scripture">
                <strong>{scripture.reference}</strong>
                <span>{scripture.text}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="prayer-guide__cta">
          <Link to="/map" className="btn btn--accent prayer-guide__cta-btn">
            {guide.logPrayerWalk}
          </Link>
        </div>
      </div>
    </main>
  );
}
