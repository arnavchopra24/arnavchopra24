---
# ════════════════════════════════════════════════════════════════
#  NEW DEAL: RESTRUCTURING / LIABILITY MANAGEMENT (LME)
#
#  1. Copy everything in this file.
#  2. On GitHub, open the _deals folder → Add file → Create new file.
#     Name it after the company, e.g.  company-name-chapter-11.md
#     (lowercase, dashes instead of spaces, ends in .md)
#  3. Paste, fill in, delete what you don't need, then Commit.
#
#  Rules that keep the site from breaking:
#  • Keep the quotes around text. Don't use " inside quoted text.
#  • Numbers only, no $ x % signs. The site adds the units.
#  • Leave a field blank (nothing after the colon) to hide it.
#  • Dates are YYYY-MM-DD.
#
#  Best sources: the first-day declaration, the restructuring
#  support agreement (RSA), and the disclosure statement, which has
#  the recovery table by creditor class.
# ════════════════════════════════════════════════════════════════

published: true                  # false = draft, hidden from the site

title: "Company Name: prearranged Chapter 11"
subtitle: "One sentence with your angle on the restructuring"

announced: 2026-01-31            # filing or launch date
written: 2026-01-31              # the day you publish this write-up

sector: "Industrials"
deal_type: "Restructuring / LME"
transaction_type: "Prearranged Chapter 11"   # Prepackaged Chapter 11 | Prearranged Chapter 11 | Free-fall Chapter 11 | Out-of-court LME
status: "In Chapter 11"          # In Chapter 11 | Emerged | Completed | Converted to Chapter 7
verdict: "Too early to tell"     # Good deal | Overpaid | Too early to tell
                                 # (for restructurings, read "Good deal" as "fixes the company")

# ── Capital structure ($ billions unless noted) ─────────────────
debt_before:                     # total funded debt before, e.g. 3.3
debt_equitized:                  # debt converted to equity or eliminated, e.g. 0.795
dip:                             # DIP financing, $ millions, e.g. 300
new_money:                       # rights offering / new equity, $ millions, e.g. 350
plan_ev:                         # enterprise value in the plan, e.g. 1.2

# ── Recoveries by creditor class (copy a block per class) ──────
recoveries:
  - class: "Senior secured notes"
    claim:                       # $ millions
    treatment: "New notes and equity"
    recovery:                    # % estimated recovery
  - class: "Convertible notes"
    claim:
    treatment: "Equity"
    recovery:

# ── Advisors (one per line) ────────────────────────────────────
company_advisors:
  - "Bank Name"
creditor_advisors:
  - "Bank Name"

# ── Sources (one per line; a link at the end becomes clickable) ─
sources:
  - "First-day declaration https://"
  - "Restructuring support agreement"
  - "Disclosure statement: recovery table"

# ── Updates: add one each time something happens ───────────────
updates:
  # - date: 2026-03-01
  #   note: "Plan confirmed by the court."

# ── Verdict review: fill in when you revisit the deal ──────────
verdict_today:
reviewed_on:
review_note:
---

## Situation

What the company does and how it got into trouble, in three or four sentences.

## The Deal

The restructuring support agreement or LME terms: who is providing money, which debt gets converted, and who ends up owning the company.

## Capital Structure & Recoveries

The debt stack before and after, and what each creditor class recovers. The recovery table from the top of this file appears under this section.

## Plan Value

The enterprise value the plan implies and how it was set. What has to be true for creditors to be made whole?

## Risks

Does this fix the business or just the balance sheet? Risk of a second filing ("Chapter 22"), operational and liquidity risks.

## Market Reaction

How the bonds and the stock traded on the news.

## My Take

Does this restructuring fix the company? Your verdict, and why.

## 30-Second Version

The answer you would give if an interviewer asked about a recent restructuring.
