import { Link, NavLink } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { LanguageToggle } from './LanguageToggle';

export function Header() {
  const { t } = useLanguage();

  const navItems = [
    { label: t.nav.map, to: '/map' },
    { label: t.nav.pray, to: '/pray' },
    { label: t.nav.about, to: '/about' },
  ] as const;

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="site-header__brand" to="/">
          <img
            className="site-header__logo-image"
            src="/Thailand_NewShield_Name_solid_navy.png"
            alt="Thailand Campus Crusade for Christ"
          />
        </Link>

        <div className="site-header__actions">
          <nav className="site-header__nav" aria-label="Main navigation">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `site-header__nav-link${isActive ? ' site-header__nav-link--active' : ''}`
                }
                end={item.to === '/map'}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}
