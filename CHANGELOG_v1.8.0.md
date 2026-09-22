# Kameen v1.8.0 — cinematic look, realistic officers, repair interaction, futuristic menu

## Camera & scene
- **Depth of field**: the backdrop now blurs like a long lens as the camera zooms into the lane (0.6 px wide → ~4 px close-up); vehicles, officers and props stay razor sharp. Backdrop scale raised to 50 m so wall blocks, pavement and vehicles sit in proportion.
- **Real cast shadows** for every officer (player, partner, sergeant, supervisor): the sprite itself flattened and skewed along the ground, blurred — long sun shadows by day, short floodlight shadows by night — on top of the soft contact shadow. (Falls back to the contact shadow on browsers without canvas filters.)
- **Calm ambient particles**: sun-lit dust motes by day, drifting embers by night, a few sparks on the menu. Low count, slow, respects the reduced-effects setting.

## Officers move like people
- Walking vs running: the player and partner now **walk** (radio-walk cycle) for normal moves; the player only **runs** when the target is more than 5.5 m away, during rush hour, or when hurrying. Staff run only to breakdowns.
- Everything from v1.7 kept: state-driven poses, sergeant/supervisor AI, driver reaction bubbles.

## Repair is now an interaction
- Gate motor, generator and cone tasks open a **timing bar**: tap (or Space/Enter) when the needle is in the green. 3 clean hits → job finishes at 2.2× speed, +25 XP "Fixed fast!", confetti; misses slow the job down.

## Menu — centered, static, futuristic
- Logo centered and **no longer follows the mouse**; glass panel with gold light leak and edge highlight; shine sweep on the PLAY button; **daily reward chest** (claim once a day, grows with your login streak) with a spark burst.

## Simpler panels
- Any option list longer than 6 shows the 5 most relevant buttons and tucks the rest behind one "More ▾".

## Responsive
- UI type scales with the viewport (phone → laptop → 4K read the same); ultra-wide screens get a centred dock; short screens hide non-essential menu rows.

## Housekeeping
- Version 1.8.0 in every script, cache-busted, shown in the menu footer.
