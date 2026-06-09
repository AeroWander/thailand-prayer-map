import { useLanguage } from '../i18n/LanguageContext';
import type { Language } from '../i18n/translations';

const OPTIONS: { value: Language; label: string }[] = [
  { value: 'en', label: 'EN' },
  { value: 'th', label: 'ไทย' },
];

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="language-toggle" role="group" aria-label="Language">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`language-toggle__btn${
            language === option.value ? ' language-toggle__btn--active' : ''
          }`}
          aria-pressed={language === option.value}
          onClick={() => setLanguage(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
