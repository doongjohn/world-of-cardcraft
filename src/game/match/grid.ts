import * as Game from '../game'
import * as GameMatch from '../match'
import * as Selection from '../match/selection'

const cellSize = 90
export const w = 11
export const h = 7

const selectAlpha = 0.8
const hoverAlpha = 0.2

export class Grid {
  grid: Phaser.GameObjects.Rectangle[][] = []

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
          .on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            // check locked
            if (Selection.isTileLocked([x, y])) {
              return
            }

            // TODO: make board obj right click menu
            if (pointer.rightButtonDown()) {
              // right click
            }

            // unselect previous selected tiles
            if (Selection.selected.tile.length > 0) {
              for (const [x, y] of Selection.selected.tile) {
                this.grid[y][x].fillAlpha = 0
                Selection.unselectTile(x, y)
              }
            }

            // select this tile
            this.grid[y][x].fillAlpha = selectAlpha + hoverAlpha
            Selection.selectTile(x, y)
          })
          .on('pointerover', () => {
            // check locked
            if (Selection.isTileLocked([x, y])) {
              return
            }
            // hover tile
            this.grid[y][x].fillAlpha += hoverAlpha
            Selection.hoverTile(x, y)
          })
          .on('pointerout', () => {
            // clear hovering
            if (Selection.isTileSelected([x, y])) {
              this.grid[y][x].fillAlpha = selectAlpha
            } else {
              this.grid[y][x].fillAlpha = 0
            }
            Selection.clearHoverTile()
          })
      }
    }

    scene.input.on('gameout', () => {
      for (let y = 0; y < h; ++y) {
        for (let x = 0; x < w; ++x) {
          // clear hovering
          if (!Selection.isTileSelected([x, y])) {
            this.grid[y][x].fillAlpha = 0
          }
          Selection.clearHoverTile()
        }
      }
    })
  }

  updateVisual() {
    for (let y = 0; y < h; ++y) {
      for (let x = 0; x < w; ++x) {
        this.grid[y][x].fillAlpha = 0
        if (Selection.isTileSelected([x, y])) {
          this.grid[y][x].fillAlpha = selectAlpha
        }
        if (Selection.isTileHovering([x, y])) {
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
