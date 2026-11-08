/** Shared by the table and exports so hidden tiers and numeric zeroes stay consistent. */
// Leaf groups are mutually exclusive; subtotals remain visible when leaf columns are hidden.
export const TIERS = [
  { key: 'regularRetail', label: 'Pure Retail' },
  { key: 'combo3', label: 'Combo 3' },
  { key: 'combo6', label: 'Combo 6' },
  { key: 'combo9', label: 'Combo 9' },
  { key: 'wholesaleTier1', label: 'Category 10–99' },
  { key: 'wholesaleTier2', label: 'Category 100–999' },
  { key: 'wholesaleTier3', label: 'Category 1000+' }
]

// Keep each Retail/Wholesale subtotal next to its component columns, followed by the overall total.
export function getGroups(visibleTiers) {
  const selected = TIERS.filter(tier => visibleTiers.includes(tier.key))

  return [
    ...selected.filter(tier => ['regularRetail', 'combo3', 'combo6', 'combo9', 'unmatchedRetail'].includes(tier.key)),
    { key: 'retail', label: 'Retail Total' },
    ...selected.filter(tier => ['wholesaleTier1', 'wholesaleTier2', 'wholesaleTier3', 'unmatchedWholesale'].includes(tier.key)),
    { key: 'wholesale', label: 'Wholesale Total' },
    { key: 'total', label: 'Total' }
  ]
}

// Detect anomalous amounts or line counts even if signed refunds cancel the overall monetary sum.
export function hasValidationAmounts(report) {
  return report.validationLineCount > 0 || report.data.some(row =>
    [row.totals, ...Object.values(row.shops)].some(metrics =>
      ['unmatchedRetailQty', 'unmatchedRetailValue', 'unmatchedWholesaleQty', 'unmatchedWholesaleValue'].some(key => metrics?.[key])
    )
  )
}

// Flatten the displayed branch metrics into CSV/Excel columns and a totals row.
export function getExportRows(report, visibleTiers) {
  const groups = getGroups(visibleTiers)
  const includeValidation = hasValidationAmounts(report)

  // Use one column mapping for product rows and the final grand-total row.
  const flatten = row => {
    const result = {
      'Stock Code': row.stockcode ?? '',
      'Stock Description': row.stockdescription,
      Grouping: `Sale + Major + Sub1${report.includeSub2 ? ' + Sub2' : ''}`
    }

    // Export each selected branch followed by the combined All Stores metrics.
    for (const shop of [...report.shops, null]) {
      const metrics = shop === null ? row.totals : row.shops[shop]
      const label = shop === null ? 'All Stores' : shop

      // Export anomaly amounts separately from standard sales columns so every subtotal can reconcile.
      if (includeValidation) {
        for (const [key, name] of [['unmatchedRetail', 'Retail'], ['unmatchedWholesale', 'Wholesale']]) {
          result[`${label} Validation ${name} Qty`] = metrics?.[`${key}Qty`] ?? 0
          result[`${label} Validation ${name} Value`] = metrics?.[`${key}Value`] ?? 0
        }
      }

      // Preserve zeroes and emit quantity/value pairs only for visible groups.
      for (const group of groups) {
        result[`${label} ${group.label} Qty`] = metrics?.[`${group.key}Qty`] ?? 0
        result[`${label} ${group.label} Value`] = metrics?.[`${group.key}Value`] ?? 0
      }
    }

    return result
  }

  // Append the backend totals without recalculating or filtering their values.
  return [
    ...report.data.map(flatten),
    flatten({ stockcode: '', stockdescription: 'Grand Total', shops: report.branchTotals, totals: report.totals })
  ]
}
