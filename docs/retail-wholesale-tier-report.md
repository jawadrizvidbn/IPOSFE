# Retail / Wholesale Tier Report frontend

## Navigation and isolation

Across Store's report selector adds `Retail / Wholesale Tier Report` immediately
after the existing Retail / Wholesale option. Only this new option navigates to
`/[lang]/RetailWholesaleTierReport?shopKeys=...`. Existing report options still
use `Across_dump_data`. The old report page, Redux slice, table helpers, and
backend calculation are unchanged.

## New modules

- `src/app/[lang]/(dashboard)/RetailWholesaleTierReport/page.jsx`: dedicated route.
- `src/services/retailWholesaleTierService.js`: API wrapper using the existing
  Axios instance and NextAuth Bearer-token handling.
- `src/views/store/retailWholesaleTier/TierReport.jsx`: dates, request lifecycle,
  loading/errors/warnings, report state, exports, and page composition.
- `TierFilters.jsx`: four independently selectable classification columns.
- `TierReportTable.jsx`: grouped store/classification/Qty–Value headers,
  horizontally scrollable table, sticky product columns, code/description sorting,
  and grand totals. All Stores follows the selected branch groups.
- `reportColumns.js`: shared group definitions and export flattening.

Only `acrossReportConst.js` and `MultipleStores.jsx` integrate the new report with
existing selection/navigation. No additional Redux state is needed because the
new page owns its report lifecycle.

## Display and export semantics

Both dates are required. The end date is inclusive. Generation clears previous
results; changing date inputs alone does not change the already-generated
report. Its actual period remains visible and is used in exported filenames.
Pending requests are cancelled on unmount/store changes and stale responses
are ignored. Missing database/month warnings are shown above any available data.

The backend classifies by marked sale/category group quantity; the frontend
never recalculates tiers. A marked line has both CehqueNum and Cardnum populated.
Quantities come from qty and values from linetotal, with signed refunds preserved.
See `IPOSBE/docs/retail-wholesale-tier-report.md` for the full calculation.

Tier checkboxes hide/show columns only. Total columns always include every tier,
including hidden ones. Hiding all tiers leaves totals visible. Quantities display
up to four decimal places; values display two. Raw numeric results are preserved
in exports. CSV/Excel include every product, selected visible classifications,
per-store totals, All Stores totals, and a final Grand Total row. Numeric zeroes
and stock codes with leading zeroes are preserved in Excel cell types.

The mockup is a layout reference. The implemented table also includes an explicit
All Stores group. No existing summary/detailed toggle is reused: this new report
always uses actual quantities and line values.

## Verification

Run `node --test tests/retailWholesaleTier.test.cjs` from IPOSFE to check export
column visibility, zeroes, stock codes and totals.

Lint the new modules and integration files with `next lint`. Build using the
repository's normal `npm run build`. The backend fixtures exercise thresholds,
null groups, marker conditions, dates, refunds, reconciliation, and branch totals.

Before release, verify at desktop and narrow viewport sizes: scroll/sticky
columns, sorting, hiding tiers, exporting multiple branches, warnings, empty
results, and errors. Smoke-test the old Retail / Wholesale report and another
Across Store report. Live MySQL data verification remains a deployment check.
