import UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin'
import * as CardDB from '../cards/card_db'
import * as GameMatch from '../match'
import * as Selection from '../match/selection'

export class Match extends Phaser.Scene {
  rexUI: UIPlugin

  constructor() {
    super('match')
  }

  preload() {
    CardDB.loadImages(this)
    GameMatch.initScene(this)
    Selection.clearSelected()
    Selection.clearHovering()
  }

  create() {
    this.input.mouse.disableContextMenu()

    GameMatch.initPlayers()
    GameMatch.initBoard()
    GameMatch.PhaseUi.init()

    // change turn player
    const keySpace = this.input.keyboard.addKey('Space')
    keySpace.on('down', () => {
      Selection.clearSelected()
      Selection.clearHovering()
      GameMatch.setTurnPlayer((GameMatch.turnPlayer + 1) % 2)
    })
  }

  update() {}
}
