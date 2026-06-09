import { useLanguage } from '../i18n/LanguageContext';

export function CampusKey() {
  const { t } = useLanguage();

  return (
    <div className="campus-key">
      <h3 className="campus-key__title">{t.explore.campusKeyTitle}</h3>
      <ul className="campus-key__list">
        <li className="campus-key__item">
          <span className="campus-key__dot campus-key__dot--pending" aria-hidden="true" />
          {t.explore.campusKeyNotPrayed}
        </li>
        <li className="campus-key__item">
          <span className="campus-key__dot campus-key__dot--prayed" aria-hidden="true" />
          {t.explore.campusKeyPrayed}
        </li>
      </ul>
    </div>
  );
}
