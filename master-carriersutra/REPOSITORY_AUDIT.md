# Repository audit

## PR #1

The proposed workflow runs syntax checks and the package test command on Node 20 and 22, with read-only repository permissions. The app has no runtime package dependencies, so an install step is currently unnecessary. The original smoke tests simulate browser screens. They do not validate account endpoints or call live providers. Keep PR #1 focused on establishing the CI baseline.

## Findings and changes

| Area | Finding and status |
| --- | --- |
| Sessions and API | The session version was checked before the asynchronous body read, and bearer parsing accepted extra token segments. The session hardening branch validates the token and rechecks the active family version before invoking the route. |
| Authentication | Unknown family codes previously skipped the dummy password hash and accumulated lockout records. The hardening branch checks the dummy hash and only records lockouts for existing families. Per-key rate-limit histories stop growing once the cap is reached. Shared and globally bounded rate limiting remains open. |
| Storage | A single process writes a JSON snapshot using a temporary file and rename. Storage remains single-writer. Writes may block the event loop, and an unsuccessful save can leave in-memory changes pending. Before scaling, migrate with backup and restore verification and test failure recovery. |
| Frontend | The VM smoke suite covers core screen rendering and actions. The tutor client handles missing or empty answers explicitly. Browser checks remain for keyboard access, mobile layouts, and network interruption. Progress sync still suppresses errors, and local storage contains session tokens and cached app state. Review persistence and visible sync status together. |
| AI and speech | The tutor now validates retained messages, screens all retained turns for the existing phone and email patterns, and rejects empty provider answers. Cloud speech also uses the same screening. This pattern-based check has limited coverage. Verify provider model support, failure paths, budgets, and student-data handling before launch. |
| Release | The container runs as an unprivileged user. Production requires a 32-character session secret, ignores the unofficial voice provider, and leaves provider startup probes off by default. Configure durable storage and HTTPS before serving real users. |

## Release verification

- Run `npm test` from `master-carriersutra/`. The session hardening branch adds HTTP integration coverage for registration, roles, family isolation, session revocation, and unconfigured providers.
- Mount a writable persistent volume at `/app/data` for the container. Keep one writer, confirm the mount permits writes by the image's `node` user, and verify restore using disposable data.
- Set `NODE_ENV=production` and a stable random `SESSION_SECRET` of at least 32 characters. Terminate HTTPS at the hosting edge. Set `TRUST_PROXY=1` only if the app is reachable solely through a trusted proxy that overwrites the forwarding header.
- Use `GET /api/health` for an application liveness check. Provider flags indicate configuration. They do not certify provider availability. The optional `CHECK_VOICES_ON_START=1` probe sends a request per supported language and may be billed.
- Review session storage, student-data retention and deletion, and parental consent and provider handling before collecting real student data.
- Verify with mocked providers first. Container startup, live provider compatibility, and real browser accessibility require separate verification.
