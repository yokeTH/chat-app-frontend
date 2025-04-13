'use client';

import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export default function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const pickerRef = useRef<HTMLDivElement>(null);

  // Common emojis
  const emojis = [
    '😊',
    '😂',
    '👍',
    '❤️',
    '🎉',
    '🔥',
    '👏',
    '🙏',
    '😍',
    '🤔',
    '😢',
    '😎',
    '🤣',
    '😁',
    '👌',
    '🥰',
    '😇',
    '😉',
    '🤩',
    '😋',
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <Card ref={pickerRef} className="p-2 shadow-lg w-64">
      <div className="grid grid-cols-5 gap-2">
        {emojis.map((emoji) => (
          <button
            key={emoji}
            className="h-8 w-8 flex items-center justify-center text-lg hover:bg-accent rounded-md"
            onClick={() => onSelect(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>
    </Card>
  );
}
