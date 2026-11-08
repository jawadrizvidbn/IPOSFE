const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')

// This helper is framework independent. Evaluate its exports without booting Next.js.
const source = fs.readFileSync(path.join(__dirname, '../src/views/store/retailWholesaleTier/reportColumns.js'), 'utf8')
const context = {}

vm.createContext(context)
vm.runInContext(source.replace(/export /g, '') + '\nthis.api = { getGroups, getExportRows };', context)

const { getGroups, getExportRows } = context.api

// Verify exported columns preserve product identifiers, zeroes and complete totals.
test('exports preserve zeroes, product codes, hidden tiers and complete branch totals', () => {
  const report = {
    shops: ['Beacon', 'Bellville'],
    data: [
      {
        stockcode: '001',
        stockdescription: 'Product',
        shops: { Beacon: { retailQty: 0, totalQty: 10 }, Bellville: { totalQty: 2 } },
        totals: { totalQty: 12 }
      }
    ],
    branchTotals: { Beacon: { totalQty: 10 }, Bellville: { totalQty: 2 } },
    totals: { totalQty: 12 }
  }
  const rows = getExportRows(report, ['regularRetail'])

  assert.equal(rows[0]['Stock Code'], '001')
  assert.equal(rows[0]['Beacon Pure Retail Qty'], 0)
  assert.equal(rows[0]['Bellville Pure Retail Value'], 0)
  assert.equal(rows[0]['All Stores Total Qty'], 12)
  assert.equal(rows[1]['Stock Description'], 'Grand Total')
  assert.equal(rows[1]['Beacon Total Qty'], 10)
  assert.equal(
    Object.keys(rows[0]).some(key => key.includes('Tier')),
    false
  )
  assert.equal(getGroups([]).length, 3)
})

// Keep explicit unmatched columns and complete subtotals in product and grand-total exports.
test('exports combos, category tiers, unmatched amounts and both subtotals consistently', () => {
  const metrics = {
    regularRetailQty: 1, regularRetailValue: 10,
    combo3Qty: 3, combo3Value: 30,
    unmatchedRetailQty: 4, unmatchedRetailValue: 40,
    retailQty: 8, retailValue: 80,
    wholesaleTier1Qty: 10, wholesaleTier1Value: 100,
    unmatchedWholesaleQty: 9, unmatchedWholesaleValue: 90,
    wholesaleQty: 19, wholesaleValue: 190,
    totalQty: 27, totalValue: 270
  }
  const report = {
    shops: ['Beacon'],
    data: [{ stockcode: '001', stockdescription: 'Product', shops: { Beacon: metrics }, totals: metrics }],
    branchTotals: { Beacon: metrics }, totals: metrics
  }
  const rows = getExportRows(report, ['regularRetail', 'combo3', 'unmatchedRetail', 'wholesaleTier1', 'unmatchedWholesale'])

  for (const row of rows) {
    assert.equal(row['Beacon Combo 3 Value'], 30)
    assert.equal(row['Beacon Category 10–99 Qty'], 10)
    assert.equal(row['Beacon Validation Retail Value'], 40)
    assert.equal(row['Beacon Validation Wholesale Value'], 90)
    assert.equal(row['Beacon Retail Total Value'] + row['Beacon Wholesale Total Value'], row['Beacon Total Value'])
  }
  const hidden = getExportRows(report, [])

  assert.equal(hidden[0]['Beacon Retail Total Value'], 80)
  assert.equal(hidden[0]['Beacon Wholesale Total Value'], 190)
  assert.equal(hidden[0]['Beacon Total Value'], 270)
  assert.equal(Object.hasOwn(hidden[0], 'Beacon Combo 3 Value'), false)
})

// Export metadata follows the generated result, never a subsequently changed input control.
test('exports the grouping used for the generated report in every row', () => {
  const report = { shops: [], data: [{ stockcode: '001', stockdescription: 'Product', shops: {}, totals: {} }], branchTotals: {}, totals: {} }

  for (const includeSub2 of [false, true]) {
    const rows = getExportRows({ ...report, includeSub2 }, [])

    assert.ok(rows.every(row => row.Grouping === `Sale + Major + Sub1${includeSub2 ? ' + Sub2' : ''}`))
  }
})

// Normal reports contain only business tiers; anomalous money is disclosed separately when present.
test('keeps unmatched business columns out of normal reports', () => {
  const report = { shops: [], data: [{ stockcode: '001', stockdescription: 'Product', shops: {}, totals: {} }], branchTotals: {}, totals: {} }
  const rows = getExportRows(report, ['regularRetail', 'unmatchedRetail', 'unmatchedWholesale'])

  assert.equal(Object.keys(rows[0]).some(key => key.includes('Unmatched') || key.includes('Validation')), false)
})
