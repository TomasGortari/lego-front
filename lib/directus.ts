import { Directus } from '@directus/sdk';

import { API_URL } from '../config/config';
import { IMyCollections } from '../hooks/useDirectus';

const directus = new Directus<IMyCollections>(API_URL);

export default directus;
