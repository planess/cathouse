import Form from './components/form';

export default function Page() {
  return (
    <div>
      <h1 className="text-4xl">New pet</h1>

      <div>
        <div className="w-120 mx-auto">
          <Form />
        </div>
      </div>
    </div>
  );
}
