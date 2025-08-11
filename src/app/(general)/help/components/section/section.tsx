import { ReactNode } from 'react';

interface Prop {
  title?: string;
  text?: string;
  children?: ReactNode;
}

export default function Section({ title, text, children }: Prop) {
  return (
    <div className="rounded-3xl bg-stone-50 py-6 px-7 text-zinc-800 border border-stone-300">
      {Boolean(title) && <h2 className="text-2xl font-bold my-3">{title}</h2>}
      <div className="py-4">{text ?? children}</div>
    </div>
  );
}
