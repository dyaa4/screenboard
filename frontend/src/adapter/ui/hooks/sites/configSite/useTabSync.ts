import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const useTabSync = (tabs: string[], defaultTab: string) => {
  const [selected, setSelected] = useState(defaultTab);
  const navigate = useNavigate();
  const location = useLocation();

  const updateSelectedTab = useCallback(
    (newTab: string) => {
      if (newTab !== selected && tabs.includes(newTab)) {
        setSelected(newTab);
        navigate(`#${newTab}`, { replace: true });
      }
    },
    [selected, navigate, tabs],
  );

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (tabs.includes(hash) && hash !== selected) {
      setSelected(hash);
    }
  }, [location, selected, tabs]);

  const handleSelectionChange = (key: string | number) => {
    updateSelectedTab(String(key));
  };

  return { selected, handleSelectionChange };
};

export default useTabSync;
