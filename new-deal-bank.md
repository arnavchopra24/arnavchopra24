---
# ════════════════════════════════════════════════════════════════
#  NEW DEAL: BANK MERGER
#
#  1. Copy everything in this file.
#  2. On GitHub, open the _deals folder → Add file → Create new file.
#     Name it after the deal, e.g.  buyer-bank-target-bank.md
#     (lowercase, dashes instead of spaces, ends in .md)
#  3. Paste, fill in, delete what you don't need, then Commit.
#
#  Rules that keep the site from breaking:
#  • Keep the quotes around text. Don't use " inside quoted text.
#  • Numbers only, no $ x % signs. The site adds the units.
#  • Leave a field blank (nothing after the colon) to hide it.
#  • Dates are YYYY-MM-DD.
#
#  Banks are valued on price / tangible book and P/E, not EV/EBITDA.
#  The merger press release and investor deck usually list every
#  number below on one "transaction terms" slide.
# ════════════════════════════════════════════════════════════════

published: true                  # false = draft, hidden from the site

acquirer: "Buyer Bank"
target: "Target Bank"
subtitle: "One sentence with your angle on the deal"

announced: 2026-01-31            # when the deal was announced
written: 2026-01-31              # the day you publish this write-up

sector: "Financials"
deal_type: "Bank merger"
status: "Pending"                # Pending | Closed | Terminated
verdict: "Too early to tell"     # Good deal | Overpaid | Too early to tell
consideration: "Stock"           # Cash | Stock | Cash and stock

# ── Valuation ──────────────────────────────────────────────────
equity_value:                    # aggregate deal value, $ billions, e.g. 2.1
p_tbv:                           # price / tangible book value, e.g. 1.65
p_eps_ltm:                       # price / last-twelve-months EPS, e.g. 12.4
p_eps_fwd:                       # price / next-year EPS, e.g. 10.8
core_deposit_premium:            # %, e.g. 7.5
premium:                         # % over the unaffected share price, e.g. 26

# ── Capital and accretion ──────────────────────────────────────
tbv_dilution:                    # % dilution to the buyer's TBV per share at close, e.g. 4.2
tbv_earnback:                    # years to earn back TBV dilution, e.g. 2.8
eps_accretion:                   # % accretion to buyer EPS, e.g. 15  (or text: "15% in 2027")
pro_forma_cet1:                  # CET1 ratio at close, %, e.g. 11.2
synergies:                       # annual cost savings, $ millions, e.g. 120

# ── Advisors (one per line) ────────────────────────────────────
acquirer_advisors:
  - "Bank Name"
target_advisors:
  - "Bank Name"

# ── Sources (one per line; a link at the end becomes clickable) ─
sources:
  - "Merger press release https://"
  - "Investor presentation https://"
  - "Merger proxy: background of the merger and fairness opinions"

# ── Updates: add one each time something happens ───────────────
updates:
  # - date: 2026-03-01
  #   note: "Federal Reserve and OCC approved the merger."

# ── Verdict review: fill in when you revisit the deal ──────────
verdict_today:
reviewed_on:
review_note:
---

## Deal Snapshot

Who is buying whom, the exchange ratio or price per share, the total deal value, and the combined bank's size.

## Valuation

Price / TBV and P/E paid, the core deposit premium, and how they compare with recent bank deals of a similar size.

## Strategic Rationale

Deposits, geography, scale, fee businesses: what the buyer actually gets.

## Capital and Accretion

TBV dilution and the earnback period, EPS accretion, and where CET1 lands after close. Is the earnback reasonable (under about three years is usually seen as acceptable)?

## Cost Savings

The announced cost saves as a percent of the target's expense base, and whether they look achievable.

## Risks

Regulatory approval timeline, credit quality of the target's loan book, deposit runoff, integration.

## Market Reaction

How both stocks moved on announcement day, and what that tells you.

## My Take

Good deal, overpaid, or too early to tell, and why. This is the most important section.

## 30-Second Version

The answer you would give if an interviewer said "walk me through a recent deal."
