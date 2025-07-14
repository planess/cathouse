import Footer from "../components/footer/footer";
import Header from "../components/header/header";

export default function GeneralLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-none">
        <Header />
      </div>
      <div className="flex-auto">{children}</div>
      <div className="flex-none">
        <Footer />
      </div>
    </div>
  );
}
