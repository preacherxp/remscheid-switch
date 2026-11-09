# Remscheid switch

Contemporary Remscheid in a pixel-art day/night switch. Vaillant headquarters and Holiday Inn Express on Lenneper Straße 164, under the Rathaus tower on the wooded ridge, with a Stadtwerke Remscheid e-bus passing.

[Live demo](https://preacherxp.github.io/remscheid-switch/) · [60 fps MP4](remscheid-day-night-60fps.mp4)

The landmarks form a compressed panorama, rather than a literal street view.
No build step or runtime dependencies. Drag through the hours, tap or press
Space to toggle, or use the arrow keys.

## Run and validate

```sh
python3 -m http.server 8000
node test-scene.cjs
```

Open http://localhost:8000. The scene test checks day, dusk, night, dawn,
lighting, the cat interaction, the bus and clouds, and reduced motion. See [AGENTS.md](AGENTS.md)
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
- [Vaillant logo: official media downloads](https://www.vaillant-group.com/news-stories/media-downloads/vaillant-group-logos.html).
- [Hotel sign as built: builder's project photographs](https://bauunternehmung-guenther.net/projekt/holiday-inn-express-remscheid/) and the [Holiday Inn Express logo](https://commons.wikimedia.org/wiki/File:Holiday_Inn_Express_logo.svg).
- [Rathaus Remscheid: baukunst-nrw](https://www.baukunst-nrw.de/objekte/Rathaus-Remscheid--1844.htm) and [photograph](https://commons.wikimedia.org/wiki/File:Remscheid_rathaus.jpg).
- [Stadtwerke Remscheid eCitaro no. 1: photographs](https://busphoto.eu/vehicle/1152526/?lang=en).
- [Remscheid's forest in figures: Technische Betriebe Remscheid](https://www.tbr-info.de/remscheider-wald-in-zahlen.html).

[RESEARCH.md](RESEARCH.md) lists the images that were opened and what could not be verified.

## Attribution

The engine is derived from `tokyo-switch.js`; the original idea is “住人のいるスイッチ”
by @Lattice_Node ([original project](https://ludion.ai/p/toggle-daylight), MIT),
as credited in the engine source.

The MP4 is a seven-second recording of the complete browser-rendered switch at 800 × 500 and 60 fps, including the moving glass lens.
