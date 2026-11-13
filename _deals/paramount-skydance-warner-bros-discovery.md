---
published: true

acquirer: "Paramount Skydance"
target: "Warner Bros. Discovery"
headline: "Seven Bids and $87 Billion of Debt: How Paramount Won Warner Bros."
subtitle: "Paramount Skydance raised its offer from $19 to $31 a share and pried Warner Bros. Discovery away from Netflix. Warner shareholders got a 147% premium. Skydance shareholders got the bill."
kicker: "Media & Entertainment"
short: "Paramount / Warner Bros."
featured: true
image: "/assets/img/deals/paramount-wbd-card.png"

announced: 2026-02-27
written: 2026-11-13

sector: "Media & Entertainment"
deal_type: "Strategic M&A"
status: "Completed 6 Oct 2026"
verdict: "Too early to tell"
consideration: "All cash, $31.00 a share"

enterprise_value: 110
equity_value: 81
ev_ebitda: "7.5x 2026E, with full synergies"
premium: 147
synergies: 6000
pro_forma_leverage: "7.8x (Fitch, FY2026)"

acquirer_advisors:
  - "Centerview Partners"
  - "RedBird Advisors"
  - "BofA Securities"
  - "Citi"
  - "M. Klein & Company"
  - "LionTree"
target_advisors:
  - "Allen & Company"
  - "J.P. Morgan"
  - "Evercore"
other_advisors:
  - "Moelis & Company, for Netflix"
  - "Barclays, for Paramount's special committee"

teaser:
  title: "Paramount's seven offers for Warner Bros. Discovery"
  subtitle: "$ per Warner share"
  max: 34
  values:
    - { label: "Sep", value: 19, display: "$19" }
    - { label: "Sep", value: 22, display: "$22" }
    - { label: "Oct", value: 23.5, display: "$23.50" }
    - { label: "Nov", value: 25.5, display: "$25.50" }
    - { label: "Dec", value: 26.5, display: "$26.50" }
    - { label: "Dec", value: 30, display: "$30" }
    - { label: "Feb", value: 31, display: "$31", highlight: true }

glance:
  - { value: "$110B", label: "Enterprise value, including debt ($81B equity)" }
  - { value: "$31.00", label: "Per Warner share, all in cash" }
  - { value: "147%", label: "Premium to Warner's $12.54 undisturbed price" }
  - { value: "7", label: "Offers Paramount made in five months" }
  - { value: "$87B", label: "Gross debt the combined company started with" }

key_points:
  - "Paramount Skydance raised its offer six times, from $19 to $31 a share in cash, and took Warner Bros. Discovery away from a signed deal with Netflix."
  - "The $110 billion price is 7.5 times Warner's 2026 EBITDA, but only if all $6 billion of promised cost savings arrive."
  - "The combined company, now called Skydance, started with $87 billion of gross debt. Fitch puts leverage at 7.8 times."
  - "Warner holders won. For Skydance holders it's a bet on cost cuts and debt paydown, and the stock is down to about $8."

hero_graphic:
  type: timeline
  title: "How $19 became $31"
  subtitle: "Offers for Warner Bros. Discovery, $ per Warner share. Hover or tap a point for the details."
  prefix: "$"
  decimals: 2
  x_start: "2025-09-01"
  x_end: "2026-03-14"
  y_min: 10
  y_max: 32
  y_ticks: [10, 15, 20, 25, 30]
  toggle_premium: true
  premium_min: 0
  premium_max: 160
  premium_ticks: [0, 50, 100, 150]
  reference:
    value: 12.54
    label: "Warner's undisturbed price, 10 Sep 2025"
  note: "Paramount's bids are for the whole company. Netflix's was for the studios and HBO Max only; Warner holders would also have kept shares in the cable spin-off, so its premium is not like for like. The third offer is dated 13 Oct; some reports put it at 19 Oct. Sources: Variety, CNBC, Reuters, Paramount and Netflix announcements."
  series:
    - name: "Paramount Skydance, whole company"
      short: "Paramount"
      color: blue
      step: true
      extend: true
      end_label: "Paramount $31"
      end_sub: "wins, 27 Feb"
      end_dy: -4
      points:
        - { date: "2025-09-14", value: 19, show_value: true, key: true, when: "Mid-Sep 2025", note: "First offer, in cash and stock. Rejected." }
        - { date: "2025-09-30", value: 22, show_value: true, note: "Second offer. Rejected." }
        - { date: "2025-10-13", value: 23.5, show_value: true, when: "Mid-Oct 2025", note: "Third offer, 80% cash. Rejected. Warner then puts itself up for sale." }
        - { date: "2025-11-20", value: 25.5, show_value: true, note: "First-round auction bid, non-binding." }
        - { date: "2025-12-01", value: 26.5, show_value: true, note: "Second-round bid, all cash." }
        - { date: "2025-12-04", value: 30, show_value: true, key: true, note: "Final-round bid, all cash. Warner signs with Netflix the next day." }
        - { date: "2025-12-08", value: 30, quiet: true, note: "Goes hostile: a $30 cash tender offer straight to Warner shareholders." }
        - { date: "2026-02-10", value: 30, quiet: true, note: "Adds a 25-cent-a-share ticking fee for every quarter the deal runs past 2026." }
        - { date: "2026-02-24", value: 31, show_value: true, key: true, note: "Raises to $31. Netflix declines to match two days later." }
    - name: "Netflix, studios and HBO Max only"
      short: "Netflix"
      color: red
      end_label: "Netflix $27.75"
      end_sub: "walks, 26 Feb"
      end_dy: 6
      points:
        - { date: "2025-12-05", value: 27.75, note: "Signed deal: $23.25 in cash plus $4.50 in Netflix stock. Warner holders keep shares in the cable spin-off, Discovery Global." }
        - { date: "2026-01-20", value: 27.75, quiet: true, note: "Switches to all cash at the same $27.75." }
        - { date: "2026-02-26", value: 27.75, hollow: true, note: "Declines to match $31. Paramount pays the $2.8 billion break fee Warner owed Netflix." }

