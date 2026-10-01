'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_HOME_SECTIONS, getHomeSections, SITEDATA_KEYS } from '@/lib/sitedata';

/**
 * useHomeSections — ordem das seções da home (reativo a edições do admin).
 */
export function useHomeSections() {
  const [sections, setSections] = useState(DEFAULT_HOME_SECTIONS);

  useEffect(() => {
    setSections(getHomeSections());

    const resync = () => setSections(getHomeSections());
    const onStorage = (e) => {
      if (e.key === SITEDATA_KEYS.homeSections) resync();
    };
    const onChanged = (e) => {
      if (!e.detail?.key || e.detail.key === SITEDATA_KEYS.homeSections) resync();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('sitedata:changed', onChanged);
    window.addEventListener('sitedata:bootstrap', resync);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('sitedata:changed', onChanged);
      window.removeEventListener('sitedata:bootstrap', resync);
    };
  }, []);

  return sections;
}
