/** Shared by the table and exports so hidden tiers and numeric zeroes stay consistent. */
export const TIERS = [
  { key: 'retail', label: 'Retail' },
  { key: 'wholesaleTier1', label: 'Wholesale Tier 1' },
  { key: 'wholesaleTier2', label: 'Wholesale Tier 2' },
  { key: 'wholesaleTier3', label: 'Wholesale Tier 3' }
]

// Keep selected classification groups visible and always include the total group.
export function getGroups(visibleTiers) {
  return [...TIERS.filter(tier => visibleTiers.includes(tier.key)), { key: 'total', label: 'Total' }]
}

// Flatten the displayed branch metrics into CSV/Excel columns and a totals row.
export function getExportRows(report, visibleTiers) {
  const groups = getGroups(visibleTiers)

  // Use one column mapping for product rows and the final grand-total row.
  const flatten = row => {
    const result = { 'Stock Code': row.stockcode ?? '', 'Stock Description': row.stockdescription }

    // Export each selected branch followed by the combined All Stores metrics.
    for (const shop of [...report.shops, null]) {
      const metrics = shop === null ? row.totals : row.shops[shop]
      const label = shop === null ? 'All Stores' : shop

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
