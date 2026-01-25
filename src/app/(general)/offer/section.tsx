interface SectionProps {
  title: string;
  children: React.ReactNode;
  id?: string;
}

export default function Section({ children, title, id }: SectionProps) {
  return (
    <section
      id={id}
      className="scroll-mt-28 bg-white dark:bg-[#1c2636] p-8 rounded-2xl border border-[#e7ebf4] dark:border-[#2d3a52]"
    >
      <h2 className="text-2xl font-bold mb-6 text-[#0d121c] dark:text-white">
        {title}
      </h2>
      <div>{children}</div>
    </section>
  );
}
