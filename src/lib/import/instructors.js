export const realInstructorColumns = [
  "id",
  "slug",
  "name",
  "suburb",
  "state",
  "latitude",
  "longitude",
  "transmission",
  "licence_type",
  "hourly_rate",
  "package_5hr",
  "package_10hr",
  "rating",
  "review_count",
  "languages",
  "anxiety_friendly",
  "international_licence",
  "verified",
  "experience_years",
  "vehicle_make",
  "vehicle_model",
  "vehicle_year",
  "dual_controls",
  "service_areas",
  "test_centres",
  "bio",
  "adi_registration",
  "phone",
  "email",
  "profile_photo_url"
];

function splitList(value) {
  return String(value || "")
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toBoolean(value) {
  return ["true", "yes", "1"].includes(String(value || "").toLowerCase());
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function mapRealInstructorCsvRow(row) {
  const verified = toBoolean(row.verified);

  return {
    id: row.id || undefined,
    slug: row.slug,
    display_name: row.name,
    first_name: String(row.name || "").split(" ")[0] || row.name,
    suburb: row.suburb,
    state: row.state || "VIC",
    latitude: toNumber(row.latitude),
    longitude: toNumber(row.longitude),
    transmission: row.transmission,
    licence_types: splitList(row.licence_type),
    hourly_rate: toNumber(row.hourly_rate),
    five_hour_pack_price: toNumber(row.package_5hr),
    ten_hour_pack_price: toNumber(row.package_10hr),
    rating: toNumber(row.rating),
    review_count: toNumber(row.review_count),
    languages: splitList(row.languages),
    anxiety_friendly: toBoolean(row.anxiety_friendly),
    international_licence_conversion: toBoolean(row.international_licence),
    verified,
    experience_years: toNumber(row.experience_years),
    vehicle_make: row.vehicle_make,
    vehicle_model: row.vehicle_model,
    vehicle_year: toNumber(row.vehicle_year),
    dual_controls: toBoolean(row.dual_controls),
    service_areas: splitList(row.service_areas),
    familiar_test_centres: splitList(row.test_centres),
    bio: row.bio,
    adi_registration: row.adi_registration,
    phone: row.phone,
    email: row.email,
    profile_photo_url: row.profile_photo_url,
    is_sample: false,
    claim_status: verified ? "Verified" : "Unclaimed"
  };
}
