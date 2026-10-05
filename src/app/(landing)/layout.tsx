import { DM_Sans } from 'next/font/google';

import { LandingFooter } from './components/landing-footer';
import { LandingHeader } from './components/landing-header';
import styles from './landing.module.css';

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin', 'latin-ext'],
});

/** Standalone layout for campaign landing pages, independent of the site header and footer. */
export default function LandingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className={`${styles.page} ${dmSans.variable}`}>
      <LandingHeader />
      <main className={styles.main}>{children}</main>
      <LandingFooter />
    </div>
  );
}
