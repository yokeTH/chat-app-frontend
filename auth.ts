import NextAuth, { Profile, User, Session } from 'next-auth';
import 'next-auth/jwt';
import Google from 'next-auth/providers/google';

async function refreshToken(refresh_token: string) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: process.env.AUTH_GOOGLE_ID || '',
      client_secret: process.env.AUTH_GOOGLE_SECRET || '',
      refresh_token: refresh_token,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }

  const data = await response.json();

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token || refresh_token,
    access_token_expired: Date.now() + data.expires_in * 1000,
  };
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
    };
    access_token?: string;
    refresh_token?: string;
    access_token_expired?: number;
  }
  interface User {
    access_token: string;
    refresh_token: string;
    access_token_expired?: number;
  }
  interface Profile {
    access_token: string;
    refresh_token: string;
    access_token_expired?: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    access_token?: string;
    refresh_token?: string;
    access_token_expired?: number;
    user: User;
    profile: Profile;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      authorization: {
        params: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],
  pages: {
    signIn: '/',
  },
  callbacks: {
    signIn: async ({ user, account, credentials }) => {
      if (account?.providerAccountId) {
        const resp = await fetch(`${process.env.BACKEND_URL}/auth/google`, {
          headers: {
            Authorization: `Bearer ${account.access_token}`,
          },
          method: 'POST',
        });
        const data = await resp.json();
        console.log('SignIn', data);
        user.id = data.ID;
        user.access_token = account.access_token || '';
        user.refresh_token = account.refresh_token || '';
        return true;
      }
      return false;
    },
    jwt: async ({ token, user, profile }) => {
      if (user) {
        console.log(user);
        token.user = user;
        token.access_token = user.access_token;
        token.refresh_token = user.refresh_token;
        token.access_token_expired = user.access_token_expired;
      }

      if (profile) {
        console.log(profile);
        token.profile = profile;
        token.access_token_expired = Number(profile.exp) * 1000 || 0;
      }

      // refresh before token is expire 5 min
      if (
        token.access_token_expired &&
        token.access_token_expired - 5 * 60 < Date.now()
      ) {
        try {
          console.log('try to refresh token');
          const refreshed = await refreshToken(token.refresh_token || '');
          token.access_token = refreshed.access_token;
          token.refresh_token = refreshed.refresh_token;
          token.access_token_expired = refreshed.access_token_expired;
        } catch {
          token.error = 'REFRESH_TOKEN_ERROR';
        }
      }

      return token;
    },
    session: async ({ session, token }) => {
      if (token.error) return {} as Session;

      session.access_token = token.access_token;
      session.refresh_token = token.refresh_token;
      session.access_token_expired = token.access_token_expired;
      session.user.id = token.user.id || '';

      return session;
    },
  },
});
