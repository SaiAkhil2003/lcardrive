const EARTH_RADIUS_KM = 6371;

function toRadians(value) {
  return (Number(value) * Math.PI) / 180;
}

export function hasCoordinates(item) {
  return Number.isFinite(Number(item?.latitude)) && Number.isFinite(Number(item?.longitude));
}

export function getDistanceKm(origin, destination) {
  if (!hasCoordinates(origin) || !hasCoordinates(destination)) {
    return null;
  }

  const latitudeDelta = toRadians(destination.latitude - origin.latitude);
  const longitudeDelta = toRadians(destination.longitude - origin.longitude);
  const originLatitude = toRadians(origin.latitude);
  const destinationLatitude = toRadians(destination.latitude);
  const halfChordLength =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(originLatitude) *
      Math.cos(destinationLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;
  const angularDistance =
    2 * Math.atan2(Math.sqrt(halfChordLength), Math.sqrt(1 - halfChordLength));

  return EARTH_RADIUS_KM * angularDistance;
}

export function withDistanceFromOrigin(instructor, origin) {
  const distanceKm = getDistanceKm(origin, instructor);

  if (distanceKm === null) {
    return instructor;
  }

  return {
    ...instructor,
    distance: `${distanceKm.toFixed(1)} km`,
    distanceKm
  };
}
