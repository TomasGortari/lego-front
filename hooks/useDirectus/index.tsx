import { Directus } from '@directus/sdk';
import { ITag } from '../../@types/tag';
import { IAnnouncement } from '../../@types/announcement';
import { API_URL } from '../../config/config';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
type BlogSettings = {
  display_promotions: boolean;
};

export type IMyCollections = {
  announcement: IAnnouncement;
  settings: BlogSettings;
  tag: ITag;
};

const useDirectus = () => {
  const [directus, setDirectus] = useState<Directus<IMyCollections>>();
  useEffect(() => {
    setDirectus(new Directus<IMyCollections>(API_URL));
  }, []);
  return directus;
};

export default useDirectus;

// export const DirectusContext = createContext<
//   Directus<IMyCollections> | undefined
// >(undefined);

// export const DirectusProvider = ({ children }: { children: any }) => {
//   return (
//     <DirectusContext.Provider value={directus}>
//       {children}
//     </DirectusContext.Provider>
//   );
// };

// export const useDirectus = () => useContext(DirectusContext);
