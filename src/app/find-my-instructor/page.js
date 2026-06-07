"use client";

import Link from "next/link";
import { useState } from "react";
import { instructors } from "@/data/instructors";

const steps = [
  {
    key: "suburb",
    title: "Where do you want lessons?",
    description: "Enter the suburb or postcode where you want to find an instructor."
  },
  {
    key: "transmission",
    title: "Which transmission do you prefer?",
    description: "Choose automatic, manual, or both."
  },
  {
    key: "specialNeeds",
    title: "Do you have any special learning needs?",
    description: "Select anything that matters for your learning style."
  },
  {
    key: "days",
    title: "Which days suit you best?",
    description: "Choose your preferred lesson days."
  },
  {
    key: "budget",
    title: "What is your maximum hourly budget?",
    description: "This helps us recommend instructors within your price range."
  }
];

function getSuburbSlug(suburb) {
  return suburb.toLowerCase().replaceAll(" ", "-");
}

function getInstructorRateNumber(rate) {
  return Number(String(rate).replace(/[^0-9.]/g, "")) || 0;
}

function getMatchReason(instructor, answers) {
  const instructorRate = getInstructorRateNumber(instructor.rate);
  const userBudget = Number(answers.budget);

  if (instructorRate <= userBudget) {
    if (
      answers.specialNeeds.includes("Anxiety Friendly") &&
      instructor.anxietyFriendly
    ) {
      return `${instructor.name} is a strong match because they support nervous learners, teach around ${instructor.suburb}, and fit within your budget.`;
    }

    if (
      answers.specialNeeds.includes("International Licence") &&
      instructor.internationalLicence
    ) {
      return `${instructor.name} is suitable because they support international licence conversion learners and fit within your budget.`;
    }

    if (answers.transmission && instructor.transmission === answers.transmission) {
      return `${instructor.name} matches your ${answers.transmission.toLowerCase()} transmission preference and budget range.`;
    }

    return `${instructor.name} is recommended based on location, rating, learner-friendly profile details, and budget fit.`;
  }

  return `${instructor.name} is a possible match, but the hourly rate may be above your selected budget.`;
}

function instructorMatchesTransmission(instructor, transmission) {
  if (!transmission || transmission === "Both") {
    return true;
  }

  return (
    instructor.transmission === transmission ||
    instructor.transmission === "Both"
  );
}

function getMatchScore(instructor, answers) {
  const instructorRate = getInstructorRateNumber(instructor.rate);
  const userBudget = Number(answers.budget) || 150;
  let score = Number(instructor.rating) || 0;

  if (instructorRate <= userBudget) {
    score += 2;
  }

  if (instructorMatchesTransmission(instructor, answers.transmission)) {
    score += 2;
  }

  if (
    answers.specialNeeds.includes("Anxiety Friendly") &&
    instructor.anxietyFriendly
  ) {
    score += 2;
  }

  if (
    answers.specialNeeds.includes("International Licence") &&
    instructor.internationalLicence
  ) {
    score += 2;
  }

  if (
    answers.days.length > 0 &&
    answers.days.some((day) => instructor.availability.includes(day))
  ) {
    score += 1;
  }

  return score;
}

function getLocalMatches(answers) {
  return [...instructors]
    .sort((left, right) => {
      const scoreDifference = getMatchScore(right, answers) - getMatchScore(left, answers);

      if (scoreDifference !== 0) {
        return scoreDifference;
      }

      return Number(right.rating) - Number(left.rating);
    })
    .slice(0, 3)
    .map((instructor) => ({
      id: instructor.slug,
      reason: getMatchReason(instructor, answers)
    }));
}

