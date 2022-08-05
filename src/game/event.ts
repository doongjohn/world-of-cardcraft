/* eslint-disable @typescript-eslint/ban-types */

import * as GameMatch from './match'

export enum Events {
  // phase start
  Phase_Start_Draw,
  Phase_Start_StandBy,
  Phase_Start_Main1,
  Phase_Start_Battle,
  Phase_Start_Main2,
  Phase_Start_End,

  // phase end
  Phase_End_Draw,
  Phase_End_StandBy,
  Phase_End_Main1,
  Phase_End_Battle,
  Phase_End_Main2,
  Phase_End_End,

  // selection
  Selection_Select_Tile,
  Selection_Select_CardObj,
  Selection_Select_BoardObj,
  Selection_Hover_Tile,
  Selection_Hover_CardObj,
  Selection_Hover_BoardObj,

  // trigger
  Trigger_NegateSummon,
  Trigger_OnSummon,
}

export function emit(event: Events, ...args: any[]) {
  return GameMatch.scene.events.emit(event.toString(), ...args)
}

export function on(event: Events, fn: Function, context?: any) {
  return GameMatch.scene.events.on(event.toString(), fn, context)
}

export function once(event: Events, fn: Function, context?: any) {
  return GameMatch.scene.events.once(event.toString(), fn, context)
}

export function removeListener(event: Events, fn?: Function, context?: any, once?: boolean) {
  return GameMatch.scene.events.removeListener(event.toString(), fn, context, once)
}

export function removeAllListeners(event?: Events) {
  return GameMatch.scene.events.removeAllListeners(event.toString())
}
