'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useRef } from 'react';

import logo from '@public/assets/logo3_small.svg';

const CLICK_WINDOW_MS = 1500;
const CLICK_TARGET_COUNT = 5;

export default function LogoSmall() {
  const router = useRouter();
  const clickTimesRef = useRef<number[]>([]);

  const handlePointerDown = useCallback(() => {
    const now = Date.now();

    clickTimesRef.current = clickTimesRef.current
      .filter((timestamp) => now - timestamp <= CLICK_WINDOW_MS)
      .concat(now);

    if (clickTimesRef.current.length >= CLICK_TARGET_COUNT) {
      clickTimesRef.current = [];
      router.push('/signin');
    }
  }, [router]);

  return (
    <button
      type="button"
      aria-label="Швидко тапніть 5 разів, щоб перейти до входу"
      className="inline-flex items-center bg-transparent border-0 p-0 cursor-pointer"
      onPointerDown={handlePointerDown}
    >
      <Image src={logo as string} alt="Logo Small" width={50} />
    </button>
  );
}
