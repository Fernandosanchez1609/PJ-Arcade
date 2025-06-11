// src/components/profile/ProfilePic.jsx
"use client";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";

export default function ProfilePic({ user }) {
    return (
        <Avatar className="w-32 h-32 text-6xl">
            <AvatarImage src={user?.image || ""} alt={user?.name || "Usuario"} />
            <AvatarFallback>
                {user?.name?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
        </Avatar>

    );
}
