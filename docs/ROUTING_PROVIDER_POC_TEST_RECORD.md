# Routing Provider PoC — Test Record

**Status:** Blocked pending vendor access and operator-approved sample data.  
**Purpose:** Capture comparable evidence for HudHud Maps and HERE Routing without selecting a provider by marketing claims alone.

## Current evidence-based position (2026-10-29)

| Gate | HudHud Maps | HERE Routing |
|---|---|---|
| Saudi-specific map/routing offering | Public documentation says yes; not field-validated | Global Routing API; Dammam-specific restriction accuracy not yet validated |
| Published multi-stop limit | Directions API: up to 25 waypoints | Must verify exact endpoint, plan, and waypoint limits for the intended workflow |
| Bus-specific restrictions | Not established by reviewed public docs | Truck routing and vehicle dimensions/weight are documented; school-bus suitability still unproven |
| Traffic-aware ETA | Advertised | Supported by documented routing options; availability/terms to verify |
| Fleet tracking / route calculation commercial license | Written confirmation required | **Important blocker:** HERE Limited and Base Plans exclude Asset Management, including asset tracking/display and route calculation. Obtain a written commercial offer/confirmation for the exact use case before spending engineering effort. |
| Decision | Test candidate only | Test candidate only, contingent on correct commercial contract |

Sources:
- HudHud developer docs: https://developers.hudhud.sa/en/
- HERE Routing v8: https://docs.here.com/routing/docs/routing-v8-intro
- HERE truck routing: https://docs.here.com/routing/docs/routing-v8-truck-routing
- HERE Limited Plan restrictions: https://www.here.com/get-started/pricing/rps-limits-excluded-use-cases
- HERE Base Plan restrictions: https://www.here.com/get-started/pricing/base-plan-restrictions

## Required inputs before running tests

- [ ] API access for each provider under a plan permitted for commercial fleet/school-bus use.
- [ ] Written confirmation of license, quotas, production pricing, SLA, data retention, and allowed route-result storage/display.
- [ ] Operator-approved test stops in Dammam and surrounding areas. Use anonymized test IDs; do not put children's names or home details in provider requests for this PoC.
- [ ] Actual bus dimensions, weight, and any other constraints supplied by the operator. Do not invent vehicle parameters.
- [ ] Human-reviewed baseline paths and known problem points, reviewed by someone with local road/operator knowledge.
- [ ] Defined expected behavior for route closures and active-trip route-version handling.

## Per-test record

Duplicate this section for every scenario/provider.

- Provider / API / plan:
- Test ID:
- Run timestamp and timezone:
- Origin and stop IDs:
- Number of stops:
- Vehicle profile supplied by operator:
- Request options:
- HTTP status / provider error:
- Response latency:
- Total distance:
- ETA and traffic assumptions:
- Returned stop count and order:
- Missing or duplicate stops:
- Road restrictions / questionable maneuvers:
- Path reviewed by:
- Evidence link or redacted response fixture:
- Result: PASS / FAIL / BLOCKED
- Notes and follow-up:

Never store API keys, live guardian/student details, or unredacted home coordinates in this document or in Git.

## Scenario matrix

| ID | Stops | Scenario | Mandatory check |
|---|---:|---|---|
| R20 | 20 | Typical route | All stops retained in exact approved order |
| R30 | 30 | Above 25 waypoint threshold | Documented multi-request/leg strategy, no reordered stops |
| R40 | 40 | Pilot-scale route | Same as R30; validate leg boundaries and path continuity |
| R50 | 50 | Stress case | Stable behavior or clear documented hard limit |
| U01 | 20+ | One-way / divided road | No obviously invalid crossing or prohibited turn |
| U02 | 20+ | U-turn-sensitive locations | Review every proposed U-turn locally |
| C01 | 20+ | Known closure / roadworks | Path response, freshness, and fallback recorded |
| F01 | 20+ | API timeout / quota exceeded | Clear failure state; no false “live” route |
| A01 | 20+ | Active trip during route change | Active trip remains on approved route version |
| M01 | N/A | Low-spec Android phone | Startup, memory, battery, data use, and usability measured |

## Scoring

Score each category 0–5 only after evidence is recorded. A missing measurement is **N/A**, not zero and not a pass.

| Category | Weight | What counts as evidence |
|---|---:|---|
| Dammam path quality and restrictions | 30% | Human-reviewed representative routes |
| Fixed stop-order and 40+ stop workflow | 20% | Captured responses and automated assertions |
| Commercial license, SLA, support | 15% | Written vendor response / contract |
| Road and traffic data freshness | 10% | Written update policy plus closure test |
| Cost and quotas at 100 buses | 10% | Cost model using actual expected request volume |
| API reliability and latency | 10% | Repeated timestamped test runs |
| Mobile performance | 5% | Measurements on actual low-spec devices |

Do not calculate a final weighted score while a mandatory gate is blocked or failed. Safety, licensing, and route-order failures cannot be offset by a high score elsewhere.

## Pass/fail gates

- [ ] Vendor explicitly permits the proposed commercial use.
- [ ] No stop is lost, duplicated, or reordered by the route workflow.
- [ ] 40+ stops have a tested approach and clear handling of API waypoint limits.
- [ ] Local operator review finds no unacceptable path or maneuver in the sample.
- [ ] Route closures and API failures produce safe, explicit behavior.
- [ ] Approved active-trip route version cannot silently change.
- [ ] Data protection, price, quotas, and SLA are acceptable.
- [ ] Low-spec Android test meets product-defined performance budgets.

## Current outcome

**No provider selected. No live API tests have been run.** The repository currently lacks provider credentials, approved route coordinates, vehicle profiles, and vendor license confirmation. The next step is to obtain these inputs and run this matrix against both providers.
