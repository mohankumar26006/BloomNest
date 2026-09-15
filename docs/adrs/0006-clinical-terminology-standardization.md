# ADR 0006: Clinical Terminology Standardization

## Date
2026-08-05

## Context
Early prototypes of BloomNest utilized relatable "Fruit Size" comparisons (e.g., "Big as a Lemon", "Big as a Melon") in the `pregnancyWeeksData.ts` file. While popular in mainstream apps, user feedback indicated a preference for a more serious, scientifically accurate tone.

## Decision
We undertook a full data standardization pass across the application.
1. **Removal of Fruit Sizes:** All references to fruits and vegetables were purged from the UI and underlying data structures.
2. **Clinical Nomenclature:** We adopted strict medical terminology for fetal stages (e.g., "Blastocyst", "Embryo", "Fetus (Early Development)", "Fetus (Viability Threshold)").
3. **Data Source:** This logic is hardcoded into `src/data/pregnancyWeeksData.ts` to ensure zero-latency retrieval without the need for a backend SQL database.

## Consequences
- **Pros:** Elevates the trustworthiness and professionalism of the application. It aligns better with the "AI Doctor Assistant" narrative.
- **Cons:** Some users who prefer lighthearted tracking might find the clinical terms sterile, though the visually stunning Cinematic UI balances this out.