graphics:
  stub:
    type: stub
    title: "Was $31 really the better offer?"
    subtitle: "Netflix's $27.75 came with shares in the cable spin-off. Drag the slider to put a value on them."
    max: 36
    base: { name: "Netflix", label: "Netflix", sub: "$27.75 cash + spin-off", value: 27.75, color: red, legend: "Netflix cash" }
    stub:
      label: "Value of the Discovery Global shares, per Warner share"
      legend: "Discovery Global shares"
      color: lightred
      min: 0
      max: 7
      step: 0.01
      default: 1.33
      band: { from: 1.33, to: 6.86, label: "Warner advisers' range" }
      marks:
        - { value: 1, label: "Paramount's view: $1", above: true }
        - { value: 4.1, label: "Warner advisers' range", above: true }
    rival: { name: "Paramount", label: "Paramount", sub: "all cash", value: 31, color: blue, legend: "Paramount cash" }
    readout: "The hatched stretch of the slider is the range Warner's own advisers came up with."
    note: "Ignores timing, taxes and risk. Netflix's offer was $23.25 in cash plus $4.50 in Netflix stock until January, when it switched to all cash. Sources: Netflix and Warner announcement, 5 Dec 2025; Reuters, 20 Jan 2026; Variety, 8 Dec 2025."

  leverage:
    type: leverage
    title: "Can Skydance get to 3.0x?"
    subtitle: "Move the sliders to see what it takes to hit the company's leverage target."
    net_debt: 77
    target: 3.0
    max: 8
    ebitda: { label: "EBITDA before savings", min: 9, max: 14, step: 0.1, default: 11.2 }
    synergies: { label: "Annual cost savings achieved", min: 0, max: 6, step: 0.25, default: 6 }
    paydown: { label: "Debt repaid", min: 0, max: 40, step: 0.5, default: 0 }
    markers:
      - { value: 3.0, label: "3.0x target" }
      - { value: 7.8, label: "Fitch 7.8x", dashed: true }
    gap_text: "Skydance expects free cash flow around break-even in 2027, rising past $10 billion a year by 2030."
    met_text: "That's the level Skydance says it will reach by the end of 2029."
    note: "My simplified estimate, not a forecast. Starting net debt of $77B is the $87B of gross debt less about $10B of cash at closing (Skydance Q3 2026 letter). The $11.2B EBITDA default is what Fitch's 7.8x on $87.5B of debt implies; Fitch measures leverage its own way, so treat it as a rough base."

  analysts:
    type: dotplot
    title: "Wall Street's targets sit far below the price set for the new equity"
    subtitle: "Analysts' 12-month price targets for Skydance Class B shares (SKYD), $"
    prefix: "$"
    decimals: 2
    trim_zeros: true
    min: 0
    max: 18
    tick: 2
    legend:
      - { label: "Price target", color: blue, kind: dot }
    markers:
      - { value: 8.04, label: "Close, 10 Nov", color: ink, note: "Skydance closed at $8.04 on 10 Nov 2026, after falling more than 8% on its first results since the merger." }
      - { value: 16.02, label: "New equity priced at", dashed: true, color: soft, anchor: "end", note: "The price set in February for the $47 billion of new Class B shares that funded the deal." }
    rows:
      - { label: "Bernstein", sub: "Underperform", value: 6, note: "Laurent Yoon, Underperform." }
      - { label: "MoffettNathanson", sub: "Neutral", value: 7, note: "Robert Fishman, Neutral." }
      - { label: "TD Cowen", sub: "Hold", value: 8, note: "Doug Creutz, Hold." }
      - { label: "BofA", sub: "Underperform", value: 9, note: "Jessica Reif Ehrlich, Underperform." }
    note: "Targets as reported by TheWrap on 10 Nov 2026. Guggenheim rates the stock Neutral with no target. Sources: TheWrap; Chartmill (closing price); Paramount merger announcement, 27 Feb 2026."

