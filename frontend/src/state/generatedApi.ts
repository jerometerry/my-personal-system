import { api } from "./api";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listLogs: build.query<ListLogsApiResponse, ListLogsApiArg>({
      query: () => ({ url: `/api/log` }),
    }),
    createLog: build.mutation<CreateLogApiResponse, CreateLogApiArg>({
      query: (queryArg) => ({
        url: `/api/log`,
        method: "POST",
        body: queryArg.logEntry,
      }),
    }),
    importLogs: build.mutation<ImportLogsApiResponse, ImportLogsApiArg>({
      query: (queryArg) => ({
        url: `/api/log/import`,
        method: "POST",
        body: queryArg.logs,
      }),
    }),
    listTimelogs: build.query<ListTimelogsApiResponse, ListTimelogsApiArg>({
      query: () => ({ url: `/api/timelogs` }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type ListLogsApiResponse =
  /** status 200 Successful Response */ LogEntryInDb[];
export type ListLogsApiArg = void;
export type CreateLogApiResponse =
  /** status 201 Successful Response */ LogEntryInDb;
export type CreateLogApiArg = {
  logEntry: LogEntry;
};
export type ImportLogsApiResponse = /** status 200 Successful Response */ any;
export type ImportLogsApiArg = {
  logs: TimeLogEntry[];
};
export type ListTimelogsApiResponse =
  /** status 200 Successful Response */ TimeLogEntryInDb[];
export type ListTimelogsApiArg = void;
export type LogEntryInDb = {
  content: string;
  mood: number;
  _id: string | null;
};
export type ValidationError = {
  loc: (string | number)[];
  msg: string;
  type: string;
};
export type HttpValidationError = {
  detail?: ValidationError[];
};
export type LogEntry = {
  content: string;
  mood: number;
};
export type TimeLogEntry = {
  entry_date: string;
  entry_time: string;
  activity: string;
  time_category: string;
  task_category: string;
  core_values?: string[];
  intentionality: number;
  energy: number;
};
export type TimeLogEntryInDb = {
  _id: string | null;
  timestamp: string;
  activity: string;
  time_category: string;
  task_category: string;
  core_values?: string[];
  intentionality: number;
  energy: number;
};
export const {
  useListLogsQuery,
  useCreateLogMutation,
  useImportLogsMutation,
  useListTimelogsQuery,
} = injectedRtkApi;
