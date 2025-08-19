import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export default function Panel({ children }: Props) {
  return <div className="py-3 px-4 bg-zinc-100 text-zinc-900">{children}</div>;
}
