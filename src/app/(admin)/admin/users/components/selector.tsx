'use client';

interface SelectorProps {
  list: Map<string, string>;
  attach: (roleId: string) => Promise<void>;
}

export default function Selector({ list, attach }: SelectorProps) {
    console.log('--- Selector render', attach);
  return (
    <select onChange={(e) => attach(e.target.value)} className="border border-gray-300 rounded p-1">
      <option value="">Select new role</option>
      {[...list.entries()].map(([k, v]) => (
        <option key={k.toString()} value={k.toString()}>{v}</option>
      ))}
    </select>
  );
}
