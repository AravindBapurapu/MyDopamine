import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface DailyLog_Key {
  id: UUIDString;
  __typename?: 'DailyLog_Key';
}

export interface GetUserProfileData {
  user?: {
    id: UUIDString;
    displayName: string;
    email?: string | null;
    photoUrl?: string | null;
    createdAt: TimestampString;
  } & User_Key;
}

export interface Goal_Key {
  id: UUIDString;
  __typename?: 'Goal_Key';
}

export interface Habit_Key {
  id: UUIDString;
  __typename?: 'Habit_Key';
}

export interface JournalEntry_Key {
  id: UUIDString;
  __typename?: 'JournalEntry_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface GetUserProfileRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetUserProfileData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetUserProfileData, undefined>;
  operationName: string;
}
export const getUserProfileRef: GetUserProfileRef;

export function getUserProfile(options?: ExecuteQueryOptions): QueryPromise<GetUserProfileData, undefined>;
export function getUserProfile(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetUserProfileData, undefined>;

