# Loyalty Partner Rule Tester  
[![Live Demo](https://img.shields.io/badge/Live%20Demo-000?style=for-the-badge)](https://rtfenter.github.io/Loyalty-Partner-Rule-Tester/)

### A small tool to test how partner eligibility, overrides, and exceptions behave across regions.

This project is part of my **Loyalty Systems Series**, exploring how loyalty systems behave beneath the UI layer — from event flow to FX reconciliation to partner tiering.

The goal of this rule tester is to make partner logic legible:

- Region eligibility  
- Partner-specific overrides  
- Exceptions and block rules  
- Tier constraints  
- Campaign or category flags  

Instead of hiding partner conditions inside code or contracts, this prototype exposes them as a simple, testable surface.

---

## Features (MVP)

The prototype includes:

- Inputs for region, partner, tier, and basic transaction context  
- A small, embedded rule set that defines:
  - Where a partner is eligible  
  - Which regions or tiers are blocked  
  - When overrides apply  
- A rule evaluation summary showing:
  - Whether the transaction is eligible for earn  
  - Which rule fired (base, override, or exception)  
  - Why a rule denied or modified eligibility  
- A tiny “explainability” panel that describes, in plain language, what happened.

---

## Demo Screenshot

<img width="2804" height="1860" alt="Screenshot 2025-11-25 at 09-27-18 Loyalty Partner Rule Tester" src="https://github.com/user-attachments/assets/921b2003-8954-4cdf-a9e0-6aaf2daea937" />

---

## Partner Rule Evaluation Flow

```
[Region + Partner + Tier + Context]
                  |
                  v
        Base Program Eligibility
       (global rules for earn/redeem)
                  |
                  v
        Partner Rule Resolution
  (partner-specific allow/deny/limits)
                  |
                  v
        Override & Exception Layer
  (region blocks, tier blocks, promos)
                  |
                  v
     Final Eligibility & Outcome
  (eligible / blocked / modified earn)
                  |
                  v
       Human-Readable Explanation
("Eligible via partner override in EU",
 "Blocked: partner not available in JP")
```

---

## Purpose

In production systems, partner behavior is where loyalty logic usually starts to drift:

- Contracts define one set of rules  
- Implementation adds shortcuts or special cases  
- Regions negotiate exceptions  
- Campaigns stack on top  

Over time, it becomes hard to answer a basic question:  

**“Is this partner allowed to earn here, for this customer, right now — and why?”**

This tool provides a small, understandable way to:

- Define a compact partner rule set  
- Run scenarios against it  
- See which rule actually fired  

---

## How This Maps to Real Loyalty Systems

### Base Program Eligibility  
Global eligibility rules: membership, regulatory constraints, KYC/AML, or program-level restrictions.

### Partner Rule Resolution  
Where partner-specific rules live: earn rates, categories, funding rules, and region/tier restrictions.

### Override & Exception Layer  
Regional exceptions, migration contracts, promotional windows — the layer that grows chaotic over time.

### Final Eligibility  
The system must output a clear truth: allowed or denied, with the correct conditions applied.

### Explanation Layer  
Critical for support, operations, and member-facing transparency.

This prototype builds a legible slice of that entire rule engine.

---

## Part of the Loyalty Systems Series

Main repo:  
https://github.com/rtfenter/Loyalty-Systems-Series

---

## Status  

MVP is implemented and active.  
This tool will remain intentionally lightweight — focused on clarity and rule explainability.

---

## Local Use

Everything runs client-side.

1. Clone the repo  
2. Open `index.html` in your browser  

That’s it — no backend required.
