interface LogListProps {
  logs: any[] | undefined;
  isLoading: boolean;
  error: any;
}

export function LogList({ logs, isLoading, error }: LogListProps) {
  if (isLoading) return <p>Loading logs...</p>;
  if (error) return <p>Error fetching logs.</p>;

  return (
    <div style={{ marginTop: '2em' }}>
      <h3>All Log Entries</h3>
      <ul>
        {logs?.map((log) => (
          <li key={log._id} style={{ borderBottom: '1px solid #ccc', padding: '8px 0' }}>
            <strong>Mood: {log.mood}/5</strong> - {log.content}
          </li>
        ))}
      </ul>
    </div>
  );
}