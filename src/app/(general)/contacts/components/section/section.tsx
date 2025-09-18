import { ReactNode } from 'react';

interface Props {
  title: string;
  children: ReactNode;
}

export default function Section({ title, children }: Props) {
  return (
    <div className="bg-white rounded-md p-6 shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-zinc-900">{title}</h2>
      <div>{children}</div>
    </div>
  );
}
