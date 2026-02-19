import { LogForm } from './LogForm';
import { LogList } from './LogList';
import { DataImporter } from './DataImporter';
import { TimeLogList } from './TimeLogList';
import { useListLogsQuery, useListTimelogsQuery } from './state/generatedApi';

function App() {
  const { data: logs, error: logsError, isLoading: logsLoading, refetch: refetchLogs } = useListLogsQuery();
  const { data: timeLogs, error: timeLogsError, isLoading: timeLogsLoading, refetch: refetchTimeLogs } = useListTimelogsQuery();

  // 2. Define a single callback function to refetch all data
  const handleSuccess = () => {
    console.log('Mutation successful, refetching lists...');
    refetchLogs();
    refetchTimeLogs();
  };

  return (
    <div>
      <h1>Welcome to your Personal System!</h1>
      <LogForm onSuccess={handleSuccess} />
      <LogList logs={logs} isLoading={logsLoading} error={logsError} />

      <DataImporter onSuccess={handleSuccess} />
      <TimeLogList timeLogs={timeLogs} isLoading={timeLogsLoading} error={timeLogsError} />      
    </div>
  );
}

export default App;