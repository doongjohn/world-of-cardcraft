import * as GameMatch from '../match'
import { CardObj, BoardObj } from '../cards/card'

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

// phaser events
// https://labs.phaser.io/edit.html?src=src/events/create%20event%20emitter.js&v=3.55.2

export function selectCardObj(cardObj: CardObj) {
  selected.cardObj.push(cardObj)
  GameMatch.scene.events.emit('selection.select.cardObj', cardObj)
}
export function selectBoardObj(boardObj: BoardObj) {
  selected.boardObj.push(boardObj)
  GameMatch.scene.events.emit('selection.select.boardObj', boardObj)
}
export function selectTile(x: number, y: number) {
  selected.tile.push([x, y])
  GameMatch.scene.events.emit('selection.select.tile', x, y)
}

export function unselectCardObj(cardObj: CardObj) {
  selected.cardObj.splice(selected.cardObj.indexOf(cardObj), 1)
  GameMatch.scene.events.emit('selection.select.cardObj', cardObj)
}
export function unselectBoardObj(boardObj: BoardObj) {
  selected.boardObj.splice(selected.boardObj.indexOf(boardObj), 1)
  GameMatch.scene.events.emit('selection.select.boardObj', boardObj)
}
export function unselectTile(x: number, y: number) {
  selected.tile.splice(selected.tile.indexOf([x, y]), 1)
  GameMatch.scene.events.emit('selection.select.tile', x, y)
}

export function clearSelectCardObj() {
  selected.cardObj = []
  GameMatch.scene.events.emit('selection.clearSelect.cardObj')
}
export function clearSelectBoardObj() {
  selected.boardObj = []
  GameMatch.scene.events.emit('selection.clearSelect.boardObj')
}
export function clearSelectTile() {
  selected.tile = []
  GameMatch.scene.events.emit('selection.clearSelect.tile')
}

export function hoverCardObj(cardObj: CardObj) {
  hovering.cardObj = cardObj
  GameMatch.scene.events.emit('selection.hover.cardObj', cardObj)
}
export function hoverBoardObj(boardObj: BoardObj) {
  hovering.boardObj = boardObj
  GameMatch.scene.events.emit('selection.hover.boardObj', boardObj)
}
export function hoverTile(x: number, y: number) {
  hovering.tile = [x, y]
  GameMatch.scene.events.emit('selection.hover.tile', x, y)
}

export function clearHoverCardObj() {
  hovering.cardObj = null
  GameMatch.scene.events.emit('selection.clearHover.cardObj')
}
export function clearHoverBoardObj() {
  hovering.boardObj = null
  GameMatch.scene.events.emit('selection.clearHover.boardObj')
}
export function clearHoverTile() {
  hovering.tile = null
  GameMatch.scene.events.emit('selection.clearHover.tile')
}

// TODO: show selected obj data
// show selected card obj data
// show selected board obj data
