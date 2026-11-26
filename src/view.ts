/**
 * Everything the card needs to draw, read from the states of one controller.
 *
 * The card shows what the entities provide. Attributes the integration does not expose yet (room
 * temperatures, valve position, load thresholds) are simply absent, and the card leaves those
 * parts out instead of guessing.
 */

import type { Controller } from './discovery';
import { discover } from './discovery';
import { attributeNumber, labelOf, numberOf, stateOf } from './format';
import type { HeatingControllerCardConfig, HomeAssistant } from './types';

export interface Reason {
  code: string;
  message: string;
}

export interface Boiler {
  state: string;
  label: string;
  heating: boolean;
  paused: boolean;
  reason?: Reason;
  load?: number;
  startLoad?: number;
  stopLoad?: number;
  output?: number;
  base?: number;
  proportional?: number;
  integral?: number;
  starts?: number;
  runMinutes?: number;
  lockoutUntil?: string;
}

export interface Room {
  id: string;
  name: string;
  status?: string;
  label: string;
  share?: number;
  errorK?: number;
  current?: number;
  target?: number;
  valvePosition?: number;
  valveOpen: boolean;
  overheating: boolean;
  problem: boolean;
}

export interface Problem {
  id: string;
  title: string;
}

export interface CardView {
  title: string;
  boiler: Boiler;
  rooms: Room[];
  problems: Problem[];
  entities: Controller['entities'];
}

/** Statuses that need a human; a window left open or a thermostat turned off are not. */
const PROBLEM_STATUSES = new Set([
  'blocked',
  'valve_unhealthy',
  'valve_data_missing',
  'wall_invalid',
  'thermostat_invalid',
]);

function reasonOf(hass: HomeAssistant, controller: Controller): Reason | undefined {
  const stateObj = stateOf(hass, controller.entities.boiler);
  const code = stateObj?.attributes['reason'];
  const message = stateObj?.attributes['message'];
  if (typeof code !== 'string' || typeof message !== 'string') {
    return undefined;
  }
  return { code, message };
}

function boilerOf(hass: HomeAssistant, controller: Controller): Boiler {
  const entities = controller.entities;
  const stateObj = stateOf(hass, entities.boiler);
  const state = stateObj?.state ?? 'unavailable';
  const reason = reasonOf(hass, controller);
  const lockoutUntil = stateOf(hass, entities.lockoutUntil)?.state;

  return {
    state,
    label: labelOf(hass, stateObj),
    heating: state === 'on',
    paused: state === 'paused',
    ...(reason === undefined ? {} : { reason }),
    load: numberOf(hass, entities.load),
    startLoad: attributeNumber(hass, entities.load, 'start_load_m2k'),
    stopLoad: attributeNumber(hass, entities.load, 'stop_load_m2k'),
    output: numberOf(hass, entities.output),
    base: numberOf(hass, entities.base),
    proportional: numberOf(hass, entities.proportional),
    integral: numberOf(hass, entities.integral),
    starts: numberOf(hass, entities.starts),
    runMinutes: numberOf(hass, entities.runTime),
    ...(lockoutUntil === undefined || lockoutUntil === 'unknown' ? {} : { lockoutUntil }),
  };
}

function roomOf(hass: HomeAssistant, room: Controller['rooms'][number]): Room {
  const statusId = room.entities.status;
  const statusObj = stateOf(hass, statusId);
  const share = numberOf(hass, room.entities.load);
  const errorK = numberOf(hass, room.entities.error);
  const current = attributeNumber(hass, statusId, 'current_temperature');
  const target = attributeNumber(hass, statusId, 'target_temperature');
  const valvePosition = attributeNumber(hass, statusId, 'valve_position');
  const status = statusObj?.state;
  const overheating = stateOf(hass, room.entities.overheating)?.state === 'on';

  return {
    id: room.id,
    name: room.name,
    ...(status === undefined ? {} : { status }),
    label: labelOf(hass, statusObj),
    share,
    errorK,
    current,
    target,
    valvePosition,
    valveOpen: stateOf(hass, room.entities.valveOpen)?.state === 'on',
    overheating,
    problem: status !== undefined && PROBLEM_STATUSES.has(status),
  };
}

/** The controller as the card shows it, or `undefined` when the integration is not set up. */
export function buildView(
  hass: HomeAssistant,
  config: HeatingControllerCardConfig,
): CardView | undefined {
  const controller = discover(hass, config);
  if (controller === undefined) {
    return undefined;
  }

  const boiler = boilerOf(hass, controller);
  const rooms = controller.rooms.map((room) => roomOf(hass, room));

  const problems: Problem[] = [];
  if (boiler.state === 'unavailable') {
    problems.push({ id: `${controller.id}:boiler`, title: 'Boiler unavailable' });
  }
  for (const room of rooms) {
    if (room.problem) {
      problems.push({ id: room.id, title: `${room.name}: ${room.label}` });
    }
    if (room.overheating) {
      problems.push({ id: `${room.id}:overheating`, title: `${room.name}: Overheating` });
    }
  }

  return { title: controller.name, boiler, rooms, problems, entities: controller.entities };
}
