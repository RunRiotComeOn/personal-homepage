# Yixu’s Ocean

An independent ocean portfolio on `feat/orca-open-world`. The original `main` branch and its GitHub Pages deployment are unchanged.

## Run

Use Node 22 (or Node 20.19+):

```sh
npm ci
npm run dev
npm run build
```

The output is static `dist/`. Relative Vite asset paths support both the repository’s GitHub Pages subdirectory and a root-domain deployment. The existing deployment workflow still only runs automatically for `main`.

## World and controls

- Six freely accessible islands adapt the existing homepage’s biography, research labs, three papers and figures, education, awards, life photos, game, and contact links.
- WASD / arrow keys swim relative to the camera. Click/tap water to swim there. Drag to orbit; scroll to zoom.
- Shift glides faster using replenishing energy. Space leaps. Q sends a sonar pulse. E opens the nearby dock’s story.
- M opens the atlas with fast travel; J opens the field guide. Every section is readable without collecting anything.
- R starts/stops a ten-ring timed course. P hides the interface for photo mode.
- Touch devices have a virtual joystick, glide, leap, and sonar controls.
- 18 collectable echo pearls, six exploration discoveries, and the best race time are saved only in this browser (`yixu-ocean-v1`). Settings provide a confirmed fresh-voyage action.
- Graphics settings include a lower-cost mode, brighter morning lighting, and quieter motion. Ambient sound is opt-in.

## Content

`src/ocean/data.ts` is the content and world-coordinate source. Existing portrait, institution logos, research figures, and life photography are reused from `public/`. Island names and geography are fictional. Academic claims, institutions, awards, authors, and links come from the original repository; no new academic accomplishments are mocked.

The contact form preserves the existing EmailJS integration when the three `VITE_EMAILJS_*` variables are configured. Without them, the form opens a composed message in the visitor’s mail app and explicitly says it must be sent there. It never simulates a successful submission. The exploration game does not require EmailJS, Supabase, or a backend. The original website’s source sections and visitor-service files are retained for reference, but the ocean does not start visitor tracking.

## Architecture

React owns the accessible field guide, Radix dialogs/switches, touch controls, and HUD. The Three.js world loads separately so the guide remains usable if WebGL cannot start. The renderer owns motion, collisions, interactions, camera, water shader, and effects. Static scenery is merged by material to reduce draw calls; animated flora and creatures stay independent. Hidden tabs pause rendering, simulation steps are capped, and graphics/audio resources are disposed on teardown.

## Verification and known limitations

- Production TypeScript/Vite build passes.
- Content assets, the downloaded GLB, course accessibility, pearl locations, and source links were checked programmatically.
- Browser visual and interaction QA was attempted, but the environment’s browser URL policy blocked the supervised preview. No passing desktop/mobile screenshots, FPS measurements, or reference-parity claim is made.
- The YouTube video body was unavailable; its indexed chapters and the author’s public portfolio/source informed the interaction design. Longtailwriter’s publicly served reference artwork informed the palette and moonlit atmosphere. The reference artwork itself is not included.
- The ocean uses stylized real-time 3D scenery; it is not a reproduction of Longtailwriter’s hand-painted assets. Manual visual tuning remains necessary before claiming equivalent art quality.
- Progress and race records are local, not multiplayer/global rankings.

## Credits

- **Orca** — Poly by Google, via [Poly Pizza](https://poly.pizza/m/5p9B6IebY-A), [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/). Original binary in `public/models/orca.glb`; rescaled/recolored at runtime and given eye patches for visibility. Attribution also appears in the in-game settings.
- Visual/interaction inspiration: [Bruno Simon](https://bruno-simon.com/), [folio-2025](https://github.com/brunosimon/folio-2025), and [长尾森林](https://longtailwriter.com/). No reference code or artwork is copied into this implementation.
- Three.js (MIT), React (MIT), Radix UI (MIT), Lucide (ISC). Google Fonts: DM Sans and Libre Caslon Display (SIL Open Font License), with system-font fallbacks.
