# Connect Pinkiri email and Google authentication

**Paused at the owner’s request.** Login requirements and links are removed. Auth pages return to the requested workspace; provider calls are disabled by AUTH_ENABLED in lib/auth/server.ts. The instructions below describe the shelved integration, not an active requirement. Re-enabling requires restoring server guards and per-account storage as well as configuring the provider.

The UI and server-side integration are implemented using Supabase Auth. No Supabase project is connected yet. The app intentionally blocks research without a verified session; it does not offer fake sign-in. Existing anonymous browser reports are retained under their old keys, but are not automatically assigned to a newly signed-in account. Workspaces remain device-local, not database-backed.

## 1. Create the authentication project

Create a project at https://supabase.com/dashboard using the free plan. Keep the database password in your password manager; Pinkiri does not need that password or a service-role/secret key.

In the project's Connect dialog, copy Project URL and Publishable key. Put them into the prepared entries in `.env.local`:

```
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
APP_ORIGIN=http://localhost:5173
```

Restart the development server after saving. Do not put Gemini or Firecrawl keys in any public environment variable. Supabase values are read on the server; auth tokens use HttpOnly, SameSite=Lax cookies, Secure in production. No passwords are stored by Pinkiri.

## 2. Configure email

In Supabase Authentication, enable email/password and keep email confirmation enabled. Set a minimum password length of 12 to match the app.

In URL Configuration set Site URL to `http://localhost:5173`. Add `http://localhost:5173/auth/callback**` to allowed Redirect URLs so the query string retaining the submitted website can pass. Before deployment add the actual HTTPS application origin with the same callback path and change hosted APP_ORIGIN. Do not use an unrestricted host wildcard.

For default confirmation emails, open the email in the same browser/device that initiated signup; the default SSR flow uses PKCE. The callback also supports token_hash links for cross-device confirmation if custom templates are configured:

- Signup: `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=signup`
- Recovery: `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery`

Supabase's default mail service sends only to project-team email addresses and has tight rate limits. Configure custom SMTP in Supabase before inviting external email/password testers. SMTP credentials belong in Supabase, not this app. Confirm your sender/domain with your mail provider. Google sign-in does not require Pinkiri's email delivery setup.

## 3. Configure Google

In Google Cloud / Google Auth Platform create a Web application OAuth client. Set the consent screen's app name to Pinkiri, configure the intended audience and test users if in testing mode. Use the authorized redirect URI shown in Supabase's Google provider settings (normally `https://YOUR_PROJECT.supabase.co/auth/v1/callback`).

Enable Google in Supabase Authentication / Providers and save the Google client ID and client secret there. These are different credentials from the Gemini API key. Pinkiri itself needs only the Supabase URL and publishable key.

## 4. Verify before inviting people

- Signup, confirmation and login using a real test mailbox.
- Incorrect password, duplicate signup, expired/reset links and mismatched passwords.
- Google login returns to the submitted website.
- Logout and direct navigation to /workspace returns to login.
- Unauthenticated research, competitor and chat requests return 401 without calling providers.
- Expired sessions refresh cookies, and account changes never load another account's browser workspace.
- Check production HTTPS cookie handling, actual hosting redirects, email delivery and allowed origins before enabling hosted research.

Current research APIs retain their localhost restriction. This work does not deploy the app, enable hosted research, implement billing/paid entitlements, or introduce durable per-user report storage. Local storage separation is a usability boundary, not encrypted storage on a shared browser.

References:
- https://supabase.com/docs/guides/auth/server-side/creating-a-client
- https://supabase.com/docs/guides/auth/social-login/auth-google
- https://supabase.com/docs/guides/auth/auth-smtp
