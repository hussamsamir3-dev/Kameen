Kameen v1.5.0 — upload-only package (files that changed vs your last version)

UPLOAD (overwrite):
  index.html
  manifest.js
  js/  (all 25 files — every file carries the 1.5.0 version stamp, the game refuses to boot if any file has an old stamp)
  assets/officer_new_sprites.png   (new)

DELETE on the server (no longer used, saves 6 MB):
  assets/officer_walk.png
  assets/officer_actions.png
  assets/officer_walk_seq.png
  assets/officer_idle_seq.png

Everything else (backgrounds, vehicles, props, audio, css) is unchanged — keep it.
Then hard-refresh (Ctrl+Shift+R).
