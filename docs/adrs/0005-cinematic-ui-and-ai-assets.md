# ADR 0005: Cinematic UI and AI Asset Generation Pipeline

## Date
2026-08-05

## Context
Traditional pregnancy trackers rely on cartoon vectors or generic 3D renders that lack emotional resonance and premium feel. To elevate the BloomNest brand to an ultra-premium tier, we needed a visually stunning centerpiece for the `BabyDevelopmentPage`.

## Decision
1. **Cinematic Composition:** We replaced the standard grid layouts with a layered visualizer. A maternal portrait serves as the full-bleed background, with a "cosmic womb" masking layer positioned dynamically over the belly curve.
2. **AI-Generated Assets:** We built an automated pipeline using background AI subagents to query a text-to-image generation model. This pipeline dynamically produced 40 distinct, hyper-realistic, 8K medical macro photographs of embryonic/fetal development.
3. **Static Theming:** We abandoned dynamic trimester color coding (Amber/Rose/Purple) in favor of a static, elegant Rose/Pink gradient that harmonizes with the brand identity.

## Consequences
- **Pros:** A massive visual upgrade that provides a breathtaking, premium user experience. The app feels highly differentiated from competitors.
- **Cons:** Generating 40 high-resolution images required heavy usage of rate-limited AI models, leading to quota exhaustion and necessitating a multi-hour cooldown period to complete the asset library. The total size of `public/assets/cinematic/` increased significantly, which must be accounted for in the final bundle size.
