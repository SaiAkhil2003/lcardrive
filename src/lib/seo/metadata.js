export function getProfileTitle(instructor) {
  return `${instructor.firstName} ${instructor.lastInitial} — Driving Instructor in ${instructor.suburb} | LCarDrive`;
}

export function getProfileDescription(instructor) {
  if (instructor.description) {
    return instructor.description.slice(0, 150);
  }

  return `${instructor.transmission} driving lessons in ${instructor.suburb} from ${instructor.rate}.`;
}