export default function FindMyInstructorPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [matchStatus, setMatchStatus] = useState("idle");
  const [matchMode, setMatchMode] = useState("local-fallback");
  const [matches, setMatches] = useState([]);

  const [answers, setAnswers] = useState({
    suburb: "",
    transmission: "",
    specialNeeds: [],
    days: [],
    budget: "90"
  });

  const current = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  function updateAnswer(key, value) {
    setAnswers((previous) => ({
      ...previous,
      [key]: value
    }));
  }

  function toggleArrayAnswer(key, value) {
    setAnswers((previous) => {
      const currentValues = previous[key];

      if (currentValues.includes(value)) {
        return {
          ...previous,
          [key]: currentValues.filter((item) => item !== value)
        };
      }

      return {
        ...previous,
        [key]: [...currentValues, value]
      };
    });
  }

  async function loadMatches() {
    setMatchStatus("loading");

    try {
      const response = await fetch("/api/ai/match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          suburb: answers.suburb,
          transmission: answers.transmission,
          special_needs: answers.specialNeeds,
          available_days: answers.days,
          max_hourly_rate: Number(answers.budget),
          instructors
        })
      });
      const data = await response.json();

      if (!response.ok || !Array.isArray(data.matches)) {
        throw new Error("Match request failed");
      }

      setMatches(data.matches.slice(0, 3));
      setMatchMode(data.mode || "local-fallback");
    } catch {
      setMatches(getLocalMatches(answers));
      setMatchMode("local-fallback");
    } finally {
      setMatchStatus("idle");
      setShowResults(true);
    }
  }

  function goNext() {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      return;
    }

    loadMatches();
  }

  function goBack() {
    if (showResults) {
      setShowResults(false);
      setCurrentStep(steps.length - 1);
      return;
    }

    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }

  const recommendedInstructors = matches
    .map((match) => {
      const instructor = instructors.find(
        (item) => item.slug === match.id || item.id === match.id
      );

      if (!instructor) {
        return null;
      }

      return {
        instructor,
        reason: match.reason || getMatchReason(instructor, answers)
      };
    })
    .filter(Boolean);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-2xl font-bold text-blue-700">
            LCarDrive
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-700 md:flex">
            <Link href="/search" className="hover:text-blue-700">
              Find Instructors
            </Link>

            <Link href="/find-my-instructor" className="text-blue-700">
              AI Match
            </Link>

            <Link href="/portal" className="hover:text-blue-700">
              Instructor Portal
            </Link>

            <Link href="/admin" className="hover:text-blue-700">
              Admin
            </Link>
          </nav>

          <Link
            href="/"
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Home
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-700">
            AI Instructor Match
          </p>

          <h1 className="text-4xl font-bold">
            Find your best instructor match
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            Answer 5 simple questions. We will recommend suitable instructors based on your location,
            transmission preference, learner needs, preferred days, and budget.
          </p>
        </div>

        {!showResults && (
          <div className="mx-auto max-w-3xl rounded-3xl border bg-white p-6 shadow-sm">
            <div className="mb-6">
              <div className="mb-2 flex justify-between text-sm text-slate-500">
                <span>
                  Question {currentStep + 1} of {steps.length}
                </span>

                <span>{Math.round(progress)} percent complete</span>
              </div>

              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-blue-600"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <h2 className="text-2xl font-bold">
              {current.title}
            </h2>

            <p className="mt-2 text-slate-600">
              {current.description}
            </p>

            <div className="mt-6">
              {current.key === "suburb" && (
                <input
                  type="text"
                  value={answers.suburb}
                  onChange={(event) => updateAnswer("suburb", event.target.value)}
                  aria-label="Lesson suburb or postcode"
                  placeholder="Example: Footscray"
                  className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-600"
                />
              )}

              {current.key === "transmission" && (
                <div className="grid gap-3 md:grid-cols-3">
                  {["Auto", "Manual", "Both"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => updateAnswer("transmission", item)}
                      className={
                        answers.transmission === item
                          ? "rounded-xl bg-blue-600 px-4 py-4 font-semibold text-white"
                          : "rounded-xl border px-4 py-4 font-semibold text-slate-700 hover:border-blue-600 hover:text-blue-700"
                      }
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}

              {current.key === "specialNeeds" && (
                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    "Anxiety Friendly",
                    "International Licence",
                    "Beginner Learner",
                    "No Special Need"
                  ].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleArrayAnswer("specialNeeds", item)}
                      className={
                        answers.specialNeeds.includes(item)
                          ? "rounded-xl bg-blue-600 px-4 py-4 font-semibold text-white"
                          : "rounded-xl border px-4 py-4 font-semibold text-slate-700 hover:border-blue-600 hover:text-blue-700"
                      }
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}

              {current.key === "days" && (
                <div className="grid gap-3 md:grid-cols-4">
                  {[
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday"
                  ].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleArrayAnswer("days", item)}
                      className={
                        answers.days.includes(item)
                          ? "rounded-xl bg-blue-600 px-4 py-4 font-semibold text-white"
                          : "rounded-xl border px-4 py-4 font-semibold text-slate-700 hover:border-blue-600 hover:text-blue-700"
                      }
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}

              {current.key === "budget" && (
                <div>
                  <input
                    type="range"
                    min="10"
                    max="150"
                    value={answers.budget}
                    onChange={(event) => updateAnswer("budget", event.target.value)}
                    aria-label="Maximum hourly budget"
                    className="w-full"
                  />

                  <div className="mt-4 rounded-xl bg-blue-50 p-5 text-center">
                    <p className="text-sm font-semibold text-slate-600">
                      Maximum hourly budget
                    </p>

                    <p className="mt-1 text-3xl font-bold text-blue-700">
                      ${answers.budget}/hr
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={goBack}
                disabled={currentStep === 0}
                className="rounded-xl border px-5 py-3 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Back
              </button>

              <button
                type="button"
                onClick={goNext}
                disabled={matchStatus === "loading"}
                className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
              >
                {matchStatus === "loading"
                  ? "Finding Matches..."
                  : currentStep === steps.length - 1
                    ? "Show Matches"
                    : "Next"}
              </button>
            </div>
          </div>
        )}

        {showResults && (
          <div>
            <div className="mb-6 rounded-3xl border bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold">
                    Your top instructor matches
                  </h2>

                  <p className="mt-2 text-slate-600">
                    {matchMode === "anthropic"
                      ? "These recommendations were generated server-side from your answers."
                      : "These recommendations use local fallback matching because the AI service is not configured or did not respond."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={goBack}
                  className="rounded-xl border px-5 py-3 font-semibold text-slate-700 hover:border-blue-600 hover:text-blue-700"
                >
                  Edit Answers
                </button>
              </div>
            </div>

            {recommendedInstructors.length === 0 && (
              <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
                <h3 className="text-xl font-bold">
                  No instructors found within this budget
                </h3>

                <p className="mx-auto mt-2 max-w-xl text-slate-600">
                  Your selected budget is ${answers.budget}/hr. Try increasing your hourly budget
                  or changing your transmission preference.
                </p>

                <button
                  type="button"
                  onClick={goBack}
                  className="mt-5 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  Edit Budget
                </button>
              </div>
            )}

            {recommendedInstructors.length > 0 && (
              <div className="grid gap-5 md:grid-cols-3">
                {recommendedInstructors.map(({ instructor, reason }) => (
                  <Link
                    key={instructor.slug}
                    href={`/instructors/${getSuburbSlug(instructor.suburb)}/${instructor.slug}`}
                    className="rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="mb-4 flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
                        {instructor.name.charAt(0)}
                      </div>

                      <div>
                        <h3 className="text-xl font-bold">
                          {instructor.name}
                        </h3>

                        <p className="text-sm text-slate-600">
                          {instructor.suburb} • {instructor.distance}
                        </p>

                        <p className="mt-1 text-sm text-amber-600">
                          ★ {instructor.rating} • {instructor.reviews} reviews
                        </p>
                      </div>
                    </div>

                    <div className="mb-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {instructor.transmission}
                      </span>

                      {instructor.verified && (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                          Verified
                        </span>
                      )}

                      {instructor.anxietyFriendly && (
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                          Anxiety Friendly
                        </span>
                      )}

                      {instructor.internationalLicence && (
                        <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                          International Licence
                        </span>
                      )}
                    </div>

                    <div className="rounded-xl bg-blue-50 p-4">
                      <p className="text-sm font-semibold text-blue-900">
                        Match reason
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {reason}
                      </p>
                    </div>

                    <div className="mt-4 border-t pt-4">
                      <p className="font-bold text-slate-900">
                        {instructor.rate}
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        {instructor.packagePrice}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
