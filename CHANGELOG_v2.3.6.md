# Kameen v2.3.6 — animation and shadows, done properly
- **Cross-fade removed** (it made figures translucent).
- **Standing = idle only**: the hand-fidget row never plays; officers, partner and staff breathe in idle until they move or perform an action (stop / pass / radio / papers).
- **Moving = walk; running only when it matters** (target more than 6.5 m away, hurrying to a breakdown, rush hour).
- **No mid-stride freeze**: when a figure stops, the stride keeps advancing until it lands on a legs-together frame, then it stands; verified frame by frame (walk_2 → walk_3 → idle). Applies to the officer, partner and staff; pedestrians never stop.
- **Directional shadows** replace every point/ellipse shadow in the game (vehicles, props, structures, figures): by day the sun sits high to the right and shadows stretch left; by night the nearest floodlight casts them away from itself and shorter; soft radial edges.
