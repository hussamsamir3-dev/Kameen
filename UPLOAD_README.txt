Kameen v1.7.0 — upload-only package (changes since v1.5.0, the version currently on your server)

UPLOAD (overwrite):
  index.html, manifest.js, css/game.css
  js/ (all 26 files — every file is stamped 1.7.0; the boot check refuses mixed versions)
  assets/officer_c0.png, officer_c1.png, officer_c2.png, officer_c3.png  (new)

DELETE on the server:
  assets/officer_new_sprites.png

Then hard-refresh (Ctrl+Shift+R) or open in a private window. The menu footer MUST read v1.7.0 — if it shows 1.5.0 the browser is still serving cached files.
