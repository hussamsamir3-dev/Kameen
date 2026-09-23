# Kameen v2.2.1 — officer animation & scale
- **Label text gone**: the sheet labels overlap column 0 of every row, so column 0 is no longer used — each row plays frames 1–7 (7 frames).
- **No more shrinking**: every row is normalised to its own reference height (the walk row is only 81% of the idle row in the source), so an officer keeps the same height while walking, running, stopping, waving or on the radio.
- **Realistic walk**: one full gait cycle (both legs) covers a fixed 1.35 m walking / 1.9 m running, so feet never slide and the cycle plays start-to-end smoothly at the officer's speed. Verified frame by frame (0→6→0).
- **Taller humans**: officer 2.55, partner 2.48, sergeant 2.3, supervisor 2.42, pedestrians 2.2–2.3 (drawn metres) — a walking officer now stands a head above an SUV roof.
- **Pedestrians**: far corniche pavement only (behind the police car, sign and booth), at most 3 on desktop / 2 on mobile, spawning every 16–38 s, 8-frame stride locked to distance.
- Fixed the "push it aside" / "fix myself" walk targets (wrong call signature).
