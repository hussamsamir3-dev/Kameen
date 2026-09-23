# Kameen v2.3.0 — device profiles & phone layouts
- **Device picker** on first launch and from the menu (📐): iPhone / iPhone Pro Max / iPad / Desktop / Auto. Sets UI scale, layout profile and orientation preference.
- **Mismatched taps in portrait — fixed at the root**: the game is now sized from the *visual* viewport (iOS Safari toolbar, keyboard, rotation) and re-measured on every viewport change with iOS's late-layout retries; pointer → canvas mapping is scale-corrected so taps always land where things are drawn. Verified on iPhone 15 Pro Max in both orientations: canvas logical size = CSS size.
- **Portrait restack (phones)**: two-row compact HUD, world on top (38–44%), coach line, two-column dock with big buttons, panels as bottom sheets.
- **Landscape phones**: one-row HUD, slim dock, coach/strip hidden, the world gets the height.
- **Rotate prompt** on phones in portrait with "Fullscreen" (also tries to lock landscape) or "Play in portrait".
- Safe-area insets (notch / home indicator) padded into HUD and dock; Pro Max profile gets larger buttons.
