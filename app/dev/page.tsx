import { auth } from '@/auth';
import { CopyBtn } from '@/components/copy-btn';

export default async function ChatPage() {
  const session = await auth();
  return (
    <div className="p-10 pl-16 gap-10 flex flex-col">
      <div className="flex-col flex gap-3">
        <h1 className="font-bold text-xl">Access token</h1>
        <div className="bg-black text-white p-6 rounded-md flex items-center gap-5">
          <p className="break-all w-11/12">Bearer {session?.access_token}</p>
          <CopyBtn text2copy={`Bearer ${session?.access_token}`} />
        </div>
      </div>
      <div className="flex-col flex gap-3">
        <h1 className="font-bold text-xl">Refresh token</h1>
        <div className="bg-black text-white p-6 rounded-md flex items-center gap-5">
          <p className="break-all w-11/12">Bearer {session?.refresh_token}</p>
          <CopyBtn text2copy={`Bearer ${session?.refresh_token}`} />
        </div>
      </div>
      <div className="flex-col flex gap-3">
        <h1 className="font-bold text-xl">Expired date</h1>
        <div className="bg-black text-white p-6 rounded-md flex items-center gap-5">
          <p className="break-all w-11/12">{session?.access_token_expired}</p>
          <CopyBtn text2copy={session?.access_token_expired?.toString()} />
        </div>
      </div>
    </div>
  );
}
