import Link from "next/link";
import styles from './header.module.scss';

export default function Header() {
  return (
    <div className="flex">
      <div className={styles.test}>Logo</div>

      <div>
        <nav>
          <ul className="flex">
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="#">About</Link>
            </li>
            <li>
              <Link href="/contacts">Contact</Link>
            </li>
            <li>
              <Link href="/history">History</Link>
            </li>
            <li>
              <Link href="/help">Help</Link>
            </li>
          </ul>
        </nav>
      </div>

      <div>
        <Link href="/profile">Profile</Link>
      </div>
    </div>
  );
}
