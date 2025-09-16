'use client';

import Image from 'next/image';

interface UserBadgeProps {
    avatarUrl?: string;
    name?: string | null;
    id?: string;
    login?: string;
}

export default function UserBadge({ avatarUrl, name, id, login }: UserBadgeProps) {
    if (!avatarUrl || !name || !id || !login) {
        return null;
    }
    return (
        <div className="flex items-center gap-3 p-3">
            <Image
                src={avatarUrl}
                alt={`${login} avatar`}
                width={36}
                height={36}
                className="rounded-full border"
            />
            <div className="flex flex-col leading-tight">
                <div className="text-sm font-medium">{name || login}</div>
                <div className="text-xs text-gray-500">{id}</div>
            </div>
        </div>
    );
}


