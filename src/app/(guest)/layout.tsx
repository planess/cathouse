import Header from '../components/header/header';

export default function GuestLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div>
      <Header />
      <main>{children}</main>
    </div>
  );
}
