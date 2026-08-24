---
title: "How we scope a fixed-price project without under-quoting it"
category: "Product"
excerpt: "The discovery questions that separate an accurate estimate from a guess."
publishDate: 2026-06-16
author: "DivSphere"
readTime: "4 min read"
seoTitle: "How to Scope a Fixed-Price Project"
draft: false
---

A fixed-price quote is a promise about the future made with incomplete information, which is exactly why most of them are wrong. The gap between a quote that holds and one that turns into scope-creep arguments three months in almost never comes down to estimating skill. It comes down to which questions got asked — and answered in writing — before the number was set.

## Start with what "done" actually means

The single biggest source of fixed-price disputes is a mismatched definition of done. "Build a customer portal" means something different to the person who imagines a login screen and a dashboard than to the person who imagines role-based permissions, audit logging, and integration with three existing systems. Both are reasonable interpretations of the same three words, and only one of them is what got quoted.

The fix is unglamorous but effective: write down, in enough detail that both sides could point to any feature and agree whether it's in or out, exactly what ships. Not a mission statement — a list specific enough to catch disagreements before they're expensive. If a requirement can't be described specifically enough to estimate, it isn't ready to be quoted yet, and any number attached to it is a guess wearing a quote's clothing.

## Ask about the systems it has to talk to, not just what it has to do

A feature's complexity rarely lives in the feature itself — it lives in what it has to integrate with. "Sync customer data between the CRM and the billing system" sounds like one line item. Whether that's a week of work or two months depends entirely on whether both systems have documented, stable APIs; whether the data models actually match or need translation logic; whether the sync needs to handle conflicts when both systems are edited at once; and whether either system has rate limits that constrain how the integration can be built.

Every integration point in a project should get its own explicit discovery pass — what's the API like, who has tested it, what happens when it's down — before it becomes a single bullet point in a proposal.

## Separate what's genuinely fixed from what's genuinely variable

Not every part of a project is equally estimable up front. Well-understood, mechanical work — a standard CRUD interface, a known integration with well-documented third-party APIs, features similar to ones already built before — can be quoted with real confidence. Work that depends on unknowns outside anyone's control — a legacy system with no documentation that needs to be reverse-engineered, a design that hasn't been finalized, a third-party API with unclear rate limits and no sandbox to test against — cannot honestly be quoted with the same confidence, no matter how the estimate is dressed up.

The honest response to this isn't to quote the unknowns anyway and hope. It's to separate the estimate into a fixed-price core for the well-understood work and a time-and-materials or capped-estimate approach for the genuinely uncertain parts, with an explicit discovery phase to de-risk them before they get a fixed number attached. Clients sometimes push back on this at first — a single fixed number feels simpler — but it's the difference between a quote that holds and a quote that becomes an argument.

## Write the assumptions down, not just the deliverables

Every estimate is built on assumptions, and the ones that go unwritten are the ones that cause disputes later. "The client will provide content and images" is an assumption. "The existing API will handle the expected load" is an assumption. "There's one main user role, not five" is an assumption. None of these are wrong to assume — they're wrong to leave unstated, because when one turns out to be false, an unwritten assumption becomes "scope creep" from the client's perspective and "of course that wasn't included" from the vendor's, and both sides are arguing about something that should have been settled before the contract was signed.

A scoping document that lists assumptions as explicitly as it lists deliverables turns a future disagreement into a five-minute conversation: "this assumption turned out to be wrong, here's what changes." That's a much easier conversation to have than the one where nobody agreed on what was assumed in the first place.

## The discovery investment that pays for itself

The pattern across all of this is the same: an hour spent in discovery, pinning down definitions of done, integration realities, genuine unknowns, and explicit assumptions, is worth far more than an hour spent polishing the estimate itself. A rushed discovery process produces a confident-looking number built on guesses. A real discovery process produces a number that might be less exciting to present, but is far more likely to still be accurate on delivery day — which is the only thing a fixed-price quote is actually for.
