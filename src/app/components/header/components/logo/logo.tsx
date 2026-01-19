'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, MouseEvent, useRef } from 'react';

import logodark from '@public/assets/logo3-dark.svg';
import logo from '@public/assets/logo3.svg';

import { CLICK_TARGET_COUNT, CLICK_WINDOW_MS } from './logo.const';

export default function Logo() {
  const router = useRouter();
  const clickTimesRef = useRef<number[]>([]);

  const nav = useCallback(
    (event: MouseEvent) => {
      if (event.ctrlKey) {
        return router.push('/signin');
      }

      const now = Date.now();

      clickTimesRef.current = clickTimesRef.current
        .filter((timestamp) => now - timestamp <= CLICK_WINDOW_MS)
        .concat(now);

      if (clickTimesRef.current.length >= CLICK_TARGET_COUNT) {
        clickTimesRef.current = [];
        router.push('/signin');
      }
    },
    [router],
  );

  return (
    <span onClick={nav} aria-hidden>
      <span className="dark:hidden">
        <Image src={logo as string} alt="logo" width="120" height={undefined} />
      </span>
      <span className="hidden dark:inline">
        <Image
          src={logodark as string}
          alt="logo"
          width="120"
          height={undefined}
        />
      </span>
    </span>
  );
}
