import SignInPage from '@/components/sign-in-page';

export default function Home() {
  // In a real app, you would check for authentication here
  // For demo purposes, we'll just redirect to the chat page
  // return redirect("/chat")

  return <SignInPage />;
}
