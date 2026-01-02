'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useRef, useState, type ChangeEvent } from 'react';

import { replaceImage } from '../server/replace-image';

import { EditButton } from './edit-button';

type EditImageProps = {
  animalId: string;
};

export default function EditImage({ animalId }: EditImageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const editHandler = useCallback(() => {
    if (isProcessing) {
      return;
    }

    fileInputRef.current?.click();
  }, [isProcessing]);

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (!file) {
        return;
      }

      setIsProcessing(true);

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('animalId', animalId);

        const result = await replaceImage(formData);

        if (result?.success) {
          console.log(
            `Selected image size: ${result.size} bytes (~${Math.round(result.size / 1024)} KB)`,
          );
          router.refresh();
        } else if (result) {
          console.error(
            `Failed to replace image: ${result.errorCode} – ${result.message}`,
          );
        }
      } catch (error) {
        console.error('Failed to replace image', error);
      } finally {
        setIsProcessing(false);
        event.target.value = '';
      }
    },
    [animalId, router],
  );

  return (
    <div className="flex flex-col items-end gap-1">
      <EditButton
        label={isProcessing ? 'Uploading image…' : 'Set new image'}
        onClick={editHandler}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="sr-only"
        onChange={handleFileChange}
      />
    </div>
  );
}
