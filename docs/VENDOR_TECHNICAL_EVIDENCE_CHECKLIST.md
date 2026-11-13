# Vendor Technical Evidence Checklist

**Status:** Draft — evidence collection only  
**Project:** School Bus Management  
**Region:** Saudi Arabia  
**Operating models:** Schools and transport companies  
**Pilot city:** Dammam dan sekitarnya (DISETUJUI)  
**Vendor selection:** BELUM DIPUTUSKAN  
**Initial service scale:** sekitar 100 bus
**Camera/AV baseline:** kamera/DVR sudah terpasang mandiri pada bus. Aplikasi menyediakan akses live stream melalui spesifikasi integrasi generik; sumber dapat berupa perangkat/DVR langsung atau aplikasi/platform AV yang sudah terpasang, jika ada metode integrasi resmi dan terotorisasi.
**Implementation:** No business features or vendor integrations are authorized by this document.

## Purpose

Use this checklist to compare candidate providers using written, verifiable evidence rather than marketing claims. Do not mark a capability as supported because it appears in a product brochure or because a demo was shown. Record the exact product, service tier, deployment region, restrictions, evidence date, and any unresolved conditions.

## Evidence status vocabulary

- **TERVERIFIKASI** — supported by current documentation and, where behavior matters, a reproducible test.
- **TERVERIFIKASI SEBAGIAN** — evidence covers only part of the requirement or a limited environment.
- **BELUM TERVERIFIKASI** — no sufficient evidence yet.
- **TIDAK DIDUKUNG** — provider has explicitly confirmed the capability is unavailable for the proposed configuration.
- **BELUM DIPUTUSKAN** — project requirement or policy has not been decided.

A vendor statement is not a test result. Keep links, document versions, written answers, test recordings/logs, and the name/date of the respondent.

## 1. Candidate and evidence record

Create one copy of this section per candidate.

| Field | Record |
|---|---|
| Provider and legal entity | BELUM TERVERIFIKASI |
| Product/service and exact plan | BELUM TERVERIFIKASI |
| Sales/technical contact and response date | BELUM TERVERIFIKASI |
| Proposed deployment region(s) | BELUM TERVERIFIKASI |
| Saudi Arabia availability confirmed in writing? | BELUM TERVERIFIKASI |
| Contracting entity / reseller, if any | BELUM TERVERIFIKASI |
| Evidence links and version/date | BELUM TERVERIFIKASI |
| Pricing basis and usage limits | BELUM TERVERIFIKASI |
| Unresolved questions / dependencies | BELUM TERVERIFIKASI |
| Overall status | BELUM TERVERIFIKASI |

## 2. Road routing and route management

**Do not choose a routing provider until Saudi coverage and large-bus constraints are proven in Dammam dan sekitarnya.** Test scenarios must reflect an initial service target of around 100 buses, without assuming all buses run or stream concurrently.

Ask the provider to answer each item explicitly:

- [ ] Written confirmation that routing is available for the intended Saudi city and roads, with the date and coverage limitations.
- [ ] Can the API model a bus using actual height, width, length, gross weight, axle/weight limits where available, and other vehicle restrictions?
- [ ] Are vehicle restrictions enforced by the routing engine itself, or must the application filter routes separately?
- [ ] Are one-way roads, prohibited turns, U-turn restrictions, closures, restricted roads, and access restrictions represented and current?
- [ ] Can a route handle 20, 30, 40, and more stops? State documented limits, waypoint limits, request limits, and optimization limits.
- [ ] Can the service optimize stop order for a school bus, or only find a path through a fixed ordered list?
- [ ] Can the application preserve an Operator-approved stop order while recalculating only the road path between stops?
- [ ] What traffic data is available in Saudi Arabia, at what times, and with what freshness? Is it included in the proposed plan?
- [ ] Are ETA, distance, route geometry/polyline, warnings, and reason codes returned?
- [ ] What happens when no feasible route is found, restrictions conflict, or a road is closed?
- [ ] Are requests/results allowed to be stored, cached, displayed, and retained? What attribution or map-display terms apply?
- [ ] What are rate limits, quotas, pricing units, service SLA, outage behavior, and support escalation paths?

