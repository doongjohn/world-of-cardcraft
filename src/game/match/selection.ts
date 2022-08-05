import { tuplesEqual } from '../utils'
import { w, h } from './grid'
import { CardObj, BoardObj } from '../cards/card'
import * as GameEvent from '../event'

export const locked: {
  cardObj: boolean
  boardObj: boolean
  tile: Set<string>
} = {
  cardObj: false,
  boardObj: false,
  tile: new Set(),
}

export const selected: {
  cardObj: CardObj[]
  boardObj: BoardObj[]
  tile: [x: number, y: number][]
} = {
  cardObj: [],
  boardObj: [],
  tile: [],
}

export const hovering: {
  cardObj: CardObj
  boardObj: BoardObj
  tile: [x: number, y: number]
} = {
  cardObj: null,
  boardObj: null,
  tile: null,
}

export function clearLocked() {
  locked.cardObj = false
  locked.boardObj = false
  locked.tile.clear()
}
export function clearSelected() {
  selected.cardObj = []
  selected.boardObj = []
  selected.tile = []
}
export function clearHovering() {
  hovering.cardObj = null
  hovering.boardObj = null
  hovering.tile = null
}

export function lockCardObj(lock: boolean) {
  locked.cardObj = lock
}
export function lockBoardObj(lock: boolean) {
  locked.cardObj = lock
}
export function lockTile(pos: [x: number, y: number], lock: boolean) {
  if (lock) {
    locked.tile.add(pos.join(','))
  } else {
    locked.tile.delete(pos.join(','))
  }
}
export function lockTileFn(fn: (x: number, y: number) => boolean) {
  for (let y = 0; y < h; ++y) {
    for (let x = 0; x < w; ++x) {
      lockTile([x, y], fn(x, y))
    }
  }
}
export function isTileLocked(pos: [x: number, y: number]) {
  return locked.tile.has(pos.join(','))
}

// NOTE: phaser events
// https://labs.phaser.io/edit.html?src=src/events/create%20event%20emitter.js&v=3.55.2

export function selectCardObj(cardObj: CardObj) {
  selected.cardObj.push(cardObj)
  GameEvent.emit(GameEvent.Events.Selection_Select_CardObj, cardObj)
}
export function selectBoardObj(boardObj: BoardObj) {
  selected.boardObj.push(boardObj)
  GameEvent.emit(GameEvent.Events.Selection_Select_BoardObj, boardObj)
}
export function selectTile(x: number, y: number) {
  selected.tile.push([x, y])
  GameEvent.emit(GameEvent.Events.Selection_Select_Tile, x, y)
}
export function isTileSelected(pos: [x: number, y: number]) {
  for (const tile of selected.tile) {
    if (tuplesEqual(tile, pos)) return true
  }
  return false
}

export function unselectCardObj(cardObj: CardObj) {
  selected.cardObj.splice(selected.cardObj.indexOf(cardObj), 1)
  GameEvent.emit(GameEvent.Events.Selection_Select_CardObj, cardObj)
}
export function unselectBoardObj(boardObj: BoardObj) {
  selected.boardObj.splice(selected.boardObj.indexOf(boardObj), 1)
  GameEvent.emit(GameEvent.Events.Selection_Select_BoardObj, boardObj)
}
export function unselectTile(x: number, y: number) {
  selected.tile.splice(selected.tile.indexOf([x, y]), 1)
  GameEvent.emit(GameEvent.Events.Selection_Select_Tile, x, y)
}

export function clearSelectCardObj() {
  selected.cardObj = []
}
export function clearSelectBoardObj() {
  selected.boardObj = []
}
export function clearSelectTile() {
  selected.tile = []
}

export function hoverCardObj(cardObj: CardObj) {
  hovering.cardObj = cardObj
}
export function hoverBoardObj(boardObj: BoardObj) {
  hovering.boardObj = boardObj
}
export function hoverTile(x: number, y: number) {
  hovering.tile = [x, y]
}
export function isTileHovering(pos: [x: number, y: number]) {
  if (tuplesEqual(hovering.tile, pos)) {
    return true
  } else {
    return false
  }
}

export function clearHoverCardObj() {
  hovering.cardObj = null
}
export function clearHoverBoardObj() {
  hovering.boardObj = null
}
export function clearHoverTile() {
  hovering.tile = null
}

// TODO: show selected obj data (side panel)
// - show selected card/board obj data
// - user can change its data
