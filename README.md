# كمين: وردية ليل — CHECKPOINT: NIGHT SHIFT

A 2D Egyptian roadside police checkpoint simulation for PC, tablet and mobile browsers.

You play the officer on shift. You stop vehicles, talk to drivers, read documents and run radio checks. You search or screen vehicles only when you have a reason, and you record decisions you can justify.

Developed by Hossam Hegazi. All names, documents and procedures in the game are fictional.

## How to launch

The game runs fully offline. It needs no server, no install and no API keys.

| Build | How to open |
|---|---|
| `checkpoint-night-shift-single.html` | Double-click it. Everything is embedded, including the art and both music tracks (music re-encoded at 112 kbps). This is the easiest option for phones and tablets: copy it to the device and open it in Chrome or Safari. |
| `CheckpointNightShift/index.html` (folder build) | Open `index.html` directly. The folder uses the original PNG asset pack, so keep the `assets/`, `js/`, `css/` folders and `manifest.js` next to it. |
| Optional local server | From inside the folder, run `python -m http.server 8000`, then open `http://localhost:8000`. |

Browser support:

- Recommended: current Chrome, Edge, Firefox or Safari.
- Mobile: rotate to landscape for the best layout. A compact portrait layout is supported.
- Sound: starts after your first tap or key press, as browsers require.

## Controls

| Action | Keyboard / mouse | Touch |
|---|---|---|
| Walk | A/D or ←/→ (W/S for bayside), or click the ground | Tap the ground |
| Select a vehicle | Click it, or Q/E to cycle | Tap it |
| Actions | 1 Stop · 2 Wave · 3 Approach · 4 Talk · 5 Documents · 6 Bay · 7 Inspect · 8 Screen · 9 Radio · 0 Decide · P Partner · R Record | The large dock buttons |
| Dialogue choices | 1–9 · T cycles tone | Tap |
| Notebook / close / pause | N / Esc / Space | Top-bar buttons |
| Look along the road | — | Drag sideways |

A dimmed button always tells you what is missing.

The game runs at 0.35× speed while you read. During emergencies it runs at full speed. You can change this in Settings.

## What's new in v1.4

| Area | Change |
|---|---|
| Career map | Pick your checkpoint on a map of Egypt. Locations unlock with rank (Cairo → desert road → Alexandria → Hurghada → Dahab → Luxor → Aswan); free patrol and the daily challenge have all of them open. |
| Daily challenge | One seeded shift per day for everyone (same place, time and traffic), 12 minutes, with a "case of the day". Today's best score and a daily streak are kept. |
| Recurring characters | Uncle Salah (taxi), Madam Nadia, Karim the student and Hajj Fathy (box truck) come back across shifts with their own story; they remember how you treated them. |
| Big moments | Cinematic letterbox, slow motion and a title for big catches and saved lives; "Detective eye ×N" streaks for consecutive sound checks. |
| Mistake feedback | After a wrong call the game pauses and shows "What you missed" — the exact clues (e.g. the expiry date) — and highlights the car. |
| Documents | Pressing Documents before the driver has handed them over shows a hint and highlights the question to ask. |
| Simpler play | New main menu (Play, Map, Daily, Record, Settings; the rest under More). The action bar shows only what you can do now; "All" reveals the rest. |
| Environment | Depth-of-field on far scenery, volumetric floodlight beams with dust, low-sun light shafts, directional shadows from sun and floodlights, filmic grading, vignette and film grain. |
| Weather | Rain (streaks, splashes, lightning, rain sound, less grip), fog and heat haze banks, dust storms — chosen per location and time. |
| Physics | Two-axle spring-damper suspension with weight transfer, rumble-strip and road-texture bumps, collision kicks and weather-dependent braking grip. |

## What's new in v1.3

| Area | Change |
|---|---|
| Music | 4 supplied tracks (Nile Serenity I/II, Nile Patrol I/II) play in random order with crossfades; volume and skip in Settings and the 🔊 quick menu. |
| Gate | Supplied 16-frame boom barrier replaces the old one (smooth cross-faded animation, status lamp). |
| Officers | Supplied 24-frame walk cycle (stride-matched, no foot sliding) and 16-frame breathing idle for the officer and his partner. |
| Day / night | Every shift spans 12 in-game hours and crosses a sunrise or sunset. The supplied day and night pictures cross-fade with the clock; lighting, headlights, floodlights, shadows and ambience follow it. Shift time (Auto, afternoon→night, night→dawn, dawn→midday, morning→sunset) is chosen on the briefing screen. |
| Locations | 5 new supplied locations: Alexandria Corniche (Qaitbay), Dahab coastal road (South Sinai), Hurghada Marina, Luxor Corniche, Aswan Corniche, each with its own place names, addresses, lost-visitor question and traffic mix. All 7 locations are open; the menu rotates through them. |
| Street ambience | The supplied day and night street loops replace the generated ambience, looping gaplessly and cross-fading with the clock. |
| Talk to the driver | "روح للسواق" is now "كلّم السواق / Talk to the driver" (كلّم السواقة for women): walks to the window and opens the conversation. The old talk button is now "الحوار" (reopen conversation). |
| Release | Choosing Release pre-selects "routine check" as the reason. |
| Phones | Panels open as a resizable side sheet (landscape) or bottom sheet (portrait). Drag the grip to resize (remembered); ▾ minimises. The camera frames the car in the visible part of the road. |
| Physics & logic | Jerk-limited acceleration and braking, headlight road reflections at night, daylight shadows, and the officer returns to his post after each decision. |

