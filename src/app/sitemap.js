import { getInstructors, getSuburbSlug } from "@/lib/instructors";

export const dynamic = "force-dynamic";

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export default async function sitemap() {
  const siteUrl = getSiteUrl();
  const staticRoutes = ["", "/search", "/find-my-instructor"];
  const { data: instructors } = await getInstructors();
  const profileRoutes = instructors.map(
    (instructor) =>
      `/instructors/${getSuburbSlug(instructor.suburb)}/${instructor.slug}`
  );

  return [...staticRoutes, ...profileRoutes].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.8
  }));
}
