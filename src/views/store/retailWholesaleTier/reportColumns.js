/** Shared by the table and exports so hidden tiers and numeric zeroes stay consistent. */
export const TIERS = [
  { key: 'retail', label: 'Retail' },
  { key: 'wholesaleTier1', label: 'Wholesale Tier 1' },
  { key: 'wholesaleTier2', label: 'Wholesale Tier 2' },
  { key: 'wholesaleTier3', label: 'Wholesale Tier 3' }
]

export function getGroups(visibleTiers) {
  return [...TIERS.filter(tier => visibleTiers.includes(tier.key)), { key: 'total', label: 'Total' }]
}

export function getExportRows(report, visibleTiers) {
  const groups = getGroups(visibleTiers)

  const flatten = row => {
    const result = { 'Stock Code': row.stockcode ?? '', 'Stock Description': row.stockdescription }

    for (const shop of [...report.shops, null]) {
      const metrics = shop === null ? row.totals : row.shops[shop]
      const label = shop === null ? 'All Stores' : shop

      for (const group of groups) {
        result[`${label} ${group.label} Qty`] = metrics?.[`${group.key}Qty`] ?? 0
        result[`${label} ${group.label} Value`] = metrics?.[`${group.key}Value`] ?? 0
      }
    }

    return result
  }

  return [
    ...report.data.map(flatten),
    flatten({ stockcode: '', stockdescription: 'Grand Total', shops: report.branchTotals, totals: report.totals })
  ]
}
