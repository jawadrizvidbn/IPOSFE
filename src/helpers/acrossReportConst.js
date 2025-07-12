export const REPORT_TYPE_VALUES = {
  quantitySold: 'quantitySold',
  stock: 'stock',
  turnover: 'turnover',
  products: 'products',
  retailWholesale: 'retailWholesale',
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
  { value: 'stockOnHand', label: 'Stock On Hand Report' },
  { value: 'dailySales', label: 'Daily Sales Report' },
  { value: 'invoice', label: 'Invoice Report' },
  { value: 'retailWholesaleByCategory', label: 'Retail / Wholesale By Category Report' }
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
    quantitySold: 'Quantity Sold Report',
    stockOnHand: 'Stock On Hand Report',
    dailySales: 'Daily Sales Report',
    invoice: 'Invoice Report',
    retailWholesaleByCategory: 'Retail / Wholesale By Category Report'
    // sales: 'Sales Report',
    // inventory: 'Inventory Report',
    // price: 'Price Change Report',
    // stock: 'Stock Movement Report'
  }
  return reportTypes[type] || type
}

export const FIXED_COLUMNS = ['stockcode', 'stockdescription', 'totalQty', '']
