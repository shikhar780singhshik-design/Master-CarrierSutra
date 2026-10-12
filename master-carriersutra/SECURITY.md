# Security notes

## What protects the app
- **Accounts:** PIN (6+ characters) and parent password (8+, different) are stored only as scrypt hashes. Repeated characters and common passwords are refused.
- **Brute force:** sign in is rate limited per IP and per family code. Five wrong tries lock a code for 15 minutes, ten for a day. A decoy hash is checked for unknown codes, so timing never reveals which codes exist.
- **Sessions:** signed tokens last 7 days. "Sign out everywhere" cancels every token for the family at once. The page signs itself out after 30 quiet minutes, which helps on shared school computers. Tokens travel in a header, not a cookie, so cross site request tricks do not apply.
- **Parents** can only read progress. Only the student can change it.
- **Saved data is rebuilt field by field** on the server. Unexpected fields, oversized values and links that are not http or https (for example javascript: links) are thrown away.
- **Browser protections:** strict Content Security Policy (only our own scripts, YouTube and Vimeo for videos), no framing, no content sniffing, same origin policy headers, and no caching of API replies.
- **Files:** only the `public` folder is served. Hidden files and `../` tricks are blocked.
- **Children's privacy:** messages containing phone numbers or emails are not sent to the AI, the AI is told to stay child safe, and the chat reminds students not to share personal details.
- **Secrets** live only in `.env` on the server. The page never sees any key.

## What you must still do
1. Serve the site over HTTPS (hosts like Render and Railway do this for you) and set `NODE_ENV=production` and `TRUST_PROXY=1`.
2. Set a long random `SESSION_SECRET`. The server refuses to start in production without one.
3. Back up `data/families.json`, or move to a managed database such as Postgres.
4. Add your support email to the Privacy Policy and Terms, and get both reviewed by a lawyer. Check parental consent rules for under 18s.
5. Keep Node.js updated and never commit `.env`.

## Known limits
- Lockouts are kept in memory, so a restart clears them. Someone who knows a family code can lock that family out for a while; that is the price of stopping guessing.
- The family code is the account name. Treat it like a username, not a secret.
- This has not had a professional penetration test. Do one before launching widely.
