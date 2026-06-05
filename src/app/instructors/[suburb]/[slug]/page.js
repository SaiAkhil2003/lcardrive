import Link from "next/link";
import InstructorProfileClient from "@/components/profile/InstructorProfileClient";
import { instructors } from "@/data/instructors";
import { getProfileDescription, getProfileTitle } from "@/lib/seo/metadata";
import { getInstructorLocalBusinessSchema } from "@/lib/seo/structuredData";

function getInstructor(slug) {
  return instructors.find((item) => item.slug === slug);
}

function getProfileUrl(params) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return `${siteUrl}/instructors/${params.suburb}/${params.slug}`;
}

export function generateStaticParams() {
  return instructors.map((instructor) => ({
    suburb: instructor.suburb.toLowerCase().replaceAll(" ", "-"),
    slug: instructor.slug
  }));
}

export function generateMetadata({ params }) {
  const instructor = getInstructor(params.slug);

  if (!instructor) {
    return {
      title: "Instructor not found | LCarDrive"
    };
  }

  return {
    title: getProfileTitle(instructor),
    description: getProfileDescription(instructor),
    alternates: {
      canonical: getProfileUrl(params)
    }
  };
}

export default function InstructorProfilePage({ params }) {
  const instructor = getInstructor(params.slug);

  if (!instructor) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-20 text-slate-900">
        <div className="mx-auto max-w-3xl rounded-2xl border bg-white p-8 text-center shadow-sm">
          <h1 className="text-3xl font-bold">Instructor not found</h1>

          <p className="mt-3 text-slate-600">
            The instructor profile you are looking for is not available.
          </p>

          <Link
            href="/search"
            className="mt-6 inline-block rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Back to Search
          </Link>
        </div>
      </main>
    );
  }

  const profileUrl = getProfileUrl(params);
  const schema = getInstructorLocalBusinessSchema(instructor, profileUrl);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <InstructorProfileClient instructor={instructor} />
    </>
  );
}
