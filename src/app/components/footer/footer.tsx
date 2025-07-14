import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="">
      <div>
        <Link href="location">Location</Link>
      </div>
      <div className="flex justify-end">
        Made with care for our little friends
      </div>
      <div>2024-{year}</div>
    </footer>
  );
}