**Required proof:** written coverage/vehicle-restriction answers; current API documentation; successful tests in the pilot city using representative large-bus dimensions and real road scenarios; saved request/response evidence; explicit failure tests. A successful route in one location is not proof of nationwide coverage.

## 3. GPS / AVL and vehicle tracking

- [ ] Identify the actual source: driver phone GPS, dedicated AVL/GPS hardware, existing fleet platform, or a combination. Do not assume these are interchangeable.
- [ ] Is live location available in Saudi Arabia, including mobile network and hardware requirements?
- [ ] What are the normal and worst-case update intervals, accuracy indicators, timestamps, and offline behavior?
- [ ] Does the feed expose device time and server receive time so stale updates can be detected?
- [ ] Can the system distinguish unavailable, stale, low-accuracy, and valid location?
- [ ] Is there an authenticated API/webhook, documented schema, sandbox, and versioning policy?
- [ ] Can vehicle-to-device assignments be changed with an auditable history?
- [ ] What happens when a driver changes phone, device permissions are denied, hardware is replaced, or network connectivity drops?
- [ ] What data is stored by the provider, where, for how long, and can it be deleted/exported?
- [ ] Are data ownership, permitted use, sub-processors, incident notification, and service termination addressed contractually?

**Required proof:** device/API documentation and a pilot-city test recording timestamp, coordinates, accuracy, stale feed, network loss, recovery, and device reassignment. A map marker demo alone is insufficient.

## 4. Bus cameras / DVR and live-stream access

- [ ] Exact camera/DVR make, model, firmware, supported protocols, and Saudi supplier/support arrangements.
- [ ] Does the device expose an official documented API/SDK or supported streaming protocol? Identify authentication requirements.
- [ ] Can each stream be authorized by the application server for a specific user, bus, trip, and child-access session?
- [ ] Can access be revoked promptly when a child is dropped off, guardian permission is revoked, a trip ends, or a device is reassigned?
- [ ] Do existing stream URLs/tokens remain usable after revocation? State token lifetime, refresh, and revocation mechanics for both direct-device and AV-platform options.
- [ ] Can the provider enforce concurrent-viewer limits and report active sessions?
- [ ] What happens when the camera, DVR, stream relay, or network is offline?
- [ ] Does the proposed product include recording/playback/download? If yes, can these be disabled for this project?
- [ ] Where are video streams relayed and processed in each proposed architecture? Do streams or metadata leave Saudi Arabia?
- [ ] What bandwidth, mobile-data consumption, latency, and per-stream costs should be expected?
- [ ] What security controls, audit logs, firmware updates, vulnerability handling, and support SLAs are provided?
- [ ] Who is legally permitted to view, administer, and maintain the video system under the proposed operating model?

**Required proof:** official model-specific documentation; vendor confirmation of stream authorization and revocation; a controlled test showing that an already-issued stream cannot continue to be accessed after the defined access ends. Do not test using real children or real passenger video without authorization.

## 5. Hosting, privacy, security, and Saudi compliance

These are diligence questions, not a legal opinion. Obtain qualified Saudi legal/privacy advice before production use.

**Product access model (DEC-033):** the application has one Operator with global access, plus Drivers and Guardians with scoped access. School/company is data, not an application tenant. Vendor tenancy or organization isolation must not be used to reintroduce Operator restrictions by school, organization, or region; it is relevant only where the vendor serves multiple customers.

