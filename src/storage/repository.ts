import { openDatabaseAsync } from 'expo-sqlite';
import { initialState, restoreState, type State } from '../core/model';
import {MIGRATION_SQL,UPSERT_SQL} from './schema';
// Keep the existing database filename so the ZAD rename preserves installed users' data.
const database = openDatabaseAsync('ramadan-journey.db');
let initialized: Promise<void> | undefined;
function ready() {
  return initialized ??= database.then(async db => {
    await db.execAsync(MIGRATION_SQL);
  });
}
export async function load(): Promise<State> {
  await ready();
  const row = await (await database).getFirstAsync<{payload:string}>('SELECT payload FROM app_state WHERE id=1');
  return row ? restoreState(row.payload) : initialState();
}
export async function save(state: State): Promise<void> {
  await ready();
  await (await database).runAsync(UPSERT_SQL, JSON.stringify(state));
}
