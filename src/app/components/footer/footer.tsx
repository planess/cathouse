import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="">
      <div>
        <Link href="location">Location</Link>
      </div>

      <div className="bg-neutral-800 text-neutral-100 text-sm px-20 py-3 flex justify-end gap-2">
        <span>Since 2021 with care for our little friends</span>
        <span>by Planess Group</span>
      </div>
    </footer>
  );
}
