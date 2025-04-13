import NextAuth, { Profile, User, Session } from 'next-auth';
import 'next-auth/jwt';
import Google from 'next-auth/providers/google';

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
        user.id = account.providerAccountId;
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
        token.access_token_expired = Number(profile.exp) || 0;
      }

      // refresh before token is expire 5 min
      if (
        token.access_token_expired &&
        (token.access_token_expired - 5 * 60) * 1000 < Date.now()
      ) {
        // try {
        //   const refreshed = await refreshToken(token.refresh_token || '');
        //   token.access_token = refreshed.access_token;
        //   token.refresh_token = refreshed.refresh_token;
        //   token.access_token_expired = refreshed.access_token_expired;
        //   token.user.access_token = refreshed.access_token;
        //   token.user.refresh_token = refreshed.refresh_token;
        //   token.user.access_token_expired = refreshed.access_token_expired;
        // } catch {
        //   token.error = 'REFRESH_TOKEN_ERROR';
        // }
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