- [ ] Identify hosting provider, contracting entity, primary region, backup region, disaster-recovery region, and all material subprocessors.
- [ ] List where identity data, child/student records, guardian contacts, precise location, route history, audit logs, and video/stream metadata are stored or processed.
- [ ] Confirm whether any personal data is transferred or remotely accessed from outside Saudi Arabia; document the transfer mechanism and assessment required for the actual case.
- [ ] Provide a data-processing agreement covering purpose, instructions, confidentiality, security, subprocessors, assistance with data-subject requests, deletion/return, and termination.
- [ ] Document encryption in transit/at rest, key management, secrets management, administrative MFA, least privilege, and privileged-access logging.
- [ ] Explain how the vendor isolates data between its customers and between application roles. The product's Operator is global; do not treat school/company isolation as an Operator restriction.
- [ ] Explain incident detection, notification timelines, investigation support, and evidence preservation.
- [ ] Document backup frequency, recovery objectives, restore testing, and deletion from backups.
- [ ] Provide retention/deletion controls for accounts, student records, precise location, trip history, logs, and video-related data.
- [ ] Document secure export, account deactivation, contract termination, data return/deletion, and access revocation.
- [ ] Provide current security/compliance certifications or independent assessment reports, scope, expiry date, and exceptions. Do not accept a logo without a current report.
- [ ] Clarify data-controller/data-processor roles for each operating model and for each school/transport company. Do not assume one role applies to every arrangement.
- [ ] Identify current Saudi education-transport licensing and vehicle/driver requirements that apply to the actual operating entity; obtain confirmation from the responsible authority or qualified counsel.

**Required proof:** contract/DPA draft, current architecture/data-flow diagram, region and subprocessors list, security documentation, retention/deletion evidence, incident terms, and written responses specific to the proposed service.

## 6. Identity, guardian links, and access boundaries

- [ ] Can authentication be integrated using documented standards (OIDC/OAuth 2.0/SAML where applicable), with MFA options for privileged users?
- [ ] Can accounts be deactivated and sessions/tokens revoked promptly?
- [ ] Can Operator staff (if any) access all schools/regions as required, while Drivers are scoped to assigned buses, routes, and duties?
- [ ] Can one guardian be linked to multiple students and a student to multiple approved guardians without exposing unrelated students?
- [ ] Does the vendor support application-enforced permissions, or does it require the project to implement all authorization independently?
- [ ] Can privileged access and sensitive data access be audited?
- [ ] What account recovery, phone-number change, verification, and anti-abuse controls exist?
- [ ] Can access be revoked when employment, school contract, bus assignment, or guardian relationship ends?

**Required proof:** access-control matrix, API documentation, vendor tenant-isolation design where applicable, and tests using separate test accounts. Tests must prove Operator global access plus Driver/Guardian isolation. Phone verification alone must not be treated as proof of guardian relationship.

## 7. Noor / government and school-system integration

- [ ] Is an official API or integration program available for the specific intended use?
- [ ] Who owns/operates the interface, and who can authorize access?
- [ ] Are written permission, a contract, credentials, sandbox, and technical documentation available?
- [ ] What data fields, scopes, rate limits, audit requirements, and service terms apply?
- [ ] Is the proposed integration supported for the intended Operator/school data model?
- [ ] If no authorized interface is available, what approved manual/import workflow can be used?

**Required proof:** official documentation and written authorization from the system owner. A public website or online registration service is not evidence that an API is available or that automated access is permitted. Do not scrape or bypass access controls.

## 8. Commercial and operational fit

- [ ] Full pricing: setup, per vehicle, per device, per user, per API request, storage, video bandwidth, support, and overage charges.
- [ ] Contract term, minimum commitments, renewal, price changes, termination, and data portability.
- [ ] Service availability/SLA, planned maintenance, support hours, response times, and Arabic/English support.
- [ ] Saudi deployment, local partner, hardware replacement, installation, warranty, and on-site support.
- [ ] Version deprecation policy, backward compatibility, change notifications, and migration assistance.
- [ ] Sandbox availability and limits; whether test use incurs charges.
- [ ] Capacity limits for expected concurrent buses, parent viewers, API calls, and peak school-start/end periods.
- [ ] Business continuity plan and escalation path for school-day incidents.

**Required proof:** written quote and contract/SLA drafts for the exact proposed configuration.

## 9. Required pilot test scenarios

Run only after the pilot city and test permissions are agreed. Use synthetic data or explicitly authorized test participants.

