---
title: "Data analytics"
cluster: "learn"
description: "Data pipelines, warehousing, and dashboards that turn scattered operational data into a single source of truth."
order: 11
draft: false
---

A dashboard is only as trustworthy as the pipeline feeding it. Most "we don't trust our own reports" problems aren't a visualization problem at all — they're an unreliable, undocumented data pipeline problem that a nicer chart won't fix.

## What's included

Data pipeline design that consolidates sources reliably and on a defined schedule, with explicit handling for what happens when a source is late, malformed, or temporarily unavailable — the failure modes that actually cause the "the numbers don't match" conversations. A properly modeled data warehouse, with consistent definitions enforced across every source system that feeds it, so "active customer" means the same thing everywhere it's reported. Dashboards built around the specific decisions they're meant to inform, not a generic collection of every metric that could technically be shown. Data quality monitoring that flags anomalies automatically, rather than waiting for someone to notice a number looks wrong. And documentation of exactly how each metric is calculated, so trust in the numbers doesn't depend on one person's institutional memory.

## When to bring us in

If different teams routinely produce different numbers for what should be the same metric, or if "let me double-check that in the actual system" is a common response to your own reports, that's the clearest sign the pipeline — not the dashboard — needs attention first.
