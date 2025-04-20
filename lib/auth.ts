'use server';

import { auth as authlib } from '@/auth';

export const auth = async () => {
  return await authlib();
};
