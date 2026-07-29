# Draconic Composite — "Soul Places" (Zodisphere)

**Status:** Spec v0.1 (Phase 1 proposal) · Owner: founder · Target surface: Zodisphere 3D globe (`/zodisphere/globe3d`)

## 1. The idea in one line
Take two people's **draconic (soul) charts**, blend them into a **composite**, project it onto the Earth, and surface the real places where the two souls' shared imprint runs strongest — each with a reading of *what could have been between them there*, drawn from the sign, **duad, compendium, and matrix**. A place qualifies when a composite soul-line runs **within 50 miles** of it.

## 2. Framing (non-negotiable honesty rule)
Astrocartography does **not** locate where two people physically were in a past life. It shows **where the shared soul-imprint falls strongest on Earth today**. All copy is evocative and conditional — *"what could have been," "a place your two souls would have known,"* never *"you were both here in 1540."* This mirrors the existing draconic composer's rule (*"never a literal claim"*) and is what keeps the feature uncanny rather than gimmicky. Legal/credibility guardrail, not a style choice.

## 3. Astrological method (decisions to confirm)
1. **Composite *of* draconics** (recommended), not draconic-of-composite.
   For each shared body: rotate person A by A's own North Node, rotate person B by B's own North Node, then take the midpoint.
   `compDrac(body) = directMidpoint( dracA(body), dracB(body) )`
   where `dracX(body) = (natalLonX(body) − northNodeLonX + 360) mod 360`.
   Rationale: each soul is expressed on its own nodal axis first — "two souls meeting," which is the literal ask.
2. **Composite Earth-rotation (GMST):** composite charts have no single birth moment, but MC/IC (and ASC/DSC) projection needs a GMST. Use the **temporal midpoint** of the two births: `gmst = gmstAtMoment(midpoint(birthA, birthB))`. Consistent with midpoint-composite methodology. *Open question — validate against a known composite ACG source before GA.*
3. **Orb = 50 statute miles.** 50 mi ≈ 80.47 km ≈ **0.7237°** great-circle. Delivered as a **ranked list of places** (see §6), not tap-to-find — 0.72° is far too small to tap reliably.
4. **Bodies:** the 10 classical bodies + the angles the engine already projects. Asteroids (incl. the custom Vesta/Juno rulers) optional in a later phase.

## 4. Architecture — reuse vs. new
Almost everything exists. Phase 1 is composition, not invention.

| Capability | Reuse (existing) |
|---|---|
| Per-person chart longitudes + birthDate | `getMyChartBodies(profile, extras)` (`lib/zodisphereMidpoints.ts`) |
| Longitude → ACG lines (MC/IC/ASC/DSC) | `projectWide(lon, gmst)` |
| Earth rotation at a moment | `gmstAtMoment(date)` (`lib/engines/derivedAcgLines`) |
| Midpoint of two longitudes | `directMidpoint(lonA, lonB)` |
| Line color blend | `blendColors(a, b)` |
| Proximity in miles/deg | `probeAcgLines`, `angularDistanceDeg` |
| Hidden layers per degree | `getFullDuadCompendium(lon)` → {sign, duadSign, compendiumSign, matrixSign} |
| Distance-aware framing bands | `proximityBandFor(distanceDeg)` (added this session) |
| Real place names near a point | `cities.json` (already fetched by the globe for nearest-cities) |
| Soul/past-life voice | `composeDraconic(...)` (`zodisphereInterpretation.ts`) — adapt to two-soul voice |

**New code (Phase 1):**
1. `lib/zodisphere/soulPlaces.ts`
   - `getDraconicCompositeAcgLines(profileA, profileB): Promise<{ lines: AcgLine3D[]; unavailable: string[] }>`
     Builds both charts → draconic-rotates each by its own node → midpoints → `projectWide` at the composite GMST → returns `AcgLine3D[]` (colored via `blendColors`). Mirrors `getBodyAcgLines` / `getMidpointLines3D`.
   - `findSoulPlaces(lines, cities, maxMiles = 50, max = 12): SoulPlace[]`
     For each city, nearest composite-line distance; keep ≤ `maxMiles`; rank by closeness; attach the driving body+angle and its `getFullDuadCompendium` layers. Returns a ranked list.
