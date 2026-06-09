import { getInstructorBySlug, getInstructors } from "@/lib/instructors";
import {
  countWithServiceRole,
  deleteWithServiceRole,
  insertWithServiceRole,
  selectWithServiceRole,
  updateWithServiceRole
} from "@/lib/supabase/admin";
import { getClaimedInstructorSlugsForUser } from "@/lib/auth/ownership";

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

export function getPlatformCommissionPercent() {
  const configured = Number(process.env.PLATFORM_COMMISSION_PERCENT);

  return Number.isFinite(configured) && configured >= 0 ? configured : 15;
}

function centsFromMoneyLabel(value) {
  const number = Number(String(value || "").replace(/[^0-9.]/g, ""));

  return Number.isFinite(number) && number > 0 ? Math.round(number * 100) : 0;
}

function encode(value) {
  return encodeURIComponent(value);
}

function toArray(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  return String(value || "")
    .split(/[|,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function toDateInput(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function buildDateTime(date, time) {
  const [hours = "9", minutes = "0"] = String(time || "09:00").split(":");
  const next = new Date(date);
  next.setHours(Number(hours), Number(minutes), 0, 0);
  return next;
}

function normalizeTime(value, fallback) {
  return String(value || fallback).slice(0, 5);
}

function getWeekdayNumber(day) {
  const index = dayNames.findIndex(
    (item) => item.toLowerCase() === String(day || "").toLowerCase()
  );

  return index === -1 ? 1 : index;
}

function getSampleAvailabilityRecords(instructor) {
  const days = instructor?.availability?.length ? instructor.availability : ["Monday", "Wednesday"];

  return days.map((day) => ({
    id: `sample-${instructor?.slug || "instructor"}-${day}`,
    instructor_slug: instructor?.slug || "",
    weekday: getWeekdayNumber(day),
    start_time: "09:00",
    end_time: "16:00",
    slot_minutes: 60,
    is_recurring: true,
    is_blocked: false,
    status: "active"
  }));
}

function normalizeAvailability(row) {
  return {
    id: row.id,
    instructorSlug: row.instructor_slug,
    weekday: Number(row.weekday),
    day: dayNames[Number(row.weekday)] || "Monday",
    startTime: normalizeTime(row.start_time, "09:00"),
    endTime: normalizeTime(row.end_time, "16:00"),
    slotMinutes: Number(row.slot_minutes) || 60,
    isRecurring: row.is_recurring !== false,
    blockedDate: row.blocked_date || "",
    isBlocked: Boolean(row.is_blocked),
    status: row.status || "active"
  };
}

export async function getAvailabilityRecords(instructorSlug) {
  const result = await selectWithServiceRole(
    `instructor_availability?instructor_slug=eq.${encode(instructorSlug)}&select=*&order=weekday.asc`
  );

  if (!result.placeholder && !result.error && Array.isArray(result.data) && result.data.length > 0) {
    return {
      data: result.data.map(normalizeAvailability),
      source: "supabase",
      error: null
    };
  }

  const { data: instructor } = await getInstructorBySlug(instructorSlug);

  return {
    data: getSampleAvailabilityRecords(instructor).map(normalizeAvailability),
    source: result.placeholder || result.error ? "sample" : "sample-empty",
    error: result.error
  };
}

export async function getAvailableSlots(instructorSlug, options = {}) {
  const daysAhead = Number(options.daysAhead) || 14;
  const startDate = options.startDate ? new Date(options.startDate) : new Date();
  const availability = await getAvailabilityRecords(instructorSlug);
  const blockedDates = new Set(
    availability.data
      .filter((record) => record.isBlocked && record.blockedDate)
      .map((record) => record.blockedDate)
  );
  const recurring = availability.data.filter(
    (record) => record.isRecurring && !record.isBlocked && record.status === "active"
  );
  const slots = [];

  for (let offset = 0; offset <= daysAhead; offset += 1) {
    const date = addDays(startDate, offset);
    const dateKey = toDateInput(date);

    if (blockedDates.has(dateKey)) {
      continue;
    }

    recurring
      .filter((record) => record.weekday === date.getDay())
      .forEach((record) => {
        let cursor = buildDateTime(date, record.startTime);
        const end = buildDateTime(date, record.endTime);

        while (addMinutes(cursor, record.slotMinutes) <= end) {
          if (cursor > new Date()) {
            slots.push({
              id: `${instructorSlug}-${cursor.toISOString()}`,
              instructorSlug,
              start: cursor.toISOString(),
              end: addMinutes(cursor, record.slotMinutes).toISOString(),
              label: cursor.toLocaleString("en-AU", {
                weekday: "short",
                day: "numeric",
                month: "short",
                hour: "numeric",
                minute: "2-digit"
              })
            });
          }

          cursor = addMinutes(cursor, record.slotMinutes);
        }
      });
  }

  return {
    data: slots.slice(0, 30),
    source: availability.source,
    error: availability.error
  };
}

export async function saveAvailabilityRecords(userId, instructorSlug, records) {
  const payload = records.map((record) => ({
    instructor_slug: instructorSlug,
    clerk_user_id: userId,
    weekday: Number(record.weekday),
    start_time: normalizeTime(record.startTime, "09:00"),
    end_time: normalizeTime(record.endTime, "16:00"),
    slot_minutes: Number(record.slotMinutes) || 60,
    is_recurring: true,
    is_blocked: false,
    status: record.status || "active",
    updated_at: new Date().toISOString()
  }));

  const result = await insertWithServiceRole("instructor_availability", payload);

  if (result.placeholder) {
    return {
      ok: true,
      mode: "development",
      data: payload
    };
  }

  if (result.error) {
    return {
      ok: false,
      error: result.error
    };
  }

  return {
    ok: true,
    mode: "supabase",
    data: result.data
  };
}

function normalizeBooking(row) {
  return {
    id: row.id,
    instructorSlug: row.instructor_slug,
    learnerUserId: row.learner_clerk_user_id,
    learnerName: row.learner_name || "Learner",
    learnerEmail: row.learner_email || "",
    learnerPhone: row.learner_phone || "",
    lessonType: row.lesson_type || "Standard lesson",
    pickupSuburb: row.pickup_suburb || "",
    pickupAddress: row.pickup_address || "",
    scheduledStart: row.scheduled_start || "",
    scheduledEnd: row.scheduled_end || "",
    alternateStart: row.alternate_start || "",
    status: row.status || "pending",
    paymentStatus: row.payment_status || "not_required",
    amountCents: Number(row.amount_cents) || 0,
    platformFeeCents: Number(row.platform_fee_cents) || 0,
    notes: row.notes || "",
    cancellationReason: row.cancellation_reason || "",
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || row.created_at || new Date().toISOString()
  };
}

function getLessonAmountCents(instructor, lessonType) {
  if (lessonType === "5-hour-pack") {
    return centsFromMoneyLabel(instructor?.packageOptions?.[0] || instructor?.packagePrice);
  }

  if (lessonType === "10-hour-pack") {
    return centsFromMoneyLabel(instructor?.packageOptions?.[1]);
  }

  return centsFromMoneyLabel(instructor?.rate);
}

export async function createBooking({ userId, body }) {
  const instructorSlug = body?.instructorSlug || body?.instructor_slug;
  const { data: instructor } = await getInstructorBySlug(instructorSlug, {
    includePrivate: true
  });

  if (!instructor) {
    return {
      ok: false,
      status: 404,
      error: "Instructor not found."
    };
  }

  const scheduledStart = new Date(body?.scheduledStart || body?.scheduled_start);

  if (!Number.isFinite(scheduledStart.getTime())) {
    return {
      ok: false,
      status: 400,
      error: "Choose a valid lesson time."
    };
  }

  const lessonMinutes = Number(body?.durationMinutes) || 60;
  const scheduledEnd = addMinutes(scheduledStart, lessonMinutes);
  const amountCents = getLessonAmountCents(instructor, body?.lessonType);
  const platformFeeCents = Math.round(amountCents * (getPlatformCommissionPercent() / 100));
  const payload = {
    instructor_slug: instructor.slug,
    learner_clerk_user_id: userId,
    learner_name: body?.learnerName || "",
    learner_email: body?.learnerEmail || "",
    learner_phone: body?.learnerPhone || "",
    lesson_type: body?.lessonType || "standard",
    package_hours: body?.lessonType === "5-hour-pack" ? 5 : body?.lessonType === "10-hour-pack" ? 10 : null,
    scheduled_start: scheduledStart.toISOString(),
    scheduled_end: scheduledEnd.toISOString(),
    pickup_suburb: body?.pickupSuburb || "",
    pickup_address: body?.pickupAddress || "",
    notes: body?.notes || "",
    status: "pending",
    payment_status: process.env.STRIPE_SECRET_KEY ? "requires_payment" : "not_required",
    amount_cents: amountCents,
    platform_fee_cents: platformFeeCents,
    currency: "aud"
  };
  const result = await insertWithServiceRole("bookings", payload);

  if (result.placeholder) {
    return {
      ok: true,
      mode: "development",
      booking: normalizeBooking({
        id: `local-${Date.now()}`,
        ...payload,
        created_at: new Date().toISOString()
      })
    };
  }

  if (result.error) {
    return {
      ok: false,
      status: 500,
      error: "Booking could not be saved."
    };
  }

  const booking = result.data?.[0] || result.data;

  await recordPlatformEvent({
    actorUserId: userId,
    actorRole: "learner",
    eventType: "booking_created",
    entityType: "booking",
    entityId: booking?.id,
    metadata: {
      instructorSlug: instructor.slug,
      status: "pending"
    }
  });

  return {
    ok: true,
    mode: "supabase",
    booking: normalizeBooking(booking)
  };
}

export async function getLearnerBookings(userId) {
  const result = await selectWithServiceRole(
    `bookings?learner_clerk_user_id=eq.${encode(userId)}&select=*&order=scheduled_start.desc`
  );

  if (result.placeholder || result.error || !Array.isArray(result.data)) {
    return {
      data: [],
      source: result.placeholder ? "placeholder" : "supabase-error",
      error: result.error
    };
  }

  return {
    data: result.data.map(normalizeBooking),
    source: "supabase",
    error: null
  };
}

export async function getInstructorPortalBookings(userId) {
  const ownership = await getClaimedInstructorSlugsForUser(userId);

  if (ownership.data.length === 0) {
    return {
      data: [],
      source: ownership.source,
      error: ownership.error
    };
  }

  const slugs = ownership.data.map((slug) => encode(slug)).join(",");
  const result = await selectWithServiceRole(
    `bookings?instructor_slug=in.(${slugs})&select=*&order=scheduled_start.desc`
  );

  if (result.placeholder || result.error || !Array.isArray(result.data)) {
    return {
      data: [],
      source: result.placeholder ? "placeholder" : "supabase-error",
      error: result.error
    };
  }

  return {
    data: result.data.map(normalizeBooking),
    source: "supabase",
    error: null
  };
}

export async function getAdminBookings() {
  const result = await selectWithServiceRole(
    "bookings?select=*&order=scheduled_start.desc&limit=200"
  );

  if (result.placeholder || result.error || !Array.isArray(result.data)) {
    return {
      data: [],
      source: result.placeholder ? "placeholder" : "supabase-error",
      error: result.error
    };
  }

  return {
    data: result.data.map(normalizeBooking),
    source: "supabase",
    error: null
  };
}

export async function getBookingById(bookingId) {
  const result = await selectWithServiceRole(
    `bookings?id=eq.${encode(bookingId)}&select=*&limit=1`
  );

  if (result.placeholder || result.error || !Array.isArray(result.data) || !result.data[0]) {
    return {
      data: null,
      source: result.placeholder ? "placeholder" : "missing",
      error: result.error
    };
  }

  return {
    data: normalizeBooking(result.data[0]),
    source: "supabase",
    error: null
  };
}

export async function updateBookingWorkflow({ bookingId, action, body = {}, actorUserId, actorRole }) {
  const statusByAction = {
    accept: "confirmed",
    decline: "declined",
    cancel: "cancelled",
    reschedule: "reschedule_requested",
    propose_alternate: "alternate_proposed"
  };
  const status = statusByAction[action];

  if (!status) {
    return {
      ok: false,
      status: 400,
      error: "Unsupported booking action."
    };
  }

  const payload = {
    status,
    cancellation_reason: body.reason || null,
    alternate_start: body.alternateStart || null,
    updated_at: new Date().toISOString()
  };
  const result = await updateWithServiceRole(
    `bookings?id=eq.${encode(bookingId)}`,
    payload
  );

  if (result.placeholder) {
    return {
      ok: true,
      mode: "development",
      booking: normalizeBooking({
        id: bookingId,
        ...payload,
        created_at: new Date().toISOString()
      })
    };
  }

  if (result.error) {
    return {
      ok: false,
      status: 500,
      error: "Booking update failed."
    };
  }

  const booking = result.data?.[0] || result.data;

  await insertWithServiceRole("booking_events", {
    booking_id: bookingId,
    actor_clerk_user_id: actorUserId,
    actor_role: actorRole,
    event_type: action,
    message: body.message || body.reason || "",
    metadata: { status }
  });

  return {
    ok: true,
    mode: "supabase",
    booking: normalizeBooking(booking)
  };
}

export async function getLearnerFavourites(userId) {
  const result = await selectWithServiceRole(
    `favourites?learner_clerk_user_id=eq.${encode(userId)}&select=*&order=created_at.desc`
  );
  const instructorResult = await getInstructors();

  if (result.placeholder || result.error || !Array.isArray(result.data)) {
    return {
      data: [],
      instructors: instructorResult.data,
      source: result.placeholder ? "placeholder" : "supabase-error",
      error: result.error
    };
  }

  const favourites = result.data.map((item) => ({
    id: item.id,
    instructorSlug: item.instructor_slug,
    createdAt: item.created_at
  }));

  return {
    data: favourites.map((favourite) => ({
      ...favourite,
      instructor: instructorResult.data.find(
        (instructor) => instructor.slug === favourite.instructorSlug
      )
    })),
    instructors: instructorResult.data,
    source: "supabase",
    error: null
  };
}

export async function addFavourite(userId, instructorSlug) {
  const result = await insertWithServiceRole("favourites", {
    learner_clerk_user_id: userId,
    instructor_slug: instructorSlug
  });

  if (result.placeholder) {
    return {
      ok: true,
      mode: "development",
      favourite: { instructorSlug }
    };
  }

  if (result.error) {
    return {
      ok: false,
      status: 500,
      error: "Favourite could not be saved."
    };
  }

  return {
    ok: true,
    mode: "supabase",
    favourite: result.data?.[0] || result.data
  };
}

export async function removeFavourite(userId, instructorSlug) {
  const result = await deleteWithServiceRole(
    `favourites?learner_clerk_user_id=eq.${encode(userId)}&instructor_slug=eq.${encode(instructorSlug)}`
  );

  if (result.placeholder || !result.error) {
    return {
      ok: true,
      mode: result.placeholder ? "development" : "supabase"
    };
  }

  return {
    ok: false,
    status: 500,
    error: "Favourite could not be removed."
  };
}

function normalizeLogbookEntry(row) {
  return {
    id: row.id,
    date: row.date,
    durationMinutes: Number(row.duration_minutes) || 0,
    instructorSlug: row.instructor_slug || "",
    instructorName: row.instructor_name || "",
    suburb: row.suburb || "",
    skillsPracticed: toArray(row.skills_practiced),
    notes: row.notes || "",
    supervisorType: row.supervisor_type || "instructor",
    verified: Boolean(row.verified),
    createdAt: row.created_at || new Date().toISOString()
  };
}

export async function getLearnerLogbook(userId) {
  const result = await selectWithServiceRole(
    `learner_logbook_entries?learner_clerk_user_id=eq.${encode(userId)}&select=*&order=date.desc`
  );

  if (result.placeholder || result.error || !Array.isArray(result.data)) {
    return {
      data: [],
      totalMinutes: 0,
      source: result.placeholder ? "placeholder" : "supabase-error",
      error: result.error
    };
  }

  const data = result.data.map(normalizeLogbookEntry);

  return {
    data,
    totalMinutes: data.reduce((total, item) => total + item.durationMinutes, 0),
    source: "supabase",
    error: null
  };
}

export async function createLogbookEntry(userId, body) {
  const payload = {
    learner_clerk_user_id: userId,
    date: body?.date,
    duration_minutes: Number(body?.durationMinutes || body?.duration_minutes) || 0,
    instructor_slug: body?.instructorSlug || "",
    instructor_name: body?.instructor || body?.instructorName || "",
    suburb: body?.suburb || "",
    skills_practiced: toArray(body?.skillsPracticed || body?.skills_practiced),
    notes: body?.notes || "",
    supervisor_type: body?.supervisorType || body?.supervisor_type || "instructor",
    verified: false
  };

  if (!payload.date || payload.duration_minutes <= 0) {
    return {
      ok: false,
      status: 400,
      error: "Date and duration are required."
    };
  }

  const result = await insertWithServiceRole("learner_logbook_entries", payload);

  if (result.placeholder) {
    return {
      ok: true,
      mode: "development",
      entry: normalizeLogbookEntry({
        id: `local-${Date.now()}`,
        ...payload,
        created_at: new Date().toISOString()
      })
    };
  }

  if (result.error) {
    return {
      ok: false,
      status: 500,
      error: "Logbook entry could not be saved."
    };
  }

  return {
    ok: true,
    mode: "supabase",
    entry: normalizeLogbookEntry(result.data?.[0] || result.data)
  };
}

export async function getInstructorSubscriptionStatus(userId) {
  const ownership = await getClaimedInstructorSlugsForUser(userId);
  const instructorSlug = ownership.data[0] || "";

  if (!instructorSlug) {
    return {
      source: ownership.source,
      instructorSlug: "",
      subscription: null,
      featuredListing: null
    };
  }

  const [subscriptionResult, featuredResult] = await Promise.all([
    selectWithServiceRole(
      `subscriptions?instructor_slug=eq.${encode(instructorSlug)}&select=*&order=created_at.desc&limit=1`
    ),
    selectWithServiceRole(
      `featured_listing_orders?instructor_slug=eq.${encode(instructorSlug)}&select=*&order=created_at.desc&limit=1`
    )
  ]);

  return {
    source:
      subscriptionResult.placeholder || featuredResult.placeholder
        ? "placeholder"
        : "supabase",
    instructorSlug,
    subscription: subscriptionResult.data?.[0] || null,
    featuredListing: featuredResult.data?.[0] || null
  };
}

export async function recordPlatformEvent({
  actorUserId = "",
  actorRole = "",
  eventType,
  entityType = "",
  entityId = "",
  metadata = {}
}) {
  if (!eventType) {
    return {
      ok: false,
      error: "Missing event type."
    };
  }

  const result = await insertWithServiceRole("platform_events", {
    actor_clerk_user_id: actorUserId || null,
    actor_role: actorRole || null,
    event_type: eventType,
    entity_type: entityType || null,
    entity_id: entityId || null,
    metadata
  });

  return {
    ok: !result.error,
    mode: result.placeholder ? "development" : "supabase",
    error: result.error
  };
}

async function getCount(path) {
  const result = await countWithServiceRole(path);

  return result.count || 0;
}

function summarizeFilters(rows) {
  const counts = {};

  rows.forEach((row) => {
    const filters = row.filters || {};
    [
      filters.licenceType,
      filters.transmission,
      filters.language,
      filters.gender,
      filters.testCentre
    ]
      .filter(Boolean)
      .forEach((filter) => {
        counts[filter] = (counts[filter] || 0) + 1;
      });
  });

  return Object.entries(counts)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 8)
    .map(([label, count]) => ({ label, count }));
}

export async function getAdminAnalytics() {
  const logsResult = await selectWithServiceRole(
    "search_logs?select=suburb,filters,created_at&order=created_at.desc&limit=500"
  );
  const eventResult = await selectWithServiceRole(
    "platform_events?select=event_type,created_at&order=created_at.desc&limit=500"
  );

  if (logsResult.placeholder || logsResult.error || !Array.isArray(logsResult.data)) {
    return {
      source: "placeholder",
      searchesToday: 0,
      topSuburbs: [],
      topFilters: [],
      contactAttempts: 0,
      claimSubmissions: 0,
      reviewSubmissions: 0,
      bookingsPending: 0,
      bookingsConfirmed: 0,
      conversionEstimate: "Supabase analytics unavailable"
    };
  }

  const today = new Date().toISOString().slice(0, 10);
  const todaysLogs = logsResult.data.filter((row) =>
    String(row.created_at || "").startsWith(today)
  );
  const suburbCounts = todaysLogs.reduce((counts, row) => {
    const suburb = row.suburb || "Unknown";
    counts[suburb] = (counts[suburb] || 0) + 1;
    return counts;
  }, {});
  const events = Array.isArray(eventResult.data) ? eventResult.data : [];
  const [
    bookingsPending,
    bookingsConfirmed,
    claimSubmissions,
    reviewSubmissions
  ] = await Promise.all([
    getCount("bookings?select=id&status=eq.pending"),
    getCount("bookings?select=id&status=eq.confirmed"),
    getCount("profile_claims?select=id&status=eq.pending"),
    getCount("reviews?select=id&status=eq.pending")
  ]);
  const contactAttempts = events.filter(
    (event) => event.event_type === "contact_instructor"
  ).length;
  const conversionRate =
    todaysLogs.length > 0
      ? `${Math.round(((contactAttempts + bookingsPending + bookingsConfirmed) / todaysLogs.length) * 100)}%`
      : "No search volume today";

  return {
    source: "supabase",
    searchesToday: todaysLogs.length,
    topSuburbs: Object.entries(suburbCounts)
      .sort((left, right) => right[1] - left[1])
      .slice(0, 8)
      .map(([suburb, searches]) => ({ suburb, searches })),
    topFilters: summarizeFilters(todaysLogs),
    contactAttempts,
    claimSubmissions,
    reviewSubmissions,
    bookingsPending,
    bookingsConfirmed,
    conversionEstimate: conversionRate
  };
}
