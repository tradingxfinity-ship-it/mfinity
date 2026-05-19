import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[#070710] flex items-center justify-center px-4 overflow-hidden">
      {/* Animated gradient background */}
      <div className="pointer-events-none absolute inset-0 -z-0">
        {/* Drifting aurora orbs */}
        <div
          className="aurora-orb aurora-orb-1 w-[42vw] h-[42vw] max-w-[560px] max-h-[560px] -top-[10%] -left-[8%]"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.45), transparent 70%)" }}
        />
        <div
          className="aurora-orb aurora-orb-2 w-[46vw] h-[46vw] max-w-[620px] max-h-[620px] top-[20%] -right-[12%]"
          style={{ background: "radial-gradient(circle, rgba(168,85,247,0.40), transparent 70%)" }}
        />
        <div
          className="aurora-orb aurora-orb-3 w-[38vw] h-[38vw] max-w-[500px] max-h-[500px] -bottom-[12%] left-[18%]"
          style={{ background: "radial-gradient(circle, rgba(236,72,153,0.32), transparent 70%)" }}
        />

        {/* Subtle moving grid */}
        <div className="auth-grid absolute inset-0 opacity-60" />

        {/* Vignette to keep the card readable */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#070710]/40 via-transparent to-[#070710]/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center group">
            <Image
              src="/logo.png"
              alt="Mfinity Trading Bot"
              width={220}
              height={64}
              className="h-12 w-auto object-contain group-hover:opacity-90 transition-opacity"
              priority
            />
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
