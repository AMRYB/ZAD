import { initialState, restoreState, type State } from '../core/model';
const KEY = 'ramadan-journey-v1';
export async function load(): Promise<State> {
  const text = localStorage.getItem(KEY);
  return text ? restoreState(text) : initialState();
}
export async function save(state: State): Promise<void> { localStorage.setItem(KEY, JSON.stringify(state)); }
