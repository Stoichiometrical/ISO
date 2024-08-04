import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="h-screen flex items-center justify-center  text-white p-4">
      <SignIn forceRedirectUrl="/dashboard" />
    </div>
  );
}
