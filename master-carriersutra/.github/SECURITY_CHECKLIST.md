# Security and release checklist

This is a review checklist, not a claim that the application is production-ready.

## Before launch
- [ ] Confirm every parent-only route rejects student tokens.
- [ ] Verify all account deletion and credential changes revoke old sessions.
- [ ] Add integration tests for registration, login, lockout, account deletion, and data isolation.
- [ ] Test API request-size limits, malformed JSON, and rate limits.
- [ ] Validate uploaded and embedded URLs against an explicit allowlist.
- [ ] Review all DOM insertion points for untrusted content and XSS.
- [ ] Set a persistent, random SESSION_SECRET (32+ characters).
- [ ] Configure HTTPS, secure cookies or equivalent token protections, and restricted CORS.
- [ ] Use an appropriate persistent database and encrypted backups; evaluate concurrent writes.
- [ ] Review third-party AI/voice data processing and obtain appropriate parental consent for children.
- [ ] Publish an accurate privacy notice, retention policy, and deletion process.
- [ ] Disable FREE_TEST_VOICE in production and verify provider terms.
- [ ] Run dependency, secret, and container scans before release.
- [ ] Verify accessibility, mobile layouts, and error states with real users.

## Known limitations from initial code review
- Existing smoke tests simulate browser rendering; they do not test the live HTTP API.
- The current storage is file-based, which needs concurrency and backup review before scaling.
- AI and TTS integrations require real credentials and live testing.
- No production readiness claim should be made based on smoke tests alone.
