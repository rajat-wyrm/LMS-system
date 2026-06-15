/**
 * Utility to export JSON data to a CSV file and trigger a browser download.
 *
 * @param {Array<Object>} data - The raw array of objects to export
 * @param {Array<string>} headers - Array of keys/headers to extract (e.g. ['name', 'email'])
 * @param {string} filename - Output filename (e.g. 'students-list.csv')
 */
export const exportToCSV = (data, headers, filename = 'export.csv') => {
  if (!Array.isArray(data) || data.length === 0) {
    alert("No data available to export.");
    return;
  }

  // Define headers row
  const headerKeys = headers || Object.keys(data[0]);
  const headerString = headerKeys.map(key => `"${String(key).replace(/"/g, '""')}"`).join(',');

  // Form row rows strings
  const rowStrings = data.map(row => {
    return headerKeys.map(key => {
      let val = row[key];
      // Format arrays or nested values cleanly
      if (typeof val === 'object' && val !== null) {
        val = JSON.stringify(val);
      }
      const stringValue = val !== undefined && val !== null ? String(val) : '';
      return `"${stringValue.replace(/"/g, '""')}"`;
    }).join(',');
  });

  // Combine into single CSV content
  const csvContent = [headerString, ...rowStrings].join('\n');

  // Create standard blob and trigger browser click-download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
