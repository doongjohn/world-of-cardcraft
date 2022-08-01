import * as Game from '../game'
import * as GameMatch from '../match'
import * as Selection from '../match/selection'
import { tuplesEqual } from '../utils'

const cellSize = 90
export const w = 11
export const h = 7

const selectAlpha = 0.8
const hoverAlpha = 0.2

export class Grid {
  grid: Phaser.GameObjects.Rectangle[][] = []
  selectable: boolean[][] = []

  constructor(scene: Phaser.Scene) {
    const baseGrid = scene.add
      .grid(Game.w / 2, Game.h / 2, cellSize * w, cellSize * h, cellSize, cellSize)
      .setFillStyle(0xededed, 0.2)

    const topLeft = baseGrid.getTopLeft()
    topLeft.x += cellSize / 2
    topLeft.y += cellSize / 2

    for (let y = 0; y < h; ++y) {
      this.grid[y] = []
      for (let x = 0; x < w; ++x) {
        this.grid[y][x] = scene.add
          .rectangle(topLeft.x + x * cellSize, topLeft.y + y * cellSize, cellSize, cellSize)
          .setFillStyle(0x7aa3b8, 0)
          .setInteractive()
      }
    }

    for (let y = 0; y < h; ++y) {
      this.selectable[y] = []
      for (let x = 0; x < w; ++x) {
        this.selectable[y][x] = true
      }
    }

    GameMatch.scene.input.on('pointerdown', () => {
      if (!Selection.hovering.tile && Selection.selected.tile[0]) {
        const [x, y] = Selection.selected.tile[0]
        this.grid[y][x].fillAlpha = 0
        Selection.clearSelectTile()
      }
    })

    // setup input event
    for (let y = 0; y < h; ++y) {
      for (let x = 0; x < w; ++x) {
        this.grid[y][x]
          .on('pointerdown', () => {
            if (!this.selectable[y][x]) {
              return
            }
            // TODO: able to select multiple tiles
            // currently select only one tile
            if (Selection.selected.tile[0]) {
              const [x, y] = Selection.selected.tile[0]
              Selection.unselectTile(x, y)
              this.grid[y][x].fillAlpha = 0
            }
            this.grid[y][x].fillAlpha = selectAlpha
            Selection.selectTile(x, y)
          })
          .on('pointerover', () => {
            if (!this.selectable[y][x]) {
              return
            }
            this.grid[y][x].fillAlpha += hoverAlpha
            Selection.hoverTile(x, y)
          })
          .on('pointerout', () => {
            if (!tuplesEqual(Selection.selected.tile[0], [x, y])) {
              this.grid[y][x].fillAlpha = 0
            }
            Selection.clearHoverTile()
          })
      }
    }

    scene.input.on('gameout', () => {
      for (let y = 0; y < h; ++y) {
        for (let x = 0; x < w; ++x) {
          if (!tuplesEqual(Selection.selected.tile[0], [x, y])) {
            this.grid[y][x].fillAlpha = 0
          }
          Selection.clearHoverTile()
        }
      }
    })
  }

  setSelectableAll() {
    for (let y = 0; y < h; ++y) {
      for (let x = 0; x < w; ++x) {
        this.selectable[y][x] = true
      }
    }
  }

  setSelectable(fn: (x: number, y: number) => boolean) {
    for (let y = 0; y < h; ++y) {
      for (let x = 0; x < w; ++x) {
        this.selectable[y][x] = fn(x, y)
      }
    }
  }

  updateVisual() {
    for (let y = 0; y < h; ++y) {
      for (let x = 0; x < w; ++x) {
        this.grid[y][x].fillAlpha = 0
        if (tuplesEqual(Selection.selected.tile[0], [x, y])) {
          this.grid[y][x].fillAlpha = selectAlpha
        }
        if (tuplesEqual(Selection.hovering.tile, [x, y])) {
          this.grid[y][x].fillAlpha += hoverAlpha
        }
      }
    }
  }

  gridToWorldPos(x: number, y: number) {
    const tile = this.grid[y][x]
    return [tile.x, tile.y]
  }
}
