import { AuthGate } from "@/components/AuthGate";

/** Everything under here (/devices, /remote, /files) needs a signed-in user. */
export default function SignedInLayout({ children }: LayoutProps<"/">) {
  return <AuthGate>{children}</AuthGate>;
}
