/**
 * Converte um array de objetos em CSV e dispara o download no navegador.
 * @param {Array} data - Array de objetos a exportar
 * @param {string} filename - Nome do arquivo CSV
 */
export const exportToCsv = (data, filename = 'export.csv') => {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Header
  csvRows.push(headers.join(';'));

  // Rows
  for (const row of data) {
    const values = headers.map(h => {
      const val = row[h] ?? '';
      // Escape strings with semicolons or quotes
      const escaped = String(val).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(';'));
  }

  const csvString = '\uFEFF' + csvRows.join('\n'); // BOM for Excel UTF-8
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
