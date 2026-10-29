# Routing Provider PoC — Test Record

**Status:** HERE-first PoC blocked pending vendor access and operator-approved sample data.  
**Purpose:** Capture evidence for HERE first; evaluate HudHud only if HERE fails a mandatory gate or commercial/coverage checks. Do not select a provider by marketing claims alone.

## Vehicle-routing assumptions (refined)

Do not default to a freight-truck profile for school buses. Access rules may resemble passenger-vehicle rules, but a school bus is wider/longer than a small car and needs adequate road width and turning space. Prioritize usable road width, safe passing, turn/swept-path feasibility, and safe pickup/drop-off access. Apply height/weight restrictions only when relevant to the actual fleet. Confirm real bus dimensions with the operator; do not use generic dimensions as fleet facts. Saudi Highway Code 303 gives design examples of a conventional school bus at 2.5 m wide and 10.9 m long versus a passenger car at 2.0 m wide and 5.1 m long; these are reference design vehicles, not the pilot bus specification: https://shc.rga.gov.sa/content/dam/roadcodes/assets/road-code-library/303%20EN.pdf

## Current direction: HERE-first proof of concept (2026-10-29)

The project direction is now to evaluate **HERE first**, because current official documentation describes real-time traffic flow and incident data, including road closures and construction, and Routing API v8 supports multiple transport modes including buses. This is a priority for testing, **not a final vendor approval**.

Official references:
- HERE Routing API v8 modes and capabilities: https://docs.here.com/routing/reference/routing-v8-api-overview
- HERE Real-Time Traffic update cadence: https://docs.here.com/traffic-api/docs/real-time-traffic-here-traffic-api-v7-concepts
- HERE Base Plan excluded Asset Management use cases: https://www.here.com/get-started/pricing/base-plan-restrictions
- HERE product coverage information: https://docs.here.com/coverage/docs/here-coverage-information

**Hard blockers before a real PoC:** obtain written commercial permission and suitable pricing for fleet tracking/map display/route calculation; confirm product coverage for Dammam; obtain credentials; collect operator-approved anonymized test stops and actual bus dimensions; establish human-reviewed baseline routes. Do not use production child/home coordinates or commit API keys.

Traffic flow is documented as updated every minute and incident data every two minutes, but that does not guarantee that every Dammam incident or closure is detected immediately. Validate freshness and completeness with local scenarios. Routing must never silently change the approved stop order or active-trip route version.

## Current evidence-based position (2026-10-29)

| Gate | HudHud Maps | HERE Routing |
|---|---|---|
| Saudi-specific map/routing offering | Public documentation says yes; not field-validated | Global Routing API; Dammam-specific restriction accuracy not yet validated |
| Published multi-stop limit | Directions API: up to 25 waypoints | Must verify exact endpoint, plan, and waypoint limits for the intended workflow |
| School-bus fit / road-width handling | Not established by reviewed public docs | Truck routing and vehicle dimensions/weight are documented; school-bus suitability still unproven |
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

**HERE is the priority PoC candidate, but it is not approved. No live API tests have been run.** The repository currently lacks provider credentials, approved route coordinates, actual vehicle profiles, and written license confirmation. First obtain these inputs and test HERE. Only test HudHud as a fallback if HERE fails a mandatory gate or commercial/coverage checks.
