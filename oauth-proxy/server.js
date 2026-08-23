/**
 * DivSphere CMS OAuth proxy
 * ─────────────────────────
 * Decap CMS's `github` backend needs *something* to run the GitHub
 * OAuth handshake and hand back an access token — Netlify Identity did
 * this for free when the CMS used the `git-gateway` backend. Since
 * we're not using Netlify, this small always-on service does that one
 * job instead. It holds no content, no database, no session store —
 * it only ever sees a `code` from GitHub and turns it into a token.
 *
 * Deploy target: a Hostinger "Node.js Web App" (Business plan and up
 * support this natively — no VPS needed). See ../README.md → "Going
 * live" for the exact setup steps, including the GitHub OAuth App
 * you need to register first.
 *
 * Protocol notes (so nobody has to reverse-engineer this again):
 * Decap CMS opens a popup at `${base_url}/auth?provider=github&...`,
 * then waits for that popup to postMessage `"authorizing:github"`
 * back to it. Once Decap sees that (checking the message's origin
 * against `base_url` from config.yml), it echoes the same message
 * back to the popup — that echo is this popup's cue that Decap is
 * listening, safe to send the real result. That final message is
 * `"authorization:github:success:" + JSON.stringify({ token, provider })`,
 * or `"authorization:github:error:" + JSON.stringify({ message })` on
 * failure. Get any of those strings wrong and the CMS just hangs on
 * "Authorizing" with no error — this is verified against the exact
 * decap-cms-app bundle this project ships, not just docs.
 */

const express = require("express");
const crypto = require("node:crypto");

const {
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  OAUTH_SECRET,
  OAUTH_SCOPE = "repo",
  BASE_URL,
  PORT = 3000,
} = process.env;

for (const [name, value] of Object.entries({
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  OAUTH_SECRET,
  BASE_URL,
})) {
  if (!value) {
    console.error(
      `[oauth-proxy] Missing required environment variable: ${name}. ` +
        `Set it in Hostinger's Node.js app "Environment variables" panel and restart the app.`,
    );
    process.exit(1);
  }
}

const app = express();

// Hostinger (and most PaaS-style Node hosts) sit behind a proxy —
// trust it so we see the real protocol/host if we ever need them.
app.set("trust proxy", true);

app.get("/", (_req, res) => {
  res.type("text/plain").send("DivSphere CMS OAuth proxy is running.");
});

/**
 * Step 1 — Decap opens this in a popup. Send the browser on to
 * GitHub's own authorize screen, with a signed, time-limited `state`
 * value so /callback can reject anything that didn't originate here
 * (standard OAuth CSRF protection) without needing a session store.
 */
app.get("/auth", (req, res) => {
  const provider = req.query.provider;
  if (provider !== "github") {
    return res.status(400).send(`Unsupported provider: ${String(provider)}`);
  }

  const state = signState({ t: Date.now() });
  const redirectUri = `${BASE_URL}/callback`;

  const authorizeUrl = new URL("https://github.com/login/oauth/authorize");
  authorizeUrl.searchParams.set("client_id", GITHUB_CLIENT_ID);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("scope", OAUTH_SCOPE);
  authorizeUrl.searchParams.set("state", state);

  res.redirect(authorizeUrl.toString());
});

/**
 * Step 2 — GitHub sends the browser back here with a `code`. Exchange
 * it server-side for an access token (this is the one step that MUST
 * happen on a server — it needs the client secret) and hand the token
 * to the CMS popup's opener via postMessage.
 */
app.get("/callback", async (req, res) => {
  const { code, state, error, error_description: errorDescription } = req.query;

  if (error) {
    return sendResult(res, {
      ok: false,
      message: errorDescription ? String(errorDescription) : String(error),
    });
  }

  if (!code || !state || !verifyState(String(state))) {
    return sendResult(res, {
      ok: false,
      message: "Invalid or expired authorization attempt. Close this window and try logging in again.",
    });
  }

  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${BASE_URL}/callback`,
      }),
    });

    const body = await tokenRes.json();

    if (!tokenRes.ok || !body.access_token) {
      return sendResult(res, {
        ok: false,
        message: body.error_description || body.error || "GitHub did not return an access token.",
      });
    }

    return sendResult(res, { ok: true, token: body.access_token });
  } catch (err) {
    console.error("[oauth-proxy] token exchange failed:", err);
    return sendResult(res, {
      ok: false,
      message: "Could not reach GitHub to exchange the authorization code. Try again in a moment.",
    });
  }
});

/** Signs `{t: <timestamp>}` with OAUTH_SECRET; valid for 15 minutes. */
function signState(payload) {
  const json = JSON.stringify(payload);
  const data = Buffer.from(json).toString("base64url");
  const sig = crypto.createHmac("sha256", OAUTH_SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

function verifyState(state) {
  const [data, sig] = state.split(".");
  if (!data || !sig) return false;

  const expectedSig = crypto.createHmac("sha256", OAUTH_SECRET).update(data).digest("base64url");
  const sigOk =
    sig.length === expectedSig.length &&
    crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig));
  if (!sigOk) return false;

  try {
    const { t } = JSON.parse(Buffer.from(data, "base64url").toString());
    return typeof t === "number" && Date.now() - t < 15 * 60 * 1000;
  } catch {
    return false;
  }
}

/**
 * Renders the tiny page that runs inside the popup and finishes the
 * handshake described at the top of this file. `JSON.stringify` here
 * both encodes the payload and escapes it for safe embedding in a
 * <script> block; the extra `</` guard stops a token that happened to
 * contain that sequence from closing the tag early.
 */
function sendResult(res, result) {
  const payload = result.ok
    ? { token: result.token, provider: "github" }
    : { message: result.message };
  const messageType = result.ok ? "success" : "error";
  const payloadJson = JSON.stringify(payload).replace(/<\//g, "<\\/");

  res.status(result.ok ? 200 : 400).type("html").send(`<!doctype html>
<html>
  <head><meta charset="utf-8" /><title>${result.ok ? "Signed in" : "Sign-in failed"}</title></head>
  <body style="font-family: system-ui, sans-serif; padding: 40px; color: #333;">
    <p>${result.ok ? "Signed in — you can close this window." : "Sign-in failed: " + escapeHtml(result.message)}</p>
    <script>
      (function () {
        function receiveMessage(e) {
          window.opener.postMessage(
            "authorization:github:${messageType}:" + JSON.stringify(${payloadJson}),
            e.origin,
          );
          window.removeEventListener("message", receiveMessage, false);
        }
        window.addEventListener("message", receiveMessage, false);
        window.opener.postMessage("authorizing:github", "*");
      })();
    </script>
  </body>
</html>`);
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[c]);
}

app.listen(PORT, () => {
  console.log(`[oauth-proxy] listening on port ${PORT}, base URL ${BASE_URL}`);
});
