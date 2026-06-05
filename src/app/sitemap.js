import { instructors } from "@/data/instructors";

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

function getSuburbSlug(suburb) {
  return suburb.toLowerCase().replaceAll(" ", "-");
}

export default function sitemap() {
  const siteUrl = getSiteUrl();
  const staticRoutes = ["", "/search", "/find-my-instructor"];
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
