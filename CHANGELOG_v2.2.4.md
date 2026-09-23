# Kameen v2.2.4 — the frame-blank bug, found and fixed
- **Assets disappearing for a frame on every case check**: two exceptions were thrown mid-frame, aborting the rest of that frame's drawing.
  1. The driver-reaction bubble renderer called `.split` on a bilingual text object (thrown on every case close).
  2. During rain, the base game pushed splashes into an array that was never initialised.
  Both fixed. In addition, every entity draw and every UI hook is now individually guarded: a failing hook is logged once and skipped, so no single error can ever blank a frame again. Verified with a 10-minute simulated shift including rain, waves and case closes — zero errors.
- **Menu crew**: the sergeant no longer appears huge and cut off at the left edge; he stands by the booth on the far pavement at depth scale, officer and partner at the barrier.
