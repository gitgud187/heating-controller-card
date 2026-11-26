/**
 * Finding the controller and its rooms.
 *
 * The integration names its entities through translation keys, and the user may rename both the
 * entities and their ids, so entity ids are never hard-coded. The entity registry says which
 * platform an entity belongs to and which device it sits on: the controller is the device with a
 * boiler sensor, each room is a device with a room status sensor.
 */

import type { HeatingControllerCardConfig, HomeAssistant } from './types';

export const PLATFORM = 'heating_controller';

export interface ControllerEntities {
  boiler?: string;
  load?: string;
  output?: string;
  base?: string;
  proportional?: string;
  integral?: string;
  starts?: string;
  runTime?: string;
  lockoutUntil?: string;
  pause?: string;
  clearLockout?: string;
}

export interface RoomEntities {
  status?: string;
  load?: string;
  error?: string;
  valveOpen?: string;
  overheating?: string;
}

export interface Room {
  id: string;
  name: string;
  entities: RoomEntities;
}

export interface Controller {
  id: string;
  name: string;
  entities: ControllerEntities;
  rooms: Room[];
}

const CONTROLLER_ENTITIES: Record<string, keyof ControllerEntities> = {
  'sensor:boiler': 'boiler',
  'sensor:load': 'load',
  'sensor:modulation': 'output',
  'sensor:base': 'base',
  'sensor:proportional': 'proportional',
  'sensor:integral': 'integral',
  'sensor:starts_last_hour': 'starts',
  'sensor:run_time': 'runTime',
  'sensor:lockout_until': 'lockoutUntil',
  'switch:pause': 'pause',
  'button:clear_lockout': 'clearLockout',
};

const ROOM_ENTITIES: Record<string, keyof RoomEntities> = {
  'sensor:room_status': 'status',
  'sensor:room_load': 'load',
  'sensor:room_error': 'error',
  'binary_sensor:valve_open': 'valveOpen',
  'binary_sensor:overheating': 'overheating',
};

const BOILER_KEY = 'sensor:boiler';
const STATUS_KEY = 'sensor:room_status';

/** Registry key for an entity: its domain and its translation key, e.g. `sensor:boiler`. */
function registryKey(entityId: string, translationKey: string): string {
  return `${entityId.split('.')[0]}:${translationKey}`;
}

/** Device id → registry key → entity id, for every entity of the integration. */
function groupByDevice(hass: HomeAssistant): Map<string, Map<string, string>> {
  const devices = new Map<string, Map<string, string>>();
  for (const entry of Object.values(hass.entities ?? {})) {
    if (entry.platform !== PLATFORM || !entry.device_id || !entry.translation_key) {
      continue;
    }
    const key = registryKey(entry.entity_id, entry.translation_key);
    const entities = devices.get(entry.device_id) ?? new Map<string, string>();
    entities.set(key, entry.entity_id);
    devices.set(entry.device_id, entities);
  }
  return devices;
}

function deviceName(hass: HomeAssistant, deviceId: string, fallback: string): string {
  const device = hass.devices?.[deviceId];
  const own = device?.name_by_user ?? device?.name;
  if (own) {
    return own;
  }
  const areaId = device?.area_id;
  const area = areaId ? hass.areas?.[areaId]?.name : undefined;
  return area ?? fallback;
}

function pick<T extends object>(entities: Map<string, string>, map: Record<string, keyof T>): T {
  const picked: Record<string, string> = {};
  for (const [key, field] of Object.entries(map)) {
    const entityId = entities.get(key);
    if (entityId !== undefined) {
      picked[field as string] = entityId;
    }
  }
  return picked as T;
}

/**
 * The controller the card shows, or `undefined` when the integration is not set up.
 *
 * With `config.controller` set, that device is used; otherwise the first controller device in
 * registry order. A configured id that is not a controller falls back to the first one.
 */
export function discover(
  hass: HomeAssistant,
  config: HeatingControllerCardConfig = {},
): Controller | undefined {
  const devices = groupByDevice(hass);
  const controllerIds = [...devices.keys()]
    .filter((id) => devices.get(id)?.has(BOILER_KEY))
    .sort((a, b) => a.localeCompare(b));

  const configured = config.controller;
  const controllerId =
    configured !== undefined && controllerIds.includes(configured) ? configured : controllerIds[0];

  if (controllerId === undefined) {
    return undefined;
  }

  const rooms = [...devices.entries()]
    .filter(([id, entities]) => id !== controllerId && entities.has(STATUS_KEY))
    .map(([id, entities]): Room => {
      return {
        id,
        name: deviceName(hass, id, 'Room'),
        entities: pick<RoomEntities>(entities, ROOM_ENTITIES),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

  return {
    id: controllerId,
    name: deviceName(hass, controllerId, 'Heating'),
    entities: pick<ControllerEntities>(
      devices.get(controllerId) ?? new Map<string, string>(),
      CONTROLLER_ENTITIES,
    ),
    rooms,
  };
}
