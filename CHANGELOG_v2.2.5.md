# Kameen v2.2.5 — wallet & save fixes
- **Empty wallet**: daily-challenge and free shifts ran on a copy of the career that started with 0 EGP, so the HUD showed 0 and money earned there (search fees, radar, fines) was lost. The copy now starts with your real wallet, gear, perks, board and mail, and everything is written back at the end (salary included). Career shifts were already paying correctly (verified: salary paid and persisted across a reload).
- **Time rolling back on resume**: autosave ran every 30 s and not when leaving to the menu. Now every 8 s, plus on pause, on leaving to the menu, when the tab is hidden, and on page unload.
- Guard: a tampered save with no valid backup no longer zeroes the wallet (ban only).
