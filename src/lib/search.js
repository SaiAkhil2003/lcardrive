import { getInstructors } from "@/lib/instructors";
import { geocodeSuburbOrPostcode } from "@/lib/googleMaps";
import { hasCoordinates, withDistanceFromOrigin } from "@/lib/geo";
import { insertWithAnonKey } from "@/lib/supabase/client";

export const languageOptions = ["English", "Hindi", "Tamil", "Arabic", "Mandarin"];
export const testCentreOptions = [
  "Sunshine",
  "Werribee",
  "Moorabbin",
  "Bundoora",
  "Broadmeadows",
  "Carlton",
  "Melton"
];

export function getParam(searchParams, key, fallback = "") {
  const value = searchParams?.[key];

  if (Array.isArray(value)) {
    return value[0] || fallback;
  }

  return value || fallback;
}

export function getLegacyFilters(searchParams) {
  return getParam(searchParams, "filters")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getBooleanParam(searchParams, key, legacyLabel) {
  const value = getParam(searchParams, key);
  const legacyFilters = getLegacyFilters(searchParams);

  return (
    value === "on" ||
    value === "true" ||
    value === "1" ||
    legacyFilters.includes(legacyLabel)
  );
}

export function getRateNumber(rate) {
  return Number(String(rate).replace(/[^0-9.]/g, "")) || 0;
}

export function getTransmissionFilter(searchParams) {
  const transmission = getParam(searchParams, "transmission");
  const legacyFilters = getLegacyFilters(searchParams);

  if (transmission) {
    return transmission;
  }

  if (legacyFilters.includes("Auto")) {
    return "Auto";
  }

  if (legacyFilters.includes("Manual")) {
    return "Manual";
  }

  return "";
}

export function getLicenceTypeFilter(searchParams) {
  const licenceType = getParam(searchParams, "licenceType");
  const legacyFilters = getLegacyFilters(searchParams);

  if (licenceType) {
    return licenceType;
  }

  if (legacyFilters.includes("Car")) {
    return "Car";
  }

  if (legacyFilters.includes("Motorbike")) {
    return "Motorbike";
  }

  return "";
}

function instructorMatchesTransmission(instructor, transmission) {
  if (!transmission || transmission === "Both") {
    return true;
  }

  return (
    instructor.transmission === transmission ||
    instructor.transmission === "Both" ||
    instructor.vehicle?.transmission?.toLowerCase().includes(transmission.toLowerCase())
  );
}

function instructorMatchesLocation(instructor, suburb, hasGeoRadius) {
  if (!suburb || suburb === "Melbourne west" || hasGeoRadius) {
    return true;
  }

  const normalized = suburb.toLowerCase().trim();

  return (
    instructor.suburb?.toLowerCase().includes(normalized) ||
    instructor.postcode === suburb ||
    instructor.serviceAreas?.some((area) => area.toLowerCase().includes(normalized))
  );
}

export function applyInstructorFilters(instructors, searchParams, options = {}) {
  const suburb = getParam(searchParams, "suburb", "Melbourne west");
  const licenceType = getLicenceTypeFilter(searchParams);
  const transmission = getTransmissionFilter(searchParams);
  const maxPrice = Number(getParam(searchParams, "maxPrice", "150")) || 150;
  const language = getParam(searchParams, "language");
  const gender = getParam(searchParams, "gender");
  const testCentre = getParam(searchParams, "testCentre");
  const anxietyFriendly = getBooleanParam(
    searchParams,
    "anxietyFriendly",
    "Anxiety Friendly"
  );
  const internationalLicence = getBooleanParam(
    searchParams,
    "internationalLicence",
    "International Licence"
  );

  return instructors.filter((instructor) => {
    if (!instructorMatchesLocation(instructor, suburb, options.hasGeoRadius)) {
      return false;
    }

    if (licenceType && !instructor.licenceTypes.includes(licenceType)) {
      return false;
    }

    if (!instructorMatchesTransmission(instructor, transmission)) {
      return false;
    }

    if (getRateNumber(instructor.rate) > maxPrice) {
      return false;
    }

    if (language && !instructor.language.toLowerCase().includes(language.toLowerCase())) {
      return false;
    }

    if (gender && instructor.gender !== gender) {
      return false;
    }

    if (anxietyFriendly && !instructor.anxietyFriendly) {
      return false;
    }

    if (internationalLicence && !instructor.internationalLicence) {
      return false;
    }

    if (
      testCentre &&
      !instructor.testCentre.toLowerCase().includes(testCentre.toLowerCase())
    ) {
      return false;
    }

    return true;
  });
}

export function sortInstructorResults(results, sort) {
  const sorted = [...results];

  if (sort === "price") {
    return sorted.sort((left, right) => getRateNumber(left.rate) - getRateNumber(right.rate));
  }

  if (sort === "rating") {
    return sorted.sort((left, right) => Number(right.rating) - Number(left.rating));
  }

  if (sort === "newest") {
    return sorted.sort(
      (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    );
  }

  return sorted.sort((left, right) => {
    if (Number.isFinite(left.distanceKm) && Number.isFinite(right.distanceKm)) {
      return left.distanceKm - right.distanceKm;
    }

    if (left.verified !== right.verified) {
      return left.verified ? -1 : 1;
    }

    return Number(right.rating) - Number(left.rating);
  });
}

export function getSearchFilters(searchParams) {
  return {
    licenceType: getLicenceTypeFilter(searchParams),
    transmission: getTransmissionFilter(searchParams),
    maxPrice: getParam(searchParams, "maxPrice", "150"),
    language: getParam(searchParams, "language"),
    gender: getParam(searchParams, "gender"),
    testCentre: getParam(searchParams, "testCentre"),
    anxietyFriendly: getBooleanParam(searchParams, "anxietyFriendly", "Anxiety Friendly"),
    internationalLicence: getBooleanParam(
      searchParams,
      "internationalLicence",
      "International Licence"
    )
  };
}

export async function logSearch(searchParams, resultsCount) {
  const filters = getSearchFilters(searchParams);
  const payload = {
    query: getParam(searchParams, "suburb", "Melbourne west"),
    suburb: getParam(searchParams, "suburb", "Melbourne west"),
    radius_km: Number(getParam(searchParams, "radius", "10")) || 10,
    licence_type: filters.licenceType || null,
    transmission: filters.transmission || null,
    max_hourly_rate: Number(filters.maxPrice) || null,
    language: filters.language || null,
    gender: filters.gender || null,
    test_centre: filters.testCentre || null,
    special_needs: [
      filters.anxietyFriendly ? "Anxiety Friendly" : "",
      filters.internationalLicence ? "International Licence" : ""
    ].filter(Boolean),
    filters,
    results_count: resultsCount
  };

  await insertWithAnonKey("search_logs", payload);
}

export async function getSearchResults(searchParams) {
  const suburb = getParam(searchParams, "suburb", "Melbourne west");
  const radius = Number(getParam(searchParams, "radius", "10")) || 10;
  const sort = getParam(searchParams, "sort", "relevance");
  const instructorResult = await getInstructors();
  const origin = await geocodeSuburbOrPostcode(suburb);
  const hasGeoRadius =
    Boolean(origin) && instructorResult.data.some((instructor) => hasCoordinates(instructor));
  const withDistance = hasGeoRadius
    ? instructorResult.data
        .map((instructor) => withDistanceFromOrigin(instructor, origin))
        .filter((instructor) => !Number.isFinite(instructor.distanceKm) || instructor.distanceKm <= radius)
    : instructorResult.data;
  const filtered = applyInstructorFilters(withDistance, searchParams, {
    hasGeoRadius
  });
  const results = sortInstructorResults(filtered, sort);

  await logSearch(searchParams, results.length);

  return {
    results,
    source: instructorResult.source,
    hasGeoRadius,
    dataError: instructorResult.error
  };
}
