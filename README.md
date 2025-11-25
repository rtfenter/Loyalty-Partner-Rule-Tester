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
  - When overrides apply (e.g., partner wins over default rule)  
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
      (e.g., region blocks, tier blocks,
          special promotional window)
                      |
                      v
         Final Eligibility & Outcome
      (eligible / blocked / modified earn)
                      |
                      v
           Human-Readable Explanation
      ("Eligible via partner override in EU",
       "Blocked: partner not available in JP")

---

## Purpose

In production systems, partner behavior is where loyalty logic usually starts to drift:

- Contracts define one set of rules  
- Implementation adds shortcuts or special cases  
- Regions negotiate exceptions  
- Campaigns stack on top of existing conditions  

Over time, it becomes hard to answer a basic question:  

**“Is this partner allowed to earn here, for this customer, right now — and why?”**

This tool provides a small, understandable way to:

- Define a compact partner rule set  
- Run scenarios against it  
- See which rule actually fired  

—

## How This Maps to Real Loyalty Systems

Even though it's minimal, each part corresponds to real architecture:

### Base Program Eligibility  
In real systems, global rules define who can earn or redeem at all: program membership, status, regulatory constraints, and sometimes KYC or AML checks.

### Partner Rule Resolution  
Partners typically fund different earn rates, categories, or channels. They may restrict earning to certain regions, tiers, or payment methods. In production, these rules live across code, configs, and contracts.

### Override & Exception Layer  
This is where complexity accumulates: regional exceptions, legacy agreements, special migration deals, or “temporary” rules that never get removed. This layer is often opaque to everyone except the team maintaining it.

### Final Eligibility & Outcome  
The system must decide: eligible or not, and at what earn rate or condition. That outcome is what gets written to the ledger — and what members eventually see (or don’t see) in their account.

### Explanation Layer  
The UI and operations teams need a way to explain decisions: “Why did this member not earn here?” or “Why is this partner available in one market and not another?”  
This prototype focuses on that explainability: smaller rule set, clear evaluation, human-readable summary.

This tool is a legible micro-version of how partner rule engines behave under the hood.

---

## Part of the Loyalty Systems Series

Main repo:  
https://github.com/rtfenter/loyalty-series

---

## Status  

MVP is implemented and active.  
Frontend implementation in progress — this prototype will remain intentionally lightweight and focused on making partner rules testable and explainable, not on modeling every edge case in production.

---

## Local Use

No installation required.  
Once implemented, to run the tester locally:

1. Clone the repo  
2. Open `index.html` in your browser  

Everything will run client-side.
