import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const useTabSync = (tabs: string[], defaultTab: string) => {
  const [selected, setSelected] = useState(defaultTab);
  const navigate = useNavigate();
  const location = useLocation();
  const storageKey = 'config_selected_tab';

  const updateSelectedTab = useCallback(
    (newTab: string) => {
      if (newTab !== selected && tabs.includes(newTab)) {
        setSelected(newTab);
        localStorage.setItem(storageKey, newTab);
        navigate(`#${newTab}`, { replace: true });
      }
    },
    [selected, navigate, tabs],
  );

  useEffect(() => {
    // Priorität: 1. URL Hash, 2. localStorage, 3. defaultTab
    const hash = location.hash.replace('#', '');

    if (tabs.includes(hash)) {
      setSelected(hash);
      localStorage.setItem(storageKey, hash);
    } else {
      // Fallback zu localStorage wenn kein Hash
      const savedTab = localStorage.getItem(storageKey);
      if (savedTab && tabs.includes(savedTab)) {
        setSelected(savedTab);
        navigate(`#${savedTab}`, { replace: true });
      }
    }
  }, [location.hash, tabs, navigate]);

  const handleSelectionChange = (key: string | number) => {
    updateSelectedTab(String(key));
  };

  return { selected, handleSelectionChange };
};

export default useTabSync;
