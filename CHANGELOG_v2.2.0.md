# Kameen v2.2.0 — clarity, security, life

## Fixes
- **Pedestrians were never drawn** (the layer was updated but not rendered) — now visible on both walkways.
- **Repeated questions**: a question fades out once asked; the driver never repeats the same line within a case.
- **Radio sounds**: squelch/static/beep on every dispatch log line and radio reply (not only banners).
- **Assets vanishing after the barrier opens**: the depth-of-field blur and the cast shadows no longer use per-frame canvas filters — blurred backdrops are cached per zoom step and shadows use cached silhouettes.
- **Salary**: computed right after the shift closes (before any daily/free merge) and paid through the wallet; payslip on the report.
- Loading text now just says "Loading…".

## Officers — your new 7-row sheets (same file names officer_c0..c3.png)
- idle / hand / stop / pass / radio / running / **normal walk**. Calm moves use the real walk cycle; running only when far, hurrying or in rush hour. Cast shadows in game and on the (zoomed-out) menu.

## Broken vehicles
- A stalled car gets the same treatment as the gate and generator: pulsing ring → push it aside (10 s), call a tow (20 s, 10 s with the tow contract), or ask the sergeant.

## Shift clarity
- Progress bar over the world: elapsed %, time left, cases closed, "Then: shift report & payslip"; heads-up at 5 minutes and 1 minute; report toast explains the shift ended.

## Economy
- Money for every grounded search (base + consent + items + cues); searches without grounds pay nothing.
- Shop expanded: body camera, tow contract, speed radar (auto-tickets +120 EGP), surveillance drone (previews the next case family), aviator shades (+8 patience), custom siren.

## Search flow
- At the marker only a **quick trunk/cargo check**; the full search (driver frisk, cabin, seats, glovebox, underbody) needs the inspection bay.

## Drivers
- 20 new portraits (56 faces total). Faces and vehicle types are not repeated while the pools allow (last 14 faces / last 7 types).

## Cheat detection engine
- Saves are obfuscated + signed. Watchers on money/XP trip on any jump larger than the game can hand out; a tampered save or runtime edit → 30-minute ban, values rolled back to the last signed save, ban screen with countdown and an unban code entry (dev code: Monalisa).

## Environment
- Location particles: sand streaks (desert/Sinai), sea sparkle (Alexandria/Hurghada), warm haze (Cairo/Luxor/Aswan), plus existing motes and embers.
