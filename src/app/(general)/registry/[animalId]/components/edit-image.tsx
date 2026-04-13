'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useRef, useState, type ChangeEvent } from 'react';

import { EditButton } from './edit-button';

type EditImageProps = {
  animalId: string;
};

const MAX_SIZE = 5.5 * 1024 * 1024; // 5.5 MB

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

      if (file.size > MAX_SIZE) {
        // You might want to use a toast or a more UI-integrated error display here
        // For now, alerting the user is a direct feedback mechanism
        window.alert(
          'The selected image is too large. Please select an image under 5.5MB.',
        );
        event.target.value = ''; // Reset input
        return;
      }

      setIsProcessing(true);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`/api/registry/${animalId}/image`, {
          method: 'PUT',
          body: formData,
        });

        const result = (await response.json()) as {
          success: boolean;
          name?: string;
          size?: number;
          errorCode?: string;
          message?: string;
        };

        if (result.success) {
          router.refresh();
        } else {
          window.alert(result.message ?? 'Failed to replace image');
        }
      } catch {
        window.alert('Failed to replace image. Please try again.');
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
        onChange={(event) => {
          void handleFileChange(event);
        }}
      />
    </div>
  );
}
