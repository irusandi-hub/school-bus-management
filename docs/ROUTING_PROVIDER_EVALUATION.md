# Routing Provider Evaluation — School Bus Management

**Status:** Evaluation plan; no provider selected.  
**Scope:** Phase 1 pilot in Dammam and surrounding areas, approximately 100 buses.  
**Last reviewed:** 2026-10-29.

## Vehicle-routing assumptions (refined)

Do not treat a school bus as a freight truck by default. For ordinary access rules, the relevant profile may be closer to a passenger vehicle, but the bus is physically wider/longer and needs more turning space than a small car. The primary routing checks for this pilot are **usable road width, ability to pass safely, turn/swept-path feasibility, and safe pickup/drop-off access**. Apply height/weight/vehicle restrictions only when they actually apply to the specific bus and road; do not impose truck restrictions merely because the vehicle is called a bus. Confirm actual vehicle dimensions with the operator and use the closest supported provider profile. A route API's car profile is not automatically proof that a road is wide or safe enough for the bus.

Saudi Highway Code 303 lists a conventional school-bus design vehicle at approximately 2.5 m wide and 10.9 m long, compared with a passenger car design vehicle at 2.0 m wide and 5.1 m long. These are design examples, not assumed dimensions for the pilot fleet. Source: https://shc.rga.gov.sa/content/dam/roadcodes/assets/road-code-library/303%20EN.pdf

## Decision to make

Choose a managed routing API that can calculate and refresh routes using current road/traffic data while keeping the driver app lightweight and compatible with a practical range of Android phones. Do not build an in-house road graph or routing engine.

The routing provider is not the source of truth for student participation, trip status, approved stop order, or driver assignment. Those remain in this application.

## Evidence reviewed

### HudHud Maps — candidate, not approved

Official developer documentation describes Saudi-focused road/map data, traffic-aware ETA, Directions API, Distance Matrix API, Route Optimization API, and Android/iOS SDKs. The published Directions API limit is up to 25 waypoints per request.

**What this establishes:** It is worth testing for Saudi road coverage and local mapping quality.

**What it does not establish:** Bus-specific legal/physical restrictions, guaranteed freshness/update cadence for every road, successful routing for 40+ stops, service-level guarantees, commercial terms, or suitability for school-bus operations. The “near real-time” wording is a provider claim and must be clarified contractually and tested.

Official source: https://developers.hudhud.sa/en/

### HERE Routing — candidate, not approved

Official Routing v8 documentation supports truck routing and vehicle parameters such as weight, height, width, length, and axle weight, and describes legal and physical truck restrictions. HERE also documents that its Limited Plan has usage limits and excludes certain asset-management use cases; the proposed fleet-tracking/routing product must be confirmed as permitted under the exact commercial plan before any pilot.

**What this establishes:** Vehicle-constraint support is more explicitly documented than a generic car-routing API.

**What it does not establish:** That its truck profile exactly matches a school bus, that all relevant restrictions are complete/current in Dammam, or that the commercial plan permits this application.

Official sources:
- https://docs.here.com/routing/docs/routing-v8-truck-routing
- https://www.here.com/get-started/pricing/rps-limits-excluded-use-cases
- https://docs.here.com/routing/docs/routing-v8-intro

## Initial recommendation

Run a controlled proof of concept with **HudHud Maps and HERE Routing in parallel**. Do not declare a winner based on marketing pages alone.

- Use server-side routing API calls; do not expose provider secrets in the mobile app.
- Keep the driver interface lean: approved stop list/order, route line, next stop, trip status, and GPS timestamp.
- Do not make a heavy native turn-by-turn Navigation SDK a launch dependency. Offer external navigation as an optional aid only if it can preserve the approved stop sequence; the main app remains authoritative for trip state and location reporting.
- Treat live traffic and route recalculation as advisory. Any recalculation must preserve the approved stop order and must not silently change an active trip's approved route version.
- Never infer that a route is safe/legal for a school bus solely because a provider returns a route.

## Mandatory vendor questions

Obtain written answers from both providers:

