# Kameen v1.7.0 — full experience revamp (includes everything from v1.6.0, which was never deployed)

## Officers — your 4 new sheets, replaced everywhere
- `assets/officer_c0..c3.png`: navy officer (player), white officer (partner), navy senior (sergeant, far side), white senior (bay supervisor). 190 frames sliced on the true grid, label text stripped, foot anchors measured. Old sheets removed.
- Every legacy sprite id re-pointed → menu, gameplay and icons all use the new art.
- Animation by state: breathing idle + hand fidget every ~13 s; stop = raise → hold (breathing) → lower; 8-step allow-to-pass wave; talking radio; reading the papers whenever a case panel is open beside the car; torch pose; 8-frame run. Staff patrol with the calm radio-walk and break into a run to reach a jammed gate / dead generator.
- AI crew: sergeant gives a second stop hand to approaching cars, waves when the barrier lifts, radios after big cases, repairs the gate cabinet / generator; supervisor attends any car in the bay (papers / torch / radio) and patrols the bay edge.

## Backdrop linked to zoom
- World-anchored backdrop (scales with road and props at every zoom on every screen size) and switches to the crisp unblurred image above 1.18× zoom.

## Addictive loop
- **Coach line** above the dock: one plain sentence telling the player the next step (tap the car → check → greet → papers → verify → decide → bay search). Hides once they are experienced.
- **Combo pressure**: combo fades after 55 s without a sound decision (countdown pill).
- **Double-or-nothing** at ×5 / ×10 / ×15 combo: bet the streak — next call ×3 XP or −150 XP.
- **Supervisor inspection** (80 s): sound calls ×2 XP, mistakes −60 XP; "PERFECT CALL!" stamps.
- **Final sprint**: last 90 s of every shift pays ×2 XP.
- **Wanted vehicle hunt**, **rush hour ×1.5**, faster traffic that tightens with rank, hit-stop / flash / shake on serious catches, ×5 / ×10 combo stamps, live multiplier pill.
- **High-stakes radio situations**: bribe attempt, "do you know who I am?", driver tip-off, dispatch paperwork — bad choices cost XP and trust.

## Dialogue
- **Driver reactions**: every closed case gets a spoken line above the car, by decision × personality (patient / chatty / anxious / impatient / defensive) — 70 new lines.
- Small talk expanded: football, petrol prices, the heat, the new road — with personality-specific replies.

## Menu & UI (fewer boxes, teen-friendly)
- New menu: rank ring with XP-to-next, best score / shifts / big catches / streak, one hero PLAY button (continue or new), daily-challenge card, compact icon row, version in footer.
- Larger rounded tap targets, primary actions glow while secondary recede, objectives panel auto-dims, calmer dock/panel surfaces, restyled dialogue.

## Sound
- Calm tactile clicks on every button, soft panel whoosh, radio static under dispatch banners, engine idle hum for the car at the marker, warmer chimes, realistic stamp thud and paper shuffle.
