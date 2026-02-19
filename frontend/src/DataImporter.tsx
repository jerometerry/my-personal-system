import { useState } from 'react';
import { useImportLogsMutation } from './state/generatedApi';

interface DataImporterProps {
  onSuccess: () => void;
}

export function DataImporter({ onSuccess }: DataImporterProps) {
  const [pastedData, setPastedData] = useState('');
  const [importLogs, { isLoading, isSuccess, isError, data }] = useImportLogsMutation();


  const handleImport = async () => {
  const lines = pastedData.trim().split('\n').filter(line => line);
  if (lines.length < 2) {
    alert('Please paste data with a header row and at least one data row.');
    return;
  }

  const headers = lines.shift()!.split('\t').map(h => h.trim());
  const camelCaseHeaders = {
    'Date': 'entry_date',
    'Time (NDT)': 'entry_time',
    'Activity': 'activity',
    'Time Category': 'time_category',
    'Task Category': 'task_category',
    'Core Value(s) Expressed': 'core_values',
    'Intentionality Rating (1-5)': 'intentionality',
    'Energy (-5 to +5)': 'energy',
  };

  let lastSeenDate = '';
  const parsedLogs = lines.map(line => {
    const values = line.split('\t');
    const logObject: any = {};

    if (values[0] && values[0].trim() !== '') {
      lastSeenDate = new Date(values[0]).toISOString().split('T')[0];
    }
    logObject['entry_date'] = lastSeenDate;

    headers.forEach((header, index) => {
      const key = camelCaseHeaders[header as keyof typeof camelCaseHeaders];
      if (key && key !== 'entry_date') {
        const value = values[index]?.trim() || '';

        // --- THIS LOGIC IS NEW ---
        if (key === 'core_values') {
          logObject[key] = value.split(',').map(v => v.trim()).filter(Boolean);
        } else if (key === 'intentionality' || key === 'energy') {
          // Convert these specific fields to numbers. Default to 0 if invalid.
          logObject[key] = parseInt(value, 10) || 0;
        } else {
          logObject[key] = value;
        }
      }
    });
    return logObject;
  });


  try {
      await importLogs({ logs: parsedLogs }).unwrap();
      onSuccess(); // Call the callback on success
    } catch(err) {
      console.error('Import failed', err)
    }
};

  return (
    <div style={{ marginTop: '2em', border: '1px solid #ccc', padding: '1em' }}>
      <h3>Import Time Log Data</h3>
      <p>Paste your tab-separated data from Google Sheets below.</p>
      <textarea
        value={pastedData}
        onChange={(e) => setPastedData(e.target.value)}
        rows={10}
        placeholder="Date	Time (NDT)	Activity..."
        style={{ width: '100%', fontFamily: 'monospace' }}
      />
      <button onClick={handleImport} disabled={isLoading || !pastedData}>
        {isLoading ? 'Importing...' : 'Import Data'}
      </button>

      {isSuccess && <p style={{ color: 'green' }}>Successfully imported {data?.imported_count} records!</p>}
      {isError && <p style={{ color: 'red' }}>An error occurred during import.</p>}
    </div>
  );
}