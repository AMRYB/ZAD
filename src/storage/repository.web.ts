import { initialState, restoreState, type State } from '../core/model';
// Retain the original storage key across the ZAD rename; no records are migrated or discarded.
const KEY = 'ramadan-journey-v1';
export async function load(): Promise<State> {
  const text = localStorage.getItem(KEY);
  return text ? restoreState(text) : initialState();
}
export async function save(state: State): Promise<void> { localStorage.setItem(KEY, JSON.stringify(state)); }