| Test | Pass condition | Evidence to retain |
|---|---|---|
| Large-bus routing | No known prohibited road; restrictions and warnings are visible | Request/response, vehicle profile, route map, reviewer notes |
| Many-stop route | 20/30/40+ stop behavior and limits are measured | Input size, response, errors, timing, cost |
| Fixed stop order | Road-path recalculation does not reorder approved stops | Before/after stop sequence and route geometry |
| Road closure / no feasible path | Clear warning or safe failure; no silent unsafe route | Test setup, response, UI capture |
| GPS stale/offline | UI and API distinguish stale/unavailable from current valid location | Timestamps, logs, screen capture |
| GPS accuracy/radius | Invalid or low-quality fixes cannot be treated as valid confirmation | Test coordinates, accuracy, calculated distance, result |
| Camera authorization | Only eligible user/session can open the intended stream | Authorization logs and test account matrix |
| Camera revocation | Previously issued access stops working within the agreed limit | Timed test, token behavior, server logs |
| Access isolation | Operator can reach all schools/regions; Driver/Guardian cannot reach unassigned/unrelated data | Positive/negative API tests and logs |
| Account/session revocation | Disabled user cannot continue through old sessions/tokens beyond documented limits | Test timestamps and results |
| Export and deletion | Export is authorized; deletion/termination behavior matches contract | Sample export, deletion evidence, audit log |
| Outage and recovery | Clear unavailable state; recovery does not invent fresh location/video | Timeline, logs, UI captures |

A test passes only if the expected behavior, actual result, evidence location, date, tester, and build/API version are recorded. Mark any untested case **BELUM TERVERIFIKASI**.

## 10. Decision record — do not skip

For each capability, record:

| Capability | Status | Evidence | Known limits | Owner / next action |
|---|---|---|---|---|
| Saudi routing coverage and large-bus restrictions | BELUM TERVERIFIKASI | — | Dammam and surrounding areas approved as pilot; local coverage still untested | Obtain vendor written response and run local tests |
| GPS/AVL source and update quality | BELUM TERVERIFIKASI | — | Hardware/source undecided | Define source options and test requirements |
| Camera/AV stream integration and revocation | BELUM TERVERIFIKASI | — | Existing device and AV app/platform inventory not yet supplied; direct versus mediated stream not decided | Inventory existing stack; compare official authorized direct-device and AV-platform handoff options; test authorization and revocation |
| Hosting region and data transfers | BELUM TERVERIFIKASI | — | Deployment undecided | Obtain data-flow and subprocessor details |
| Identity / access isolation | BELUM TERVERIFIKASI | — | Architecture not selected | Validate Operator global plus Driver/Guardian scoped access |
| Noor integration | BELUM TERVERIFIKASI | — | Authorization/API unknown | Request official confirmation |
| Licensing and operational responsibilities | BELUM TERVERIFIKASI | — | Operating entity/model details unresolved | Confirm with responsible authority and qualified counsel |
| Commercial and support fit | BELUM TERVERIFIKASI | — | Target around 100 buses; concurrent usage and detailed service profile undecided | Request comparable written quotes for this scale |

## 11. Gate before selecting a provider

Do not select or integrate a provider until:

1. Pilot city and representative operating scenarios are agreed: Dammam and surrounding areas.
2. The proposed school/company operating model and data responsibilities are documented.
3. Mandatory versus desirable capabilities are separated.
4. Routing and GPS candidates provide model/region-specific written evidence; camera integration is assessed against a vendor-neutral requirement that allows either direct device/DVR access or an authorized stream from an existing AV app/platform.
5. Privacy, hosting, data-transfer, security, licensing, and contract questions are reviewed by qualified parties.
6. Critical pilot tests pass or have an explicitly accepted, documented limitation.
7. Pricing, quotas, support, exit, and data-portability terms are understood.
8. The decision is recorded in `docs/DECISIONS_LOG.md`; unresolved issues remain visible and are not silently treated as decisions.

## Related project documents

- `docs/MASTER_SPEC.md`
- `docs/TECHNICAL_SPEC_REVIEW.md`
- `docs/TECHNICAL_REVIEW_FINDINGS.md`
- `docs/OPERATING_MODEL_RESPONSIBILITY_MATRIX.md`
- `docs/DECISIONS_LOG.md`

**Scope boundary:** This checklist creates no vendor commitment, legal conclusion, route-provider choice, camera choice, GPS choice, integration, database change, or business feature implementation.
