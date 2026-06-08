import { instructors as sampleInstructors } from "@/data/instructors";
import { selectWithServiceRole } from "@/lib/supabase/admin";
import { selectWithAnonKey } from "@/lib/supabase/server";

const INSTRUCTORS_SELECT_PATH = "instructors?select=*";

function toArray(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/[|,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function firstDefined(...values) {
  return values.find(
    (value) => value !== null && value !== undefined && value !== ""
  );
}

function toBoolean(value) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  if (typeof value === "string") {
    return ["true", "yes", "y", "1"].includes(value.toLowerCase().trim());
  }

  return Boolean(value);
}

function getDisplayName(row) {
  return (
    row.display_name ||
    row.name ||
    [row.first_name, row.last_name].filter(Boolean).join(" ") ||
    "Unnamed instructor"
  );
}

function getLastInitial(row, displayName) {
  if (row.last_name) {
    return row.last_name.charAt(0);
  }

  const parts = displayName.split(" ").filter(Boolean);
  return parts.length > 1 ? parts[parts.length - 1].charAt(0) : "";
}

function money(value, fallback = "Contact for pricing") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return String(value);
  }

  return `$${Math.round(number)}`;
}

function getLessonDuration(row) {
  if (!row.lesson_duration_minutes) {
    return "60 minutes";
  }

  return `${row.lesson_duration_minutes} minutes`;
}

function getExperience(row) {
  if (!row.experience_years) {
    return "Experience not listed";
  }

  return `${row.experience_years} years`;
}

export function getSuburbSlug(suburb = "") {
  return suburb.toLowerCase().replaceAll(" ", "-");
}

export function normalizeInstructorRow(row, options = {}) {
  const displayName = getDisplayName(row);
  const rating = firstDefined(row.rating, row.average_rating, "0");
  const reviewCount = firstDefined(row.review_count, row.reviews_count, 0);
  const licenceTypesValue = firstDefined(row.licence_types, row.licence_type);
  const licenceTypes = toArray(licenceTypesValue).length
    ? toArray(licenceTypesValue)
    : ["Car"];
  const languages = toArray(row.languages);
  const serviceAreas = toArray(row.service_areas);
  const testCentres = toArray(firstDefined(row.familiar_test_centres, row.test_centres));
  const availability = toArray(row.availability_days);
  const hourlyRate = firstDefined(row.hourly_rate, row.rate);
  const fiveHourPack = money(firstDefined(row.five_hour_pack_price, row.package_5hr), "");
  const tenHourPack = money(firstDefined(row.ten_hour_pack_price, row.package_10hr), "");
  const packageOptions = [
    fiveHourPack ? `5 hour pack: ${fiveHourPack}` : "",
    tenHourPack ? `10 hour pack: ${tenHourPack}` : ""
  ].filter(Boolean);

  const instructor = {
    id: row.id,
    slug: row.slug,
    firstName: row.first_name || displayName.split(" ")[0] || displayName,
    lastInitial: getLastInitial(row, displayName),
    name: displayName,
    suburb: row.suburb,
    postcode: row.postcode || "",
    state: row.state || "VIC",
    gender: row.gender || "",
    licenceTypes,
    createdAt: row.created_at || new Date().toISOString(),
    claimStatus: row.claim_status || (toBoolean(row.verified) ? "Verified" : "Unclaimed"),
    distance: row.distance || "Distance unavailable",
    rating: String(rating),
    reviews: String(reviewCount),
    transmission: row.transmission || "Auto",
    verified: toBoolean(row.verified),
    anxietyFriendly: toBoolean(row.anxiety_friendly),
    internationalLicence: toBoolean(
      firstDefined(row.international_licence_conversion, row.international_licence)
    ),
    rate: hourlyRate ? `${money(hourlyRate)}/hr` : "Contact for pricing",
    packagePrice: fiveHourPack ? `${fiveHourPack} for 5 hrs` : "Package pricing unavailable",
    packageOptions,
    lessonDuration: getLessonDuration(row),
    experience: getExperience(row),
    language: languages.join(", ") || "English",
    testCentre: testCentres.join(", ") || "Not listed",
    serviceAreas,
    availability,
    latitude: row.latitude === null || row.latitude === undefined ? null : Number(row.latitude),
    longitude: row.longitude === null || row.longitude === undefined ? null : Number(row.longitude),
    profilePhotoUrl: row.profile_photo_url || "",
    vehicle: {
      make: row.vehicle_make || "Not listed",
      model: row.vehicle_model || "Not listed",
      year: row.vehicle_year ? String(row.vehicle_year) : "Not listed",
      transmission: row.vehicle_transmission || row.transmission || "Not listed",
      dualControls: toBoolean(row.dual_controls) ? "Yes" : "Not listed"
    },
    adiRegistration: row.adi_registration || "Not listed",
    description:
      row.bio ||
      `${displayName} is a driving instructor based in ${row.suburb || "Victoria"}.`,
    reviewBreakdown: {
      patience: String(rating),
      communication: String(rating),
      value: String(rating),
      punctuality: String(rating)
    },
    sampleReview: "Reviews are collected for moderation before appearing publicly.",
    passOutcome: "Review outcome not listed",
    isSample: toBoolean(row.is_sample)
  };

  if (options.includePrivate) {
    instructor.email = row.email || "";
    instructor.phone = row.phone || "";
  }

  return instructor;
}

async function selectInstructorRows(path) {
  const publicResult = await selectWithAnonKey(path);

  if (
    !publicResult.placeholder &&
    !publicResult.error &&
    Array.isArray(publicResult.data) &&
    publicResult.data.length > 0
  ) {
    return publicResult;
  }

  const serviceResult = await selectWithServiceRole(path);

  if (!serviceResult.placeholder && !serviceResult.error && Array.isArray(serviceResult.data)) {
    return serviceResult;
  }

  if (!publicResult.placeholder && !publicResult.error && Array.isArray(publicResult.data)) {
    return publicResult;
  }

  return {
    data: null,
    error: publicResult.error || serviceResult.error,
    placeholder: publicResult.placeholder && serviceResult.placeholder
  };
}

export async function getInstructors(options = {}) {
  const result = await selectInstructorRows(INSTRUCTORS_SELECT_PATH);

  if (result.placeholder || result.error || !Array.isArray(result.data)) {
    return {
      data: sampleInstructors,
      source: "sample",
      error: result.error
    };
  }

  if (result.data.length === 0 && options.fallbackWhenEmpty !== false) {
    return {
      data: sampleInstructors,
      source: "sample-empty",
      error: null
    };
  }

  return {
    data: result.data.map((row) => normalizeInstructorRow(row, options)),
    source: "supabase",
    error: null
  };
}

export async function getInstructorBySlug(slug, options = {}) {
  const result = await selectInstructorRows(
    `instructors?slug=eq.${encodeURIComponent(slug)}&select=*&limit=1`
  );

  if (!result.placeholder && !result.error && Array.isArray(result.data) && result.data[0]) {
    return {
      data: normalizeInstructorRow(result.data[0], options),
      source: "supabase",
      error: null
    };
  }

  const sample = sampleInstructors.find((item) => item.slug === slug) || null;

  return {
    data: sample,
    source: sample ? "sample" : "missing",
    error: result.error
  };
}

export function getSampleInstructors() {
  return sampleInstructors;
}
