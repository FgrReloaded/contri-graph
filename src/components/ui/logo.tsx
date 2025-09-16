"use client";

import React from "react";

type LogoProps = {
    size?: number;
    className?: string;
};

export function Logo({ size = 28, className }: LogoProps) {
    const stroke = "currentColor";
    const dot = "currentColor";
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-label="ContriGraph logo"
            role="img"
        >
            <title>ContriGraph</title>
            {/* Clean 3x3 dot grid with subtle weighting to suggest contributions */}
            <g>
                <circle cx="4" cy="4" r="1.5" fill={dot} opacity="0.35" />
                <circle cx="12" cy="4" r="1.5" fill={dot} opacity="0.55" />
                <circle cx="20" cy="4" r="1.5" fill={dot} opacity="0.35" />

                <circle cx="4" cy="12" r="1.5" fill={dot} opacity="0.55" />
                <circle cx="12" cy="12" r="1.5" fill={dot} opacity="0.9" />
                <circle cx="20" cy="12" r="1.5" fill={dot} opacity="0.65" />

                <circle cx="4" cy="20" r="1.5" fill={dot} opacity="0.35" />
                <circle cx="12" cy="20" r="1.5" fill={dot} opacity="0.65" />
                <circle cx="20" cy="20" r="1.5" fill={dot} opacity="0.8" />
            </g>
            <path
                d="M4 20 C7.5 16.5, 10.5 17.5, 14 10 C16 6.5, 18 9.5, 20 12"
                stroke={stroke}
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}


