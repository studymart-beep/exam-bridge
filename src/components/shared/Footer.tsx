import Logo from "@/components/brand/Logo";

/**
 * Exam Bridge footer — intentionally minimal, styled after the reference:
 * deep-green curved "hill" band with a gold hairline.
 *
 * Content is only: the raw circular logo, the tagline, and the name.
 * No links, no columns, no copyright.
 */
export default function Footer() {
  return (
    <footer className="footer-curve">
      <div className="max-w-6xl mx-auto px-4 pt-12 pb-9 flex flex-col items-center gap-2 text-center">
        <Logo size={44} />
        <p className="text-[12px] text-[#A7F3D0] tracking-[0.08em]">
          Learn • Prepare • Succeed
        </p>
        <p className="font-heading font-extrabold text-[17px] text-white">
          Exam Bridge
        </p>
      </div>
    </footer>
  );
}
