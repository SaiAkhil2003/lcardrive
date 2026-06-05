export function getInstructorLocalBusinessSchema(instructor, profileUrl) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: instructor.name,
    url: profileUrl,
    description: instructor.description,
    priceRange: instructor.rate,
    image: profileUrl,
    address: {
      "@type": "PostalAddress",
      addressLocality: instructor.suburb,
      postalCode: instructor.postcode,
      addressRegion: instructor.state,
      addressCountry: "AU"
    },
    areaServed: instructor.serviceAreas.map((area) => ({
      "@type": "Place",
      name: area
    })),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: instructor.rating,
      reviewCount: instructor.reviews
    }
  };
}
