export default function GuestLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div>guest wrapper{children}</div>
  );
}
