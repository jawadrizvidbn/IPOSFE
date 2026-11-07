export const REPORT_TYPE_VALUES = {
  quantitySold: 'quantitySold',
  stock: 'stock',
  turnover: 'turnover',
  products: 'products',
  retailWholesale: 'retailWholesale',

  // Identify the new tier report independently of the original retail/wholesale report.
  retailWholesaleTier: 'retailWholesaleTier',
  stockOnHand: 'stockOnHand',
  dailySales: 'dailySales',
  invoice: 'invoice',
  retailWholesaleByCategory: 'retailWholesaleByCategory'
}

export const REPORT_TYPES = [
  { value: 'quantitySold', label: 'Quantity Sold Report' },
  { value: 'turnover', label: 'Turnover Report' },
  { value: 'products', label: 'Products Report' },
  { value: 'retailWholesale', label: 'Retail / Wholesale Report' },

  // Place the new tier report directly below the original option.
  { value: 'retailWholesaleTier', label: 'Retail / Wholesale Tier Report' },
  { value: 'stockOnHand', label: 'Stock On Hand Report' },
  { value: 'dailySales', label: 'Daily Sales Report' },
  { value: 'invoice', label: 'Invoice Report' },
  { value: 'retailWholesaleByCategory', label: 'Category Sales Report' }

  // { value: 'stock', label: 'Stock Report' },
  // { value: 'inventory', label: 'Inventory Report' },
  // { value: 'price', label: 'Price Change Report' },
  // { value: 'stock', label: 'Stock Movement Report' }
]

export const getReportTypeLabel = type => {
  const reportTypes = {
    stock: 'Stock Report',
    turnover: 'Turnover Report',
    products: 'Products Report',
    retailWholesale: 'Retail / Wholesale Report',

    // Resolve the display label for the new report without changing existing labels.
    retailWholesaleTier: 'Retail / Wholesale Tier Report',
    quantitySold: 'Quantity Sold Report',
    stockOnHand: 'Stock On Hand Report',
    dailySales: 'Daily Sales Report',
    invoice: 'Invoice Report',
    retailWholesaleByCategory: 'Category Sales Report'

    // sales: 'Sales Report',
    // inventory: 'Inventory Report',
    // price: 'Price Change Report',
    // stock: 'Stock Movement Report'
  }

  return reportTypes[type] || type
}

export const FIXED_COLUMNS = ['stockcode', 'stockdescription', 'totalQty', '']
