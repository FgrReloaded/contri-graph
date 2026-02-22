import type { Metadata } from "next";
import { redirect } from "next/navigation";

interface SharePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ searchParams }: SharePageProps): Promise<Metadata> {
  const params = await searchParams;
  const username = typeof params.username === "string" ? params.username : "";
  const year = typeof params.year === "string" ? params.year : "";

  if (!username || !year) {
    return {
      title: "Contri Graph",
      description: "Visualize your GitHub contributions",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://cg.nitishk.dev";

  const ogParams = new URLSearchParams();
  ogParams.set("username", username);
  ogParams.set("year", year);

  for (const key of ["baseColor", "size", "gap", "shape", "minOpacity", "maxOpacity"]) {
    const val = params[key];
    if (typeof val === "string") {
      ogParams.set(key, val);
    }
  }

  const ogImageUrl = `${baseUrl}/api/share?${ogParams.toString()}`;

  const title = `${username}'s GitHub Contributions (${year}) - Contri Graph`;
  const description = `Visualize ${username}'s GitHub contribution graph for ${year}`;

  return {
    title,
    description,
    openGraph: {
      type: "website",
      url: `${baseUrl}/share?${ogParams.toString()}`,
      siteName: "Contri Graph",
      title,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${username}'s contribution graph`,
        },
      ],
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function SharePage({ searchParams }: SharePageProps) {
  const params = await searchParams;
  const username = typeof params.username === "string" ? params.username : "";
  const year = typeof params.year === "string" ? params.year : "";

  if (!username || !year) {
    redirect("/");
  }

  const ogParams = new URLSearchParams();
  ogParams.set("username", username);
  ogParams.set("year", year);

  for (const key of ["baseColor", "size", "gap", "shape", "minOpacity", "maxOpacity"]) {
    const val = params[key];
    if (typeof val === "string") {
      ogParams.set(key, val);
    }
  }

  redirect(`/?${ogParams.toString()}`);
}
