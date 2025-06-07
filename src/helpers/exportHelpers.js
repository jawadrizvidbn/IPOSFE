import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import * as XLSX from 'xlsx'

export const copyToClipboard = table => {
  let tsv = ''

  // Get column visibility information
  const columnVisibility = Array.from(table.querySelectorAll('th')).map(th => {
    return !th.classList.contains('hidden')
  })

  // Iterate over table rows
  for (let row of table.rows) {
    const cells = Array.from(row.cells)
      .map((cell, index) => {
        if (columnVisibility[index]) {
          const content = cell.textContent ? cell.textContent.replace(/\t/g, ' ').replace(/\n/g, ' ') : ''
          return `"${content.replace(/"/g, '""')}"`
        }
        return ''
      })
      .filter(cell => cell !== '')
      .join('\t')

    tsv += cells + '\n'
  }

  navigator.clipboard.writeText(tsv).catch(err => {
    console.error('Failed to copy data: ', err)
  })
}

export const exportCSV = table => {
  let csv = ''

  for (let row of table.rows) {
    const cells = Array.from(row.cells)
      .map(cell => `"${cell.textContent.replace(/"/g, '""')}"`)
      .join(',')

    csv += cells + '\n'
  }

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'Price-Change-Report.csv'
  link.click()
}

export const exportExcel = table => {
  const ws = XLSX.utils.table_to_sheet(table)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
  XLSX.writeFile(wb, 'Price-Change-Report.xlsx')
}

export const printDocument = () => {
  const printContent = document.getElementById('main')
  const originalContent = document.body.innerHTML
  document.body.innerHTML = printContent.outerHTML
  window.print()
  document.body.innerHTML = originalContent
}

export const generatePDF = async containerRef => {
  try {
    const container = containerRef.current
    if (!container) {
      throw new Error('Container ref is not set')
    }

    // Hide action buttons temporarily
    const actionButtons = container.querySelector('#ActionsButtons')
    if (actionButtons) {
      actionButtons.style.display = 'none'
    }

    const scale = 2
    const canvas = await html2canvas(container, {
      scale: scale,
      scrollY: -window.scrollY,
      useCORS: true
    })

    // Restore action buttons visibility
    if (actionButtons) {
      actionButtons.style.display = 'flex'
    }

    const imageData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const margin = 10
    const pdfWidth = pdf.internal.pageSize.getWidth() - margin * 2
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width

    pdf.addImage(imageData, 'PNG', margin, margin, pdfWidth, pdfHeight)
    pdf.save('Price-Change-Report.pdf')
  } catch (error) {
    console.error('Error generating PDF:', error)
  }
}
