export function hasGoogleMapsServerKey() {
  return Boolean(process.env.GOOGLE_MAPS_API_KEY);
}

export async function geocodeSuburbOrPostcode(query) {
  if (!hasGoogleMapsServerKey() || !query?.trim()) {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);
  const params = new URLSearchParams({
    address: `${query.trim()}, Victoria, Australia`,
    region: "au",
    components: "country:AU",
    key: process.env.GOOGLE_MAPS_API_KEY
  });

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`,
      {
        signal: controller.signal
      }
    );
    const data = await response.json().catch(() => null);
    const location = data?.results?.[0]?.geometry?.location;

    if (!response.ok || !location) {
      return null;
    }

    return {
      latitude: Number(location.lat),
      longitude: Number(location.lng)
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
