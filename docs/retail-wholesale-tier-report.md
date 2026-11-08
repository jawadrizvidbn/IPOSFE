# Retail / Wholesale category and combo report UI

## Scope and release status

The dedicated RetailWholesaleTierReport route and selector entry remain separate
from the original Retail/Wholesale report. Existing reports and Redux state are
unchanged. This revision requires the matching backend revision; do not deploy
until the actual reference Combo 3 sale's Sub2 grouping has been validated.

## Display and exports

Each stockcode/product row has each selected store and an All Stores column group.
Every classification and total has a Qty/Value pair. The ordered groups are:

1. Pure Retail, Combo 3, Combo 6, Combo 9, Retail Total.
2. Category 10–99, Category 100–999, Category 1000+, Wholesale Total.
3. Total.

Unexpected source records preserve existing Retail/Wholesale classification in
internal validation counters. Their amounts are not lost or counted again as pure
retail. They appear in validation warnings, not normal business tier columns. Wholesale Total includes separately disclosed validation Wholesale amounts; when that is zero it equals just the category tiers.
Retail Total includes its five leaf components. Overall Total equals Retail Total
plus Wholesale Total, never a sum of all displayed columns (which include subtotals).

Filters toggle leaf column visibility only. Retail Total, Wholesale Total and
Total remain visible and include all data, even hidden leaf columns. Table and
CSV/Excel share `reportColumns.js` so labels, order and totals match. If unexpected
records exist, exports add Validation Retail/Wholesale Qty/Value columns separately. Exports
include selected visible leaf groups, all subtotals, all products and Grand Total.
Stock-code strings and numeric zeroes are preserved.

## Business logic

The **Include Sub2 in grouping** checkbox applies to both ComboGroup and Category.
Unchecked (default) uses Sale + Major + Sub1. Checked adds Sub2. Dates and this
choice are sent together when generating the report. Changing the checkbox does
not relabel old results: an information message asks the user to regenerate.
The result header, CSV/Excel Grouping column and export filename record the
backend's returned includeSub2 value.

Exact ComboGroup groups qualify at quantities 3, 6 and 9.
Exact Category groups qualify at thresholds 10, 100 and 1000. Cardnum is not a
quantity source or an eligibility requirement. Each original product line keeps
its own quantity and linetotal allocation, once only. Totals are calculated on the
backend; this frontend never infers tiers from product totals.

The backend's documented fallback, null handling and release gate are in
`docs/retail-wholesale-tier-report.md` and `docs/category-combo-validation.md` in
IPOSBE. The clearer screenshot identifies the reference sales and differing Sub2 values.
Regression fixtures transcribe those quantities/keys, but use synthetic money because
linetotal is not visible. Live SQL and monetary reconciliation remain pending.

## Existing integration and lifecycle

`MultipleStores.jsx` routes the new selection to this dedicated page; other
selections still use Across_dump_data. `retailWholesaleTierService.js` reuses
existing Axios authentication. Date inputs, cancellation, request/error states,
missing-data warnings, sorting, fixed product columns and export filenames retain
their existing implementation. No environment or connection settings changed.

## Tests

Run `node --test tests/retailWholesaleTier.test.cjs tests/deviceId.test.cjs`.
Export tests cover zeroes, leading-zero stock codes, hidden leaf groups, combos,
category tiers, unmatched columns, both subtotals and the final grand-total row.
Device-ID tests remain regression checks for HTTP deployments.