## What's new in v1.2

| Area | Change |
|---|---|
| Inspect button | The first action button is now **Inspect / فحص** (start checking the car waiting at the gate). The old search button is labelled **Search / تفتيش**. |
| Officer gesture | Pressing Inspect no longer plays a stop animation. The officer raises the stop hand, facing left toward incoming traffic, when the barrier closes on approaching cars. While idle he watches the incoming lane. |
| Women drivers | Officer lines, question buttons, labels and notes use feminine Egyptian Arabic for women drivers (رايحة، إنتي كويسة؟، استني هنا لو سمحتي، السواقة…), and their own replies are feminine too. |
| Gender-consistent drivers | Vehicles whose artwork shows a male driver always get male drivers. Women appear in the new empty-cabin cars. Professional and cargo vehicles are mostly male. Borrowed-licence photos match gender and age. |
| New vehicles | 8 supplied vehicles with separate wheels: estate wagon with roof luggage, green pickup, white luxury sedan, blue box truck, red Nasr 128, blue hatchback, Alexandria taxi and maroon hatchback. |
| New drivers | 12 supplied portraits (6 women, 6 men, young to old) are added to the driver pool. |
| Wheels | Tyres are 10% larger on all vehicles. The idle engine shake is removed. |
| Mobile | The menu, report, medals, quick menu, banners and context buttons are resized for phones. Medals now show one at a time. |

## What's new in v1.1

| Area | Change |
|---|---|
| Wheels | Wheel positions re-measured on all 12 vehicles; wheels sit in the arches and spin exactly by distance travelled. |
| Barrier | The supplied 5-frame boom barrier now stands on the near side of the lane, in front of the cars, with a red/amber/green status lamp. |
| Camera | Zooms into the lane of the vehicle being inspected and zooms out when idle. Auto / Close / Wide modes are in Settings and the 🔊 quick menu. |
| Paper check | The officer jogs to the car and papers hand over instantly. Finishing a paper check within 5 seconds earns a *Quick eye* bonus. |
| Radio checks | Vehicle, person and confirmation checks (and screening confirmations) reply in 5 real seconds or less, even while a panel is open. |
| Music | Both *Nile Serenity* tracks play as a crossfading playlist in the menu and in game. Adjust volume or skip tracks in Settings or the 🔊 quick menu. |
| Ambience | Layered city rumble, passing traffic, crickets, dusk birds, desert wind, generator hum, radio chatter, footsteps, reward chimes and stamps. These are synthesised in the browser. |
| Progression | XP, 11 ranks with insignia, a combo multiplier, 3 objectives per shift, 12 medals, a daily streak, 1–3 stars per shift, a district leaderboard and a Service Record screen. XP rewards sound decisions, never arrests. |
| Feedback | Decision stamps, +XP popups, confetti, a promotion screen, camera shake on collisions and an emergency vignette. |
| Menu | Live animated scene with pointer-tilt 3D title and raised buttons. |

## The shift loop

1. **Observe and choose.** Pick a vehicle at the marker. Either wave it through or signal it to stop.
2. **Approach and talk.** Choose a tone. Drivers remember what they already told you.
3. **Documents.** Compare the licence, vehicle licence and ID against the vehicle in front of you. Select fields and record the discrepancies you find. Auto-highlight is an optional assist.
4. **Radio.** Vehicle, person and confirmation checks return clear, outdated, unresolved or flagged.
5. **Inspection bay.** Search only with a recorded reason. You can examine, ask about, identify, record, return or bag items.
6. **Screening.** Breath and drug checks are separate procedures. A preliminary result is not a finding.
7. **Decide.** Tick the notes that support your decision, pick a reason, and return the documents.

Most drivers are innocent. What someone looks like never decides the outcome.

Your score comes from decision quality, proportionality, safety and communication. Arrest count does not count.

## Saving

- The game autosaves every 30 seconds and at key moments. You can also save manually.
- Settings → Export gives you a backup as text or a downloadable file.
- Import validates the backup and its version before loading it.

## Honest status

- **Search art:** only the microbus has interior search art (the cutaway with hotspots). Other vehicles show a clearly labelled zone panel instead. The full list of missing art is in *How to play → Missing art*.
- **Audio:** the music is your two *Nile Serenity* tracks. All other sounds are synthesised in the browser; no recorded voices or effects are included.
- **Music start:** browsers only start music after your first click, tap or key press.
- **Supply fault:** a flat breath-device battery is resolved by assigning your partner to fetch supplies.
- **Content:** there are 14 case families, 15 event types, 2 locations and 6 career tiers of unlocks.

## Project layout

```
index.html        page shell (loads manifest.js then js/00…19 in order)
manifest.js/json  measured sprite rects, vehicle axles/wheel radii, anchors
assets/           the supplied PNG asset pack (unchanged)
css/game.css      charcoal / ivory / amber theme, RTL, responsive breakpoints
js/00–19          util, strings, content, assets, state, cases, dialogue, tasks,
                  traffic, actors, actions, events, inspection, screening,
                  render, audio, ui, panels, screens, main
```
