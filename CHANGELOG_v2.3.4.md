# Kameen v2.3.4
- **Officer height pops between poses — fixed**: each row's reference height is now the body's *solid* height (3-px erosion drops the radio antenna and fingertips), and the leaning run row is corrected +6%. Measured: idle 153 px, stop 153, radio 153, run 156, walk 151 at the same scale — no more taller/shorter switching.
- **"Short little men"**: measured objectively, an officer already stands 2× a sedan's height (153 vs 77 px), so heights are unchanged; the smallness on wide monitors came from the framing (38.5 m of world across the screen). Default framing is now 33 m, so people and cars read ~17% bigger on wide screens.
- **Pedestrians over props — fixed**: they are now drawn in the structures pass, before the police car, sign, barrier and booth, so they always pass behind them; still never stand still.
- **Lower lane moving with the camera — fixed**: the painted asphalt pattern was anchored to the screen on both lanes; it is now anchored to the world and scrolls with the camera (measured).
- **Background tab**: all sounds (synth and music) pause when the tab is hidden and resume when it returns.
- **Radio static**: louder squelch, a real noise bed and a two-note end beep on every dispatch line.
- **Shift counter overlap**: the progress bar is a thin 4-px line at the very top with the counter tucked in the corner, out of the banner area.
- Fixed a device-picker line that had been commented out.
