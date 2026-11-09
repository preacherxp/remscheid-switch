# Remscheid switch

Contemporary Remscheid in a pixel-art day/night switch. Vaillant headquarters and Holiday Inn Express on Lenneper Straße 164.

[Live demo](https://preacherxp.github.io/remscheid-switch/)

The landmarks form a compressed panorama, rather than a literal street view.
No build step or runtime dependencies. Drag through the hours, tap or press
Space to toggle, or use the arrow keys.

## Run and validate

```sh
python3 -m http.server 8000
node test-scene.cjs
```

Open http://localhost:8000. The scene test checks day, dusk, night, dawn,
lighting, the cat interaction and reduced motion. See [AGENTS.md](AGENTS.md)
for actual-browser composition and interaction checks.

## Embed

```html
<script src="city-switch.js"></script>
<script src="remscheid.js"></script>
<remscheid-switch style="display: block; width: min(680px, 100%);"></remscheid-switch>
```

The API exposes `checked`, `position`, and `jump(night)`. `change` supplies
`detail.night`; `scrub` supplies `position`, `hour`, and `dark`.

GitHub Pages serves `/` from `main`.

## Landmark references

- [Vaillant Group headquarters and campus](https://www.vaillant-group.com/our-company/sites/).
- [Vaillant official campus architecture](https://www.vaillant-group.com/our-responsibility/technologies/innovative-strength.html).
- [Holiday Inn Express Remscheid: official hotel](https://www.ihg.com/holidayinnexpress/hotels/gb/en/remscheid/zpnrc/hoteldetail).

## Attribution

The engine is derived from `tokyo-switch.js`; the original idea is “住人のいるスイッチ”
by @Lattice_Node ([original project](https://ludion.ai/p/toggle-daylight), MIT),
as credited in the engine source.
