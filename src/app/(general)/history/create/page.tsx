import Form from './components/form';

export default function Page() {
  return (
    <div className="px-3 lg:px-20 py-5 transition-[padding]">
      <h1 className="text-2xl text-center py-3">New pet</h1>

      <div>
        <div className="lg:w-120 mx-auto transition-[width]">
          <Form />
        </div>
      </div>
    </div>
  );
}