charts:
  funding:
    title: "Who paid"
    subtitle: "New money raised for the deal, $ billions"
    max: 66
    note: "Equity came from the Ellison family, RedBird Capital and partners including Gulf sovereign wealth funds. Source: Skydance Q3 2026 shareholder letter."
    bars:
      - { label: "New equity", value: 47, display: "$47B" }
      - { label: "New secured debt", value: 57, display: "$57B", highlight: true }
  debt:
    title: "What it left behind"
    subtitle: "Gross debt, $ billions"
    max: 100
    note: "Cash after closing was about $10B. Source: Skydance Q3 2026 shareholder letter."
    bars:
      - { label: "Paramount, 30 Sep 2026", value: 15, display: "$15.0B" }
      - { label: "Skydance, after closing", value: 87, display: "$87B", highlight: true }
  path:
    title: "The deleveraging promise"
    subtitle: "Debt as a multiple of EBITDA"
    max: 9
    marker: 3
    marker_label: "3.0x target"
    note: "The 7.8x is Fitch's estimate after closing; the 2028 and 2029 figures are the company's net leverage targets. Sources: The Desk, citing Fitch; Skydance Q3 2026 letter."
    bars:
      - { label: "FY2026, Fitch estimate", value: 7.8, display: "7.8x", highlight: true }
      - { label: "FY2028 target", value: 3.75, display: "below 3.75x" }
      - { label: "End-2029 target", value: 3, display: "3.0x" }
  fees:
    title: "What Warner's bankers stood to earn"
    subtitle: "Advisory fees disclosed by Warner Bros. Discovery, $ millions"
    max: 100
    note: "Most of each fee was payable only if a sale closed: $45M of Allen's, $50M of J.P. Morgan's and all of Evercore's. Source: Business Insider, citing Warner's SEC filing."
    bars:
      - { label: "Allen & Company", value: 85, display: "$85M" }
      - { label: "J.P. Morgan", value: 85, display: "$85M" }
      - { label: "Evercore", value: 55, display: "$55M", highlight: true }

sources:
  - "Paramount and Warner Bros. Discovery merger announcement, 27 Feb 2026: $31 a share, $81B equity value, $110B enterprise value, 7.5x synergized 2026 EBITDA, financing https://s201.q4cdn.com/336605034/files/doc_news/2026/Feb/27/Exhibit-99-1.pdf"
  - "Skydance press release on completing the acquisition, 6 Oct 2026 https://www.sec.gov/Archives/edgar/data/0002041610/000110465926113913/tm2626659d7_ex99-1.htm"
  - "Skydance Q3 2026 shareholder letter: funding, debt, cash, synergy phasing, leverage target, outlook https://www.sec.gov/Archives/edgar/data/0002041610/000204161026000062/ex99_q326.htm"
  - "Paramount Skydance Q1 2026 shareholder letter: $2.8B Netflix termination fee https://www.sec.gov/Archives/edgar/data/0002041610/000204161026000022/ex99_q126.htm"
  - "Variety, 8 Dec 2025: Paramount's earlier bids and its view of Discovery Global https://variety.com/2025/tv/news/paramount-hostile-takeover-bid-warner-bros-discovery-1236603175/"
  - "Wikipedia, Proposed acquisition of Warner Bros. Discovery: first-round auction bid as reported by The Wall Street Journal https://en.wikipedia.org/wiki/Proposed_acquisition_of_Warner_Bros._Discovery"
  - "TV Technology, 8 Dec 2025: tender offer, $12.54 undisturbed price, 139% premium https://www.tvtechnology.com/news/paramount-launches-hostile-bid-for-warner-bros-discovery"
  - "Reuters via The Philadelphia Inquirer, 5 Dec 2025: Netflix deal terms https://www.inquirer.com/business/technology/netflix-buys-warner-bros-discovery-streaming-20251205.html"
  - "Reuters via BusinessDay, 20 Jan 2026: Netflix switches to all cash; Warner advisers' Discovery Global valuation https://www.businessday.co.za/world/international-companies/2026-01-20-netflix-wins-board-support-for-amended-offer-for-warner-bros/"
  - "CNBC, 6 Oct 2026: deal timeline https://www.cnbc.com/2026/10/06/paramount-wbd-deal-timeline.html"
  - "Britannica: shareholder approval and closing https://www.britannica.com/money/netflix-paramount-skydance-battle-for-warner-bros"
  - "Variety, Mar 2026: Gulf sovereign wealth funds in the equity https://au.variety.com/2026/film/news/paramount-skydance-middle-eastern-wealth-funds-strategic-commercial-opportunities-35013/"
  - "The Desk, Oct 2026: Fitch downgrade and leverage estimate https://thedesk.net/2026/10/paramount-closes-warner-bros-acquisition-skydance/"
  - "TheWrap, 10 Nov 2026: share price reaction and analyst targets https://thewrap.com/industry-news/business/skydance-stock-reaction-earnings-q3-2026"
  - "Chartmill: Skydance closing price https://www.chartmill.com/stock/quote/SKYD/earnings"
  - "Canadian Lawyer deal summary: financial and legal advisers https://www.canadianlawyermag.com/cl-plus/deals/3907"
  - "Business Insider via AOL: Warner's advisory fees; Moelis for Netflix https://www.aol.com/articles/much-bankers-getting-paid-netflix-154953394.html"
