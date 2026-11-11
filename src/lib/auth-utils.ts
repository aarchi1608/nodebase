import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";

export const requireAuth = async () => {
    const reqHeaders = await headers();
    const session = await auth.api.getSession({
        headers: reqHeaders,
    });
    if (!session) {
        console.warn("[requireAuth] No active session found. Has cookie:", reqHeaders.has("cookie"));
        redirect ("/login");
    }
    return session;
}
export const requireUnauth = async () => {
    const reqHeaders = await headers();
    const session = await auth.api.getSession({
        headers: reqHeaders,
    });
    if (session) {
        redirect ("/");
    }
    return session;
}