import Image from 'next/image';

interface Props {
  src: string;
  name: string;
}

export default function Card({ src, name }: Props) {
  return (
    <div className="flex">
      <div>
        <Image src={src} alt={name + ' image'} />
      </div>
      <div>
        <div>{name}</div>
      </div>
    </div>
  );
}
