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
  const rows = getExportRows(report, ['retail'])

  assert.equal(rows[0]['Stock Code'], '001')
  assert.equal(rows[0]['Beacon Retail Qty'], 0)
  assert.equal(rows[0]['Bellville Retail Value'], 0)
  assert.equal(rows[0]['All Stores Total Qty'], 12)
  assert.equal(rows[1]['Stock Description'], 'Grand Total')
  assert.equal(rows[1]['Beacon Total Qty'], 10)
  assert.equal(
    Object.keys(rows[0]).some(key => key.includes('Tier')),
    false
  )
  assert.equal(getGroups([]).length, 1)
})
