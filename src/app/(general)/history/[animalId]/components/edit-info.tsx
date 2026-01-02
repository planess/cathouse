'use client';

import { useCallback } from 'react';

import { EditButton } from './edit-button';

export default function EditInfo() {
  const editHandler = useCallback(() => {
    // Handle general information edit action
  }, []);

  return <EditButton label="Edit general information" onClick={editHandler} />;
}
