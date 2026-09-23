# Kameen v2.3.5
- **Officers going short for moments — fixed at the source**: the "hand fidget" row (played every ~13 s) had been measured 10% taller than the idle row, so the officer shrank whenever it played. All upright rows (idle, hand, stop, pass, radio) are now pinned to the idle scale; only walk and run rows keep their own measured scale. All poses now draw within 152–156 px at one scale.
- **Pedestrians over the police car — fixed**: they are drawn right after the road tiles, before the parked police car and every prop, so they always pass behind.
- **Smooth animations**: every figure (officer, partner, sergeant, supervisor, pedestrians) now cross-fades between sprite frames over 120 ms, so pose changes and strides blend instead of snapping. Off automatically under the reduced-effects setting.
- **Middle lane divider moving with the camera — fixed**: the dashed line between the lanes was drawn in screen space with no dash offset; it now scrolls with the world.
