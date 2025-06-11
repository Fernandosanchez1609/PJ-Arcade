// src/app/profile/page.js
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import ProfileTabs from "@/components/profile/ProfileTabs";

export default function ProfilePage() {
    const { token, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!token) {
            router.push("/");
        }
    }, [token, user]);

    if (!user) return null;

    return <ProfileTabs user={user} />;
}