1. Is commercial school-bus routing, fleet tracking, and driver GPS display permitted under the proposed plan and license?
2. What are the road-network update cadence and source/handling of reported closures? Which data are live versus historical/modelled?
3. Can the API represent the actual school bus dimensions/profile? How does it handle narrow streets/usable road width, turning space, one-way/restricted turns, and safe pickup/drop-off access? Which height/weight restrictions are applicable and supported for this fleet in Saudi Arabia?
4. What is the maximum stop/waypoint count for the exact API and plan? What is the recommended method for 40+ stops while preserving a fixed stop order?
5. Can the provider return road geometry, distance, duration, traffic-aware ETA, and route warnings? What happens when data or connectivity is unavailable?
6. What are the production price units, free/trial limits, rate limits, quotas, overage rules, SLA, support hours, data retention, and outage commitments?
7. Are map rendering and route results allowed to be cached, stored in route versions, displayed to guardians, and used with external navigation links? For how long?
8. Where are requests/data processed and stored, and what contractual/privacy terms apply to child-related location data in Saudi Arabia?

## Proof-of-concept test plan

Use the same representative Dammam-area test set for both providers. Record provider, API version/plan, request options, date/time, and result for each test.

### Route scenarios

- 20, 30, 40, and 50 ordered stops, including morning and afternoon patterns.
- Narrow streets and constrained road widths, turns requiring more swept space, stops on both sides of divided roads, one-way streets, restricted turns, and safe stopping locations.
- Use the operator's actual bus dimensions (especially width and length) and only the vehicle restrictions relevant to that bus; do not assume truck rules or invent dimensions.
- Known roadworks/closures and traffic-sensitive periods, with a human-verified expected outcome.
- Invalid or unreachable stop, missing coordinates, API timeout, rate limiting, and no-network fallback.
- Change to a future route version while a trip is active: current trip must remain on its approved version.

### Measure

- Whether every stop is retained exactly once and in the approved order.
- Whether the returned road path is plausible and avoids known restrictions; review against local/operator knowledge.
- Distance/ETA error against a manually reviewed baseline; do not compare ETA alone as proof of safety.
- API latency, failure rate, rate-limit behavior, and recovery.
- Estimated monthly cost at 100 buses using the expected number of route calculations and refreshes.
- Driver-app startup time, memory, battery, mobile-data use, and usability on low-spec Android devices.

### Proposed acceptance gates

A provider passes only when all mandatory gates are evidenced:

- Written permission for the exact commercial use and an acceptable contract/SLA.
- No silent stop loss, duplication, or reordering in the supported route workflow.
- Vehicle constraints and Dammam road restrictions are validated with the operator on representative routes.
- 40+ stops are handled by a documented, tested approach. If multiple route legs are required, boundaries must preserve stop order and must not create unsafe gaps.
- Failure behavior is safe and clear; the app never presents stale route/GPS data as live.
- Cost, quotas, privacy terms, and operational support fit the pilot.

A provider that fails a mandatory gate is not selected, regardless of map appearance or ETA performance.

## Responsibilities and safety boundaries

- The operator/school must validate the actual bus dimensions, permits, stopping points, and route suitability.
- Admin reviews and approves route versions before dispatch.
- Driver Start loads the approved route; it does not optimize or reorder stops.
- Road-closure recalculation may adjust the path between stops but preserves approved stop order and requires the defined review/approval behavior.
- Keep a record of route version, provider, calculation time, relevant options, and approval.
- If routing fails, show a clear unavailable/stale state and follow the operator's fallback procedure; do not silently switch to an unvalidated route.

## Current status

- [x] Candidate research started from official provider documentation.
- [x] Important known limits and commercial-plan caveats recorded.
- [ ] Vendor written answers received.
- [ ] Representative Dammam routes tested with both APIs.
- [ ] Low-spec Android performance measured.
- [ ] Cost and SLA compared.
- [ ] Operator safety review completed.
- [ ] Final provider decision approved.

**No provider is approved yet.** Public documentation is enough to define a test, but not enough to certify school-bus routing in Dammam.
