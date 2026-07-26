import React, { useCallback, useState } from 'react';
import { MdWbSunny, MdNightsStay } from 'react-icons/md';
import { useTheme } from '../../context/ThemeProvider';
import GlobalSearch from './navbar/GlobalSearch';
import DateRangePicker from './navbar/DateRangePicker';
import ProfileDropdown from './navbar/ProfileDropdown';

const Navbar = () => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isLight = resolvedTheme === 'light';
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  }, []);

  return (
    <>
      <header className="admin-navbar h-16 border-b border-border flex items-center justify-between px-6 sticky top-0 z-40 bg-background/80 backdrop-blur-xl">
        <GlobalSearch />

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95 focus:outline-none focus:ring-1 focus:ring-primary transition-all flex items-center justify-center"
          >
            {isLight ? <MdNightsStay size={18} /> : <MdWbSunny size={18} />}
          </button>

          <DateRangePicker />

          <div className="w-px h-8 bg-border" />

          <ProfileDropdown onToast={showToast} />
        </div>
      </header>

      {toast && (
        <div
          role="status"
          className="fixed top-20 right-6 z-[100] px-4 py-2.5 rounded-xl text-xs font-medium text-foreground border border-border shadow-lg bg-card/90 backdrop-blur-lg animate-fade-in"
        >
          {toast}
        </div>
      )}
    </>
  );
};

export default Navbar;
