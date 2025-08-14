'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, MouseEvent } from 'react';

import logo from '@public/assets/logo.svg';

export default function Logo() {
  const router = useRouter();

  const nav = useCallback(
    (event: MouseEvent) => {
      if (event.ctrlKey) {
        router.push('/signin');
      }
    },
    [router],
  );

  return (
    <span onClick={nav} aria-hidden>
      <Image src={logo as string} alt="logo" width="120" />
    </span>
  );
}
