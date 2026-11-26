import type { HassEntity, HomeAssistant } from './types';

const MISSING = new Set(['', 'unavailable', 'unknown']);

/** The state object of an entity, if it exists. */
export function stateOf(hass: HomeAssistant, entityId?: string): HassEntity | undefined {
  return entityId === undefined ? undefined : hass.states[entityId];
}

/** A numeric state, or `undefined` when the entity is missing, unavailable or not a number. */
export function numberOf(hass: HomeAssistant, entityId?: string): number | undefined {
  const state = stateOf(hass, entityId)?.state;
  if (state === undefined || MISSING.has(state)) {
    return undefined;
  }
  const value = Number(state);
  return Number.isFinite(value) ? value : undefined;
}

/** A numeric attribute, with the same guard against missing values. */
export function attributeNumber(
  hass: HomeAssistant,
  entityId: string | undefined,
  attribute: string,
): number | undefined {
  const value = stateOf(hass, entityId)?.attributes[attribute];
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

/**
 * What Home Assistant shows for a state: the integration's translated label for an enum, or the
 * raw state when the frontend has no formatter (an older frontend, or a test).
 */
export function labelOf(hass: HomeAssistant, stateObj: HassEntity | undefined): string {
  if (stateObj === undefined) {
    return '';
  }
  try {
    return hass.formatEntityState?.(stateObj) ?? stateObj.state;
  } catch {
    // An enum without translations throws instead of returning the raw state.
    return stateObj.state;
  }
}

/** A number with a fixed number of decimals; empty when the value is missing. */
export function formatNumber(value: number | undefined, digits = 1): string {
  return value === undefined ? '' : value.toFixed(digits);
}

/** Minutes as a short duration, for the run time. */
export function formatMinutes(value: number | undefined): string {
  return value === undefined ? '' : `${Math.round(value)} min`;
}

/** An ISO timestamp as a time of day, in the user's locale. */
export function formatTime(iso: string | undefined): string {
  if (iso === undefined) {
    return '';
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  // 24-hour time, like the reason messages the engine writes ("until 14:30").
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}
