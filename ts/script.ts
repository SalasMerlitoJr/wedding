/**
 * Merlito & Daisa — Wedding Invitation
 * TypeScript source. Compile with `tsc` (see tsconfig.json) to produce
 * ../js/script.js, which is what index.html actually loads.
 *
 * npm install && npm run build
 */

export interface RSVPResponse {
  name: string;
  email: string;
  phone: string;
  guests: string;
  attendance: "joyfully-accept" | "regretfully-decline";
  message: string;
  submittedAt: string;
}

export interface GuestbookEntry {
  name: string;
  message: string;
}

export type Validator = (value: string) => string;

export const WEDDING_DATE: Date = new Date("2027-02-14T14:00:00+08:00");
export const VENUE_QUERY: string = "Sage and Ivory Garden Estate, Carmen, Cagayan de Oro City";

export function validateName(value: string): string {
  return value.trim().length >= 2 ? "" : "Please enter your full name.";
}

export function validateEmail(value: string): string {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
    ? ""
    : "Please enter a valid email address.";
}

export function validatePhone(value: string): string {
  return /^[0-9+()\-\s]{7,15}$/.test(value.trim())
    ? ""
    : "Please enter a valid contact number.";
}

export function validateGuestCount(value: string): string {
  return value ? "" : "Please select the number of guests.";
}

export function getCountdown(target: Date, now: Date = new Date()) {
  const diff = Math.max(0, target.getTime() - now.getTime());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

/**
 * NOTE: The full DOM wiring (nav, gallery, lightbox, RSVP form, guestbook,
 * theme toggle, canvas particles) lives in js/script.js as plain ES6 for
 * zero-build-step deployment. The pure logic above is unit-testable and
 * mirrors what the compiled bundle uses for validation and the countdown.
 * Swap js/script.js for a bundled output of this file if you wire up a
 * TypeScript build step in your deployment pipeline.
 */
