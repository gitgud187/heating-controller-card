/**
 * A fake Home Assistant for the tests: the registries and the states a heating controller entry
 * produces. No real entity ids, no real rooms.
 */

import type {
  AreaRegistryEntry,
  DeviceRegistryEntry,
  EntityRegistryEntry,
  HassEntity,
  HomeAssistant,
} from '../types';

export const CONTROLLER = 'controller';

export interface RoomSpec {
  id: string;
  name: string;
  status?: string | null;
  share?: number;
  errorK?: number;
  current?: number;
  target?: number;
  valvePosition?: number;
  valveOpen?: boolean;
  overheating?: boolean;
  areaId?: string;
}

export interface Spec {
  boiler?: string | null;
  reason?: { code: string; message: string } | null;
  load?: number | null;
  startLoad?: number;
  stopLoad?: number;
  output?: number | null;
  base?: number;
  proportional?: number;
  integral?: number;
  starts?: number;
  runMinutes?: number;
  lockoutUntil?: string;
  paused?: boolean;
  rooms?: RoomSpec[];
  controllerName?: string;
  /** State labels, as `hass.formatEntityState` gives them. */
  labels?: Record<string, string>;
  /** A second controller device, to test picking one. */
  secondController?: boolean;
  /** A device from another integration, which the card must ignore. */
  foreignPlatform?: boolean;
}

const ENTITY_ID = (deviceId: string, key: string): string => {
  const [domain, translationKey] = key.split(':');
  return `${domain}.${deviceId}_${translationKey}`;
};

export function makeHass(spec: Spec = {}): HomeAssistant {
  const states: Record<string, HassEntity> = {};
  const entities: Record<string, EntityRegistryEntry> = {};
  const devices: Record<string, DeviceRegistryEntry> = {};
  const areas: Record<string, AreaRegistryEntry> = {};

  const device = (id: string, name: string): void => {
    devices[id] = { id, name };
  };

  const add = (
    deviceId: string,
    key: string,
    state: string | undefined,
    attributes: Record<string, unknown> = {},
    platform = 'heating_controller',
  ): void => {
    if (state === undefined) {
      return;
    }
    const entityId = ENTITY_ID(deviceId, key);
    const translationKey = key.split(':')[1] ?? key;
    entities[entityId] = {
      entity_id: entityId,
      device_id: deviceId,
      platform,
      translation_key: translationKey,
    };
    states[entityId] = { entity_id: entityId, state, attributes };
  };

  device(CONTROLLER, spec.controllerName ?? 'Heating');

  add(CONTROLLER, 'sensor:boiler', spec.boiler === null ? undefined : (spec.boiler ?? 'on'), {
    ...(spec.reason === null
      ? {}
      : {
          reason: spec.reason?.code ?? 'running_load',
          message: spec.reason?.message ?? 'running: load 7.2 ≥ 1.5 m²·K',
        }),
  });
  add(CONTROLLER, 'sensor:load', spec.load === null ? undefined : String(spec.load ?? 7.2), {
    start_load_m2k: spec.startLoad ?? 4,
    stop_load_m2k: spec.stopLoad ?? 1.5,
  });
  add(
    CONTROLLER,
    'sensor:modulation',
    spec.output === null ? undefined : String(spec.output ?? 54),
  );
  add(CONTROLLER, 'sensor:base', String(spec.base ?? 48));
  add(CONTROLLER, 'sensor:proportional', String(spec.proportional ?? 2.8));
  add(CONTROLLER, 'sensor:integral', String(spec.integral ?? 3.2));
  add(CONTROLLER, 'sensor:starts_last_hour', String(spec.starts ?? 1));
  add(CONTROLLER, 'sensor:run_time', String(spec.runMinutes ?? 42));
  add(
    CONTROLLER,
    'sensor:lockout_until',
    spec.lockoutUntil === undefined ? 'unknown' : spec.lockoutUntil,
  );
  add(CONTROLLER, 'switch:pause', spec.paused === true ? 'on' : 'off');
  add(CONTROLLER, 'button:clear_lockout', 'unknown');

  if (spec.secondController === true) {
    device('controller2', 'Second heating');
    add('controller2', 'sensor:boiler', 'off', { reason: 'idle', message: 'off: idle' });
    add('controller2', 'sensor:load', '0', { start_load_m2k: 4, stop_load_m2k: 1.5 });
  }

  if (spec.foreignPlatform === true) {
    device('other', 'Other device');
    add('other', 'sensor:boiler', 'on', {}, 'other_integration');
  }

  for (const room of spec.rooms ?? []) {
    device(room.id, room.name);
    if (room.areaId !== undefined) {
      areas[room.areaId] = { area_id: room.areaId, name: 'Area of the room' };
      devices[room.id] = { id: room.id, name: room.name, area_id: room.areaId };
    }
    add(
      room.id,
      'sensor:room_status',
      room.status === null ? undefined : (room.status ?? 'satisfied'),
      {
        ...(room.current === undefined ? {} : { current_temperature: room.current }),
        ...(room.target === undefined ? {} : { target_temperature: room.target }),
        ...(room.valvePosition === undefined ? {} : { valve_position: room.valvePosition }),
      },
    );
    add(room.id, 'sensor:room_load', String(room.share ?? 0));
    if (room.errorK !== undefined) {
      add(room.id, 'sensor:room_error', String(room.errorK));
    }
    add(room.id, 'binary_sensor:valve_open', room.valveOpen === true ? 'on' : 'off');
    add(room.id, 'binary_sensor:overheating', room.overheating === true ? 'on' : 'off');
  }

  const hass: HomeAssistant = {
    states,
    entities,
    devices,
    areas,
    callService: () => Promise.resolve(undefined),
  };

  if (spec.labels !== undefined) {
    const labels = spec.labels;
    hass.formatEntityState = (stateObj) => labels[stateObj.state] ?? stateObj.state;
  }

  return hass;
}

/** The entity id the fixtures give an entity, for tests that need to look one up. */
export function entityId(deviceId: string, key: string): string {
  return ENTITY_ID(deviceId, key);
}
