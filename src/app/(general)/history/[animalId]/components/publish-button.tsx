'use client';

import { ObjectId } from 'mongodb';
import { useCallback } from 'react';
import { Button } from '@app/components/button';
import { publishAnimal } from '../server/publish';
import { useRouter } from 'next/navigation';

interface PublishButtonProps {
  animalId: ObjectId;
}

export default function PublishButton({ animalId }: PublishButtonProps) {
    const router = useRouter();

  const handlePublish = useCallback(async () => {
    // Call the publishAnimal function from the server
    try {
      const {success} = await publishAnimal(animalId);

      if (!success) {
        throw new Error('Publish failed');
      }

      console.log('Animal published successfully', success);
      // reload the page
      router.refresh();
    } catch {
      console.error('Failed to publish animal');
    }
  }, [animalId, router]);
  return (
    <>
      <span>Draft animal</span>
      <Button onClick={handlePublish}>Publish</Button>
    </>
  );
}
