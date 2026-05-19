import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
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