2. `composeDraconicComposite(x)` in `zodisphereInterpretation.ts`
   - Two-soul, past-life voice. Weaves duad/compendium/matrix **unnamed** into the prose (per interpretation-voice rule). Proximity-aware: uses the sub-50-mi distance to calibrate intensity ("this one runs almost through the town…" vs "…just inside the 50-mile edge"). Returns narrative + a short "what could have been" line per place.
   - Takes already-rotated composite longitudes → does **not** re-rotate (avoids the double-node bug if we reused `mode:'draconic'`).
3. Minimal UI: a **founder-gated "Soul Places (beta)"** panel — partner picker (reuse the synastry/composite partner-selection flow) + the ranked list rendered from `findSoulPlaces`, plus optional line overlay on the existing globe. No new full-screen experience in Phase 1.

## 5. Interpretation design
Per place: **Body × Angle** headline (e.g. *Venus DSC — the love you keep almost remembering*) → the **soul-sign** flavor → the **duad/compendium/matrix** woven as escalating "what could have been" (unnamed, second-person-plural: *"the two of you…"*) → a closing conditional. Distance modulates confidence via `proximityBandFor` (all Phase-1 hits are ≤ 50 mi, so within the `on`/`near` band — framed as strong). Range includes the bittersweet and the hard, not only the romantic (matches the "risky, make them feel seen" directive).

## 6. UX delivery — the shareable object
The deliverable is a **"Soul Places" list**: *"Kyoto — your composite Venus soul-line runs 31 mi away. What could have been: …"* Ranked, screenshot-friendly, sendable to the partner. That list — not the globe tap — is the thing people open the app to generate and share. Globe overlay is secondary.

## 7. Phase 1 scope (this deliverable)
**In:**
- `getDraconicCompositeAcgLines` + `findSoulPlaces` engines.
- `composeDraconicComposite` (English prose).
- Founder-flag-gated beta panel: partner pick → ranked soul-places list (globe overlay optional).
- Unit tests: node rotation, midpoint, 50-mi orb boundary, deterministic output; a dev harness that prints ~5 soul places for two sample charts so we can *feel it* before UI investment.

**Out (later phases):** full-screen experience & animations; 20-locale i18n; premium billing/paywall (Phase 1 is founder-only, no charge); asteroid bodies; saved/compare history; server-side prose (start client-side, like the current draconic reading).

## 8. Gating & rollout
- New flag `zodisphere_soul_places` in `config/featureFlags.ts`, founder-allowlist only (same pattern as `zodisphere_3d_dev_only` / Starseed / Divine Timing soak).
- Requires **both** people to have full birth data (date + time + place). Show a clear "needs birth time" state when missing (birth-time precision already surfaced in the globe).
- Ship to founder → soak → decide premium placement (sits naturally beside Divine Timing / Starseed Origin in the premium tier).

## 9. Open questions
1. Composite GMST = temporal midpoint — validate against a reference composite-ACG.
2. Composite-of-draconics vs draconic-of-composite — confirm the method choice.
3. Do we also offer the **non-draconic** composite "places for this life together" as a sibling mode? (Cheap once the pipeline exists.)
4. Minimum data bar: block, or degrade gracefully with a confidence caveat, when birth time is rounded/missing?

## 10. Effort
- Phase 1 (engine + composer + founder beta list + tests): **moderate** — days, not weeks, because the engines exist.
- Full GA (UI, i18n×20, premium, polish): the larger lift, phased after the founder soak proves the feel.

---
*Depends on this session's Zodisphere work already shipped: off-line nearest-line reading, duad/comp/matrix house-scoring, and `proximityBandFor`.*
