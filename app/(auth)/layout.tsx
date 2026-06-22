import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Brand } from "@/components/brand";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Reverse-protect: signed-in users can't reach sign-in/sign-up until they log out.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Editorial side panel with blurred library image */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-border p-10 text-[#f3ece0] lg:flex">
        <div className="absolute inset-0 -z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/auth-bg.jpg"
            alt=""
            aria-hidden
            className="h-full w-full scale-105 object-cover blur-[2px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#140f0a] via-[#140f0a]/75 to-[#140f0a]/55" />
        </div>

        <Brand className="text-[#f7f0e6]" />

        <blockquote className="relative max-w-md">
          <p className="font-serif text-3xl leading-snug text-[#f7f0e6]">
            &ldquo;A room without books is like a body without a soul.&rdquo;
          </p>
          <footer className="mt-4 text-sm text-[#d8c7ac]">&mdash; Cicero</footer>
        </blockquote>

        <p className="text-sm text-[#d8c7ac]">
          Read freely. Write boldly. Share widely.
        </p>
      </div>

      {/* Form side */}
      <div className="flex flex-col">
        <div className="p-6 lg:hidden">
          <Brand />
        </div>
        <div className="flex flex-1 items-center justify-center px-6 pb-16">
          {children}
        </div>
      </div>
    </div>
  );
}
