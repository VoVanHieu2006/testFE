import { useEffect, useState } from 'react';
import { fetchStoreSettings } from '../../api/mockApi';

export function useStoreData(defaultStoreData) {
  const [storeData, setStoreData] = useState(defaultStoreData);

  useEffect(() => {
    const loadStoreData = async () => {
      try {
        const settings = await fetchStoreSettings();
        setStoreData({ storeName: settings.storeName, logoUrl: settings.logoUrl });
      } catch {
        setStoreData(defaultStoreData);
      }
    };

    loadStoreData();
  }, [defaultStoreData]);

  return storeData;
}
