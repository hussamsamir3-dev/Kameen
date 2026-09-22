# Kameen v1.5.0 — officers, alignment, pulse

## Officers (replaced everywhere)
- New sheet `assets/officer_new_sprites.png` sliced into 72 frames (4 characters × run/stop/wave/idle/radio). Old 4 officer sheets removed (−6 MB).
- Every legacy sprite id (`ofi_*`, `ofw_*`, `officer_*`) now points at the new art → main menu, gameplay and upgrade icons all use it.
- Player = navy officer; partner = white officer. Animated: run cycle, raise→stop hand, animated wave on release, radio on verification, reading the papers while a case panel is open beside the car, torch pose at night.
- Two new AI crew (`js/23_staff.js`): a navy sergeant on the far side (second stop hand on approaching traffic, wave when the barrier lifts, radio after a big case, walks to the gate cabinet / generator when they fail, patrols) and a white supervisor running the inspection bay (attends the car in the bay: papers / torch / radio, patrols the bay edge).
- Menu diorama shows the full crew.

## Zoom / alignment fix
- Backdrop is now anchored in world metres like the road and props (fixed 46 m width, road line pinned, 80% parallax, edge fill). It scales with every zoom level and matches on desktop, tablet and phone. Previously it was sized from the screen width, which is why props drifted when zooming.

## Pulse (`js/24_pulse.js`)
- Wanted vehicle: dispatch broadcasts a plate; a real match or a one-letter near-miss arrives later. Catching the real one by the book: +140 XP, stamp, siren, confetti; waving it through: trust −3, combo lost. Near-miss handled correctly: +45 XP.
- Rush hour: 70 s surge, case XP ×1.5, live countdown pill.
- Pacing: cars now arrive every 14–26 s (Cairo) / 18–34 s (others), tightening with rank (was 21–48 s).
- Juice: hit-stop + flash + shake on serious catches, 5×/10× combo stamps, live XP-multiplier pill.

## Housekeeping
- Version 1.5.0 stamped in every file; `index.html` cache-busted (`?v=1.5.0.0922`). Upload the whole folder.
