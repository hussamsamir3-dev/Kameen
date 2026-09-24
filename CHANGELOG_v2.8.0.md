# Kameen v2.8.0
- **Main menu is now an attract-mode cinematic of the game** (js/39_cinema.js): zoomed-out corniche with a day→night cycle and floodlight pools, traffic through the checkpoint, the officer stopping and releasing cars, the sergeant patrolling the far pavement with a radio, and every ~28 s a set piece — a runner smashing through, the spike strip deploying with sparks and tyre smoke, the car limping to a stop, the tow truck loading it and driving off. Officers are in proportion with the vehicles; every figure uses the same single-scale rows, so heights no longer change between animations.
- **Rank badge visible on the menu**: the SVG gradient id collided with a hidden screen; every badge now gets a unique id.
- **Rank name in the HUD** next to the badge.
- **Spike strip** moved lower on the lane and acts as a **speed bump**: cars slow to 2.5 m/s and bounce over it.
- **No flash/lag when switching panels**: panel transitions are disabled while swapping papers ↔ radio ↔ dialogue.
- **Developer section in Settings**: a password field (the password is never stored — only a keyed hash is compared; the unlocked state lives in the encrypted settings). Unlocks: +5000 EGP, +1000 XP, promote now, unlock whole shop, night now, end shift, spawn runner, call tow, clear ban, lock again. Developer actions are exempt from the anti-cheat watchers.
