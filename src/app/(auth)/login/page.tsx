import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/login-form";
import { requireUnauth } from "@/lib/auth-utils";

const Page = async() => {
    await requireUnauth();
    return (
        <Suspense fallback={null}>
            <LoginForm />
        </Suspense>
    );
};
export default Page;