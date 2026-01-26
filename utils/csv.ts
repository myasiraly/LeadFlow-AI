
import { Lead } from '../types';

export function downloadLeadsCSV(leads: Lead[], filename: string = 'leads_export.csv') {
  if (!leads || leads.length === 0) return;

  const headers = Object.keys(leads[0]).filter(k => k !== 'id');
  const csvRows = [
    headers.join(','),
    ...leads.map(lead => 
      headers.map(header => {
        const val = (lead as any)[header] || '';
        const escaped = String(val).replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(',')
    )
  ];

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
