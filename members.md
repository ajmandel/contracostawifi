# members.html design notes

## Purpose
This page supports the Contra Costa WiFi website experience for **Members**.

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

## Members-specific decisions
- OAuth buttons are presented as roadmap items while email auth is fully functional in-browser.
- Post-login layout is organized around floorplan, billing, security posture, and expert chat entry.
- Authentication UI includes sign-in, registration, reset-code generation, and password update views.
