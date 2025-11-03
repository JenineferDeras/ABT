import { Hero } from "@/components/hero";
import { ConnectSupabaseSteps } from "@/components/tutorial/connect-supabase-steps";
import { SignUpUserSteps } from "@/components/tutorial/sign-up-user-steps";

const hasSupabaseConfiguration = Boolean(
<<<<<<< HEAD
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
=======
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY,
>>>>>>> 420d661fb588b567d48bc8c8f6ee52b18239beb5
);

export default function Index() {
    return (
        <>
            <Hero />
            <main className="flex-1 px-4">
                <h2 className="mb-4 text-xl font-medium">Next steps</h2>
                {hasSupabaseConfiguration ? <SignUpUserSteps /> : <ConnectSupabaseSteps />}
            </main>
        </>
    );
}
