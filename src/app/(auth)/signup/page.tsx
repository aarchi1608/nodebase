import { Suspense } from "react";
import { RegisterForm } from "@/features/auth/components/registration-form";
const Page = () => {
    return (
        <div>
            <Suspense fallback={null}>
                <RegisterForm />
            </Suspense>
        </div>
    );
}
export default Page;