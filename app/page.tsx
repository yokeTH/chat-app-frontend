import { auth } from '@/auth';
import SignInPage from '@/components/sign-in-page';
import { redirect } from 'next/navigation';

export default async function Home() {
  // In a real app, you would check for authentication here
  // For demo purposes, we'll just redirect to the chat page
  // return redirect("/chat")
  const session = await auth();
  if (session) {
    redirect('/chat');
  }
  return <SignInPage />;
}