---

It took Paramount Skydance seven offers and five months to buy Warner Bros. Discovery. The last one, $31 a share in cash, beat a signed deal with Netflix and valued Warner at $110 billion including debt. The deal closed on Oct. 6, and the combined company now trades as Skydance.

Warner shareholders did very well: $31 is 147% above where the stock closed on Sept. 10, 2025, before reports of a bid. The question now is whether Skydance can carry what it took to win.

## How $19 became $31

Paramount opened in mid-September with $19 a share in cash and stock. Warner turned down three offers, then put itself up for sale. Netflix bid only for the studios and HBO Max, and on Dec. 5 Warner agreed to its $27.75 offer.

Paramount went hostile three days later with $30 in cash for the whole company. In February it added a ticking fee, then raised to $31. Netflix declined to match.

## Was it really the better offer?

Not obviously. Netflix's price came with something extra: Warner holders would keep shares in Discovery Global, the cable spin-off with CNN, TNT and Discovery. Paramount said those shares were worth about $1. Warner's own advisers put them at $1.33 to $6.86.

{% include graphic.html g=page.graphics.stub %}

The break-even is $3.25. Below that, Paramount's cash wins, and the board decided in February that it did. All cash also took away the risk that the spin-off would trade badly.

## Who paid for it

Paramount raised $47 billion of new equity, backed by the Ellison family and RedBird Capital, and $57 billion of new secured debt. Sovereign wealth funds from Saudi Arabia, Qatar and Abu Dhabi put in close to $24 billion of the equity. Paramount also covered the $2.8 billion break fee Warner owed Netflix.

<div class="two-up">
{% include bar-chart.html chart=page.charts.funding %}
{% include bar-chart.html chart=page.charts.debt %}
</div>

## The $6 billion question

Paramount priced the deal at 7.5 times Warner's 2026 EBITDA, after counting $6 billion of yearly cost savings it hasn't made yet. Skydance expects 30% of them in the first year and 70% by the end of the second, at a one-time cost of about $4 billion.

{% include bar-chart.html chart=page.charts.path %}

Fitch downgraded both companies when the deal closed. Skydance says it can reach 3.0 times by the end of 2029 without selling assets or raising more equity. On my rough numbers, even with every dollar of savings it would still have to repay about $25 billion of debt.

{% include graphic.html g=page.graphics.leverage %}

## What the market thinks

Not much, so far. Skydance shares fell more than 8% after its first results as a combined company and closed at $8.04 on Nov. 10. When the deal was signed in February, the new shares that would fund it were priced at $16.02. None of the analyst targets below comes close.

{% include graphic.html g=page.graphics.analysts %}

## The bankers

Centerview Partners and RedBird Advisors led for Paramount, with BofA, Citi, M. Klein and LionTree. Warner used Allen & Co., J.P. Morgan and Evercore. Moelis advised Netflix.

{% include bar-chart.html chart=page.charts.fees %}

## My take

For Warner shareholders this was a great result: a 147% premium in cash, after an auction that pushed the price up six times.

For Skydance, it's too early to tell, and I lean negative on the price. The assets are excellent. But 7.5 times only holds if all $6 billion of savings show up, and the company is cutting costs with leverage near 8 times in a business that depends on creative talent.

What I'm watching:

- **2027 guidance**, due with fourth-quarter results
- **Savings:** about $1.8 billion should show up in year one if the 30% target holds
- **The Paramount+ and HBO Max bundle**, due in early 2027
- **Debt paydown**, and whether Fitch's view improves
