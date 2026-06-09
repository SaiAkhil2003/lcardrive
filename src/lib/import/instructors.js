export const realInstructorColumns = [
  "id",
  "slug",
  "first_name",
  "last_name",
  "display_name",
  "suburb",
  "postcode",
  "state",
  "phone",
  "email",
  "adi_registration",
  "licence_types",
  "transmission",
  "languages",
  "gender",
  "hourly_rate",
  "five_hour_pack_price",
  "ten_hour_pack_price",
  "lesson_duration_minutes",
  "bio",
  "anxiety_friendly",
  "international_licence_conversion",
  "familiar_test_centres",
  "service_areas",
  "vehicle_make",
  "vehicle_model",
  "vehicle_year",
  "vehicle_transmission",
  "dual_controls",
  "facebook_url",
  "google_business_url",
  "verified",
  "claim_status",
  "latitude",
  "longitude",
  "google_place_id",
  "source_notes",
  "is_sample",
  "rating",
  "review_count",
  "experience_years",
  "availability_days",
  "profile_photo_url"
];

const requiredRealInstructorColumns = ["slug", "first_name", "suburb"];

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
  const displayName = row.display_name || row.name;

  return {
    id: row.id || undefined,
    slug: row.slug,
    first_name: row.first_name || String(displayName || "").split(" ")[0] || displayName,
    last_name: row.last_name,
    display_name: displayName,
    suburb: row.suburb,
    postcode: row.postcode,
    state: row.state || "VIC",
    phone: row.phone,
    email: row.email,
    adi_registration: row.adi_registration,
    transmission: row.transmission,
    licence_types: splitList(row.licence_types || row.licence_type),
    languages: splitList(row.languages),
    gender: row.gender,
    hourly_rate: toNumber(row.hourly_rate),
    five_hour_pack_price: toNumber(row.five_hour_pack_price || row.package_5hr),
    ten_hour_pack_price: toNumber(row.ten_hour_pack_price || row.package_10hr),
    lesson_duration_minutes: toNumber(row.lesson_duration_minutes),
    bio: row.bio,
    anxiety_friendly: toBoolean(row.anxiety_friendly),
    international_licence_conversion: toBoolean(
      row.international_licence_conversion || row.international_licence
    ),
    familiar_test_centres: splitList(row.familiar_test_centres || row.test_centres),
    service_areas: splitList(row.service_areas),
    vehicle_make: row.vehicle_make,
    vehicle_model: row.vehicle_model,
    vehicle_year: toNumber(row.vehicle_year),
    vehicle_transmission: row.vehicle_transmission,
    dual_controls: toBoolean(row.dual_controls),
    facebook_url: row.facebook_url,
    google_business_url: row.google_business_url,
    verified,
    claim_status: row.claim_status || (verified ? "Verified" : "Unclaimed"),
    latitude: toNumber(row.latitude),
    longitude: toNumber(row.longitude),
    google_place_id: row.google_place_id,
    source_notes: row.source_notes,
    is_sample: false,
    rating: toNumber(row.rating),
    review_count: toNumber(row.review_count),
    experience_years: toNumber(row.experience_years),
    availability_days: splitList(row.availability_days),
    profile_photo_url: row.profile_photo_url
  };
}

export function validateRealInstructorCsvRow(row, rowNumber = 1) {
  const missingColumns = requiredRealInstructorColumns.filter(
    (column) => !String(row?.[column] || "").trim()
  );
  const errors = missingColumns.map(
    (column) => `Row ${rowNumber}: missing required ${column}.`
  );

  if (row?.is_sample && toBoolean(row.is_sample)) {
    errors.push(`Row ${rowNumber}: real instructor imports must not be marked is_sample.`);
  }

  if (row?.hourly_rate && toNumber(row.hourly_rate) === null) {
    errors.push(`Row ${rowNumber}: hourly_rate must be a number.`);
  }

  if (row?.latitude && toNumber(row.latitude) === null) {
    errors.push(`Row ${rowNumber}: latitude must be a number.`);
  }

  if (row?.longitude && toNumber(row.longitude) === null) {
    errors.push(`Row ${rowNumber}: longitude must be a number.`);
  }

  return {
    ok: errors.length === 0,
    errors
  };
}

export function validateRealInstructorCsvRows(rows) {
  const errors = rows.flatMap((row, index) =>
    validateRealInstructorCsvRow(row, index + 1).errors
  );

  return {
    ok: errors.length === 0,
    errors
  };
}
