'use client';

import { Button } from '@/components/ui/button';
import { Copy, CopyCheck } from 'lucide-react';
import { useState } from 'react';

export const CopyBtn = ({ text2copy }: { text2copy: string | undefined }) => {
  const [isCopied, setIsCopied] = useState(false);
  if (text2copy) {
    return (
      <Button
        onClick={() => {
          navigator.clipboard.writeText(text2copy);
          setIsCopied(true);
        }}
        variant={'secondary'}
      >
        {isCopied ? (
          <div className="flex gap-2">
            <CopyCheck />
            <p>Copied!</p>
          </div>
        ) : (
          <div className="flex gap-2">
            <Copy />
            <p>Copy</p>
          </div>
        )}
      </Button>
    );
  }
};
