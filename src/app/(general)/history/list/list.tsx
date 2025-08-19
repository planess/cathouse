import Card from '../card/card';

interface A {
  name: string;
  image: string;
}

interface Props {
  list: A[];
}

export default function List({ list }: Props) {
  return list.map(({ name, image }) => (
    <div key={name}>
      <Card src={image} name={name} />
    </div>
  ));
}
