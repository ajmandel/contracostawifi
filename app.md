# app.js design notes

## Purpose
This script supports the Contra Costa WiFi website experience for **App**.

## UX / content intent
- Keep the message plain-language and action-oriented.
- Preserve visual consistency with the dark top nav, gradient accents, and rounded cards.
- Prioritize conversion paths (assessment, plans, contact, or member actions).

## Technical intent
- Stay static-host friendly (no required backend runtime on page load).
- Use progressive enhancement so core content is visible without JavaScript.
- Prefer shared styles and shared JS behavior to reduce duplication drift.

## Maintenance notes
- If you change nav labels/routes here, mirror them across other pages for consistency.
- Keep copy factual and geographically aligned with Contra Costa service messaging.

## Script-specific decisions
- Includes shared behavior (mobile nav, reveal animations, FAQ accordion, pricing toggle, counters).
- Implements email auth service with PBKDF2 hashing, lockout counters, session persistence, and reset tokens stored in localStorage for static-host demos.
- OAuth providers intentionally return a status message until server-side callbacks are integrated.
