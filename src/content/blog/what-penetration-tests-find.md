---
title: "What a penetration test actually finds, in practice"
category: "Security"
excerpt: "A breakdown of the vulnerability classes that show up most often, and why they're rarely the ones teams expect."
publishDate: 2026-07-14
author: "DivSphere"
readTime: "6 min read"
seoTitle: "What Penetration Tests Actually Find"
draft: false
---

Ask a team what a penetration test is likely to find before it starts, and the answer is almost always some version of a sophisticated, novel attack — a zero-day, a clever exploit chain, something that took real ingenuity to discover. The reality, across most engagements, is far more mundane and far more useful to know in advance: the majority of exploitable findings are ordinary, well-documented issues that simply weren't caught during development. That's not a disappointing result — it's the entire value of the exercise.

## Broken access control is the most common serious finding

Consistently, across application types and industries, broken access control tops the list of what testing actually surfaces — a user able to view or modify data that isn't theirs by changing an ID in a URL or an API request, an admin function reachable by a regular user who simply knows or guesses the right endpoint, a permissions check that exists on the page a user sees but not on the API call underneath it. This class of vulnerability persists because it's invisible in normal use — everything looks correct to a user following the intended path through the application. It only surfaces when someone deliberately tests the boundaries, which is exactly what a test is for and exactly what day-to-day QA rarely covers.

## Injection vulnerabilities are less common than they used to be, but still show up

Modern frameworks have made classic SQL injection meaningfully rarer than a decade ago, largely because parameterized queries are now the framework default rather than something a developer has to remember to do. But injection as a category hasn't disappeared — it's shown up in newer forms: NoSQL injection in document databases, command injection in features that shell out to system utilities, and injection through less obvious inputs like file names, HTTP headers, or data that arrived from a third-party API and was trusted without validation because it "came from our own system." The pattern is the same as ever: user-controllable input reaching a place that interprets it as code or a command rather than as data.

## Authentication and session weaknesses, more often than expected

Password reset flows are a disproportionately common source of findings — a reset token that's predictable, doesn't expire, or isn't invalidated after use; a reset flow that leaks whether an email address has an account through a subtly different error message. Session handling produces its own recurring issues: sessions that don't expire on logout, tokens that remain valid long after a password change, or session identifiers exposed in URLs where they end up in browser history and server logs. None of these require sophisticated exploitation — they require someone to methodically walk through the authentication flow asking "what happens if," which is precisely the discipline a structured test brings that ordinary development timelines rarely leave room for.

## Sensitive data exposure through error messages and debug output

Verbose error messages that leak stack traces, database structure, or internal file paths are a recurring, low-effort finding — genuinely useful to an attacker mapping out a system, and almost always the result of a debug configuration that was meant to be temporary and was never turned off before launch. API responses that return more data than the interface actually displays are a close relative of the same problem: a mobile app's UI might show only a user's name, but the underlying API response often includes far more, all of it retrievable by anyone willing to inspect network traffic rather than trust the app's screen.

## Security misconfiguration, the quiet majority

Across engagements, misconfiguration as a broad category — missing security headers, permissive CORS policies, default credentials left in place on an admin interface, cloud storage buckets with looser permissions than intended, outdated software components with known, published vulnerabilities — accounts for a large share of total findings, usually more than any single vulnerability class on its own. None of it is exotic. All of it is checkable with the right tooling and the right checklist, which is exactly why it persists: it's not that the fix is hard, it's that nobody was specifically tasked with checking for it before launch.

## What this actually means for a team preparing for a test

The practical implication cuts against the instinct to prepare for a test by hardening against imagined sophisticated attacks. The vulnerabilities that show up most often are the boring, well-documented ones: access control that isn't checked consistently across every code path, input that's trusted because it came from an internal source, error handling that leaks more than it should, and configuration that was left at a permissive default. A team that has genuinely nailed those fundamentals will make a tester work considerably harder to find anything real — and the findings that do surface will be worth taking seriously precisely because they weren't the easy, expected ones.

The honest goal of a penetration test isn't to walk away with a clean report — a suspiciously clean first-time report is itself a signal that the test wasn't thorough enough, not that the system is unusually secure. The goal is a specific, actionable list of what's genuinely wrong, in priority order, with enough detail that fixing it doesn't require a second round of guessing. That's what makes the exercise worth the cost, and it's why the "boring" findings are usually the most valuable ones in the report.
