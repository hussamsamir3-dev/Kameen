# Kameen v2.1.0 — economy, wanted board, new vehicles, pedestrians, painted streets

## Bugs fixed
- **Rank lost after a shift**: daily-challenge and free shifts copied your career XP in but never wrote it back. They now merge XP, money and mail into the career save (toast: "XP and money added to your career").
- **Radio sound effects**: every dispatch message (📻 / 🚨 / 📷) now has a squelch, static bed and end beep; radio replies too.
- **Assets vanishing for a frame on zoom changes**: the depth-of-field blur is now quantised to half-pixel steps and skipped below 0.75 px, so the canvas filter no longer re-rasterises every frame.
- **False document flags**: only perk/assist flagging remains, limited to the first true discrepancy; the docs panel never flags a field that is not actually different.
- **Top bar**: compact type, tighter padding, pill backgrounds, optional items hidden on narrow screens — no more overlap.

## Economy (EGP)
- Wallet on the career, shown in the HUD. **Salary every shift** with an itemised payslip on the report: rank base, performance (score above 50 × 12), clean record, directives kept, daily streak, warrant rewards, minus complaints.
- **Shop** (menu card): Modern radio (verification 25% faster), LED floodlights (brighter nights), Booth AC (partner 20% faster), Coffee thermos (one-shift +20 s combo timer, stackable), Plate-reader camera (alert when a wanted plate rolls in), Gold nameplate trim. Rank-gated tiers.

## Wanted board
- Three live warrants with face, name, charge, vehicle, plate and reward (800–2500 EGP). The wanted-vehicle event now draws from the board (matching plate, vehicle, name and face); an arrest pays the reward, stamps it on screen and rolls a new warrant. HUD 🚨 button and menu card open the board.

## Vehicles (your sheet)
- Nine new civilians: Suzuki Swift, Chery Arrizo, MG ZS, Toyota Hilux double-cab, Bajaj tuk-tuk, delivery motorbike, Honda motorbike, Chevrolet van, Isuzu NPR box truck — same physics and wheel rules as the originals (body + rotating wheel cut from the body at the axle), realistic lengths (2.1–6.5 m), per-location spawn weights, search zones, Arabic/English names.

## Pedestrians (your sheets)
- 25 distinct people walk the far pavement and the near walkway: no duplicates on screen, spacing kept, they pause for officers and each other, stop and look when a siren or wanted car arrives, drift off at the edges. 8-frame stride locked to distance (no sliding), cast shadows, night-aware.

## Painted street
- Road texture tiles replaced by a procedural asphalt band tinted from the backdrop (kerb line, sheen, centre dashes in world metres). Toggle in the menu's "More" if you prefer the textures.

## Search (body, trunk, complications)
- New zones: **Frisk** and **Underbody** (not for bikes/tuk-tuks). Drivers with low cooperation may **refuse** a search: request dispatch authorisation over the radio (15 s), insist on your logged reason (invalid reason → trust −3 and a complaint), or back off. Frisk/underbody can reveal a cue (hard object in the jacket, fresh welding on the floor pan).

## Housekeeping
- Version 2.1.0 everywhere; new files js/29_world.js, js/30_economy.js; manifest updated (39 vehicles, 683 sprites).
