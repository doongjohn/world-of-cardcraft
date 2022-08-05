import * as Game from '../game'
import * as Scenes from '../scenes/match'
import * as GameMatch from '../match'
import * as GameEvent from '../event'
import * as Selection from './selection'
import { Player } from '../player'
import { CardHandle, CardObj } from '../cards/card'
import { Board } from './board'
import { Menu } from 'phaser3-rex-plugins/templates/ui/ui-components'

export class Hand {
  // data: card index list
  cards: CardHandle[] = []
  ui: HandUi

  constructor(owner: Player) {
    this.ui = new HandUi(owner)
  }

  add(cardHandle: CardHandle) {
    this.cards.push(cardHandle)
    this.ui.add(cardHandle)
  }

  remove(cardHandle: CardHandle) {
    const arrayIndex = this.cards.indexOf(cardHandle)
    this.cards.splice(arrayIndex, 1)
    this.ui.remove(cardHandle)
  }
}

export class HandUi {
  owner: Player
  cardObjs: CardObj[] = []
  hovering: CardObj = null
  baselineY = Game.h - 50

  constructor(owner: Player) {
    this.owner = owner

    GameMatch.scene.input.on('gameout', () => {
      if (GameMatch.turnPlayer != owner.id) {
        return
      }
      if (
        Selection.selected.cardObj.length == 0 ||
        !this.cardObjs.includes(Selection.selected.cardObj[0])
      ) {
        this.updateLayout()
      }
    })

    // reset selection when click empty space
    GameMatch.scene.input.on('pointerdown', () => {
      if (GameMatch.turnPlayer != owner.id) {
        return
      }
      if (!this.hovering && !HandUiAction.hovering) {
        Selection.clearSelectCardObj()
        Selection.lockCardObj(false)
        Selection.lockTileFn(() => false)

        this.updateLayout()
        HandUiAction.destroy()

        // cancel all events
        GameEvent.removeAllListeners(GameEvent.Events.Selection_Select_Tile)
      }
    })
  }

  setVisible(value: boolean) {
    for (const cardObj of this.cardObjs) {
      cardObj.container.setVisible(value)
    }

    if (value) {
      // show
      this.updateLayout()
    } else {
      // hide
      HandUiAction.destroy()
    }
  }

  add(cardHandle: CardHandle) {
    // NOTE: (maybe) use object pooling
    const cardObj = new CardObj(GameMatch.scene, GameMatch.cards[this.owner.id][cardHandle])
    cardObj.container.depth = 100
    cardObj.container
      .setSize(CardObj.size.x, CardObj.size.y)
      .setInteractive()
      // on card obj click
      .on('pointerdown', () => {
        if (Selection.locked.cardObj) {
          return
        }

        // clear selected tile
        Selection.clearSelectTile()
        GameMatch.grid.updateVisual()

        Selection.selected.cardObj[0] = cardObj
        for (const cardObj of this.cardObjs) {
          cardObj.y =
            Selection.selected.cardObj[0] == cardObj ? this.baselineY - 60 : this.baselineY
        }

        // create action ui
        HandUiAction.createButtons(GameMatch.scene as Scenes.Match)
      })
      // on card obj hover
      .on('pointerover', () => {
        this.hovering = cardObj
        if (Selection.locked.cardObj) {
          return
        }
        Selection.hoverCardObj(cardObj)
        cardObj.y = this.baselineY - 60
      })
      // on card obj hover end
      .on('pointerout', () => {
        this.hovering = null
        Selection.clearHoverCardObj()
        if (Selection.selected.cardObj[0] != cardObj) {
          cardObj.y = this.baselineY
        }
      })

    this.cardObjs.push(cardObj)
    this.updateLayout()
  }

  remove(cardHandle: CardHandle) {
    const card = GameMatch.cards[this.owner.id][cardHandle]
    const arrayIndex = this.cardObjs.findIndex((cardObj) => cardObj.card == card)
    this.cardObjs[arrayIndex].destroy()
    this.cardObjs.splice(arrayIndex, 1)
    this.updateLayout()
  }

  updateLayout() {
    // TODO: calculate gap based on the max width
    const gap = 10
    const leftX = ((this.cardObjs.length - 1) / 2) * (CardObj.size.x + gap)
    for (let i = 0; i < this.cardObjs.length; ++i) {
      if (Selection.selected.cardObj) {
        this.cardObjs[i].y =
          Selection.selected.cardObj[0] == this.cardObjs[i] ? this.baselineY - 60 : this.baselineY
      } else {
        this.cardObjs[i].y = this.baselineY
      }
      this.cardObjs[i].x = Game.w / 2 - leftX + i * (CardObj.size.x + gap)
    }
  }
}

export class HandUiAction {
  static menu: Menu = null
  static hovering = false

  static createButtons(matchScene: Scenes.Match) {
    HandUiAction.destroy()
    const cardObj = Selection.selected.cardObj

    // NOTE: https://codepen.io/rexrainbow/pen/KKopywp?editors=0010
    // TODO: make this list dynamically base on the card data
    // actions:
    // permanent
    //   - normal summon
    //   - special summon
    //   - activate (hand)
    //   - set
    // spell, rune card
    //   - activate (board or hand)
    //   - set
    const items = [
      {
        name: 'summon',
      },
      {
        name: 'special summon',
      },
      {
        name: 'set',
      },
      {
        name: 'activate',
      },
    ]

    // create menu
    HandUiAction.menu = matchScene.rexUI.add.menu({
      x: cardObj[0].x,
      y: cardObj[0].y - 280,
      orientation: 'y',
      subMenuSide: 'right',
      items: items,
      createBackgroundCallback: function(items: any) {
        const scene: Scenes.Match = items.scene
        // TODO: make color module
        return scene.rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0x212121)
      },
      createButtonCallback: function(item: any) {
        const scene: Scenes.Match = item.scene
        return scene.rexUI.add.label({
          background: scene.rexUI.add.roundRectangle(0, 0, 2, 2, 0),
          text: scene.add.text(0, 0, item.name, {
            fontSize: '20px',
          }),
          space: {
            left: 10,
            right: 10,
            top: 10,
            bottom: 10,
          },
        })
      },

      easeIn: 0,
      easeOut: 0,
    })

    // position menu
    HandUiAction.menu.setAnchor({
      centerX: '0%+' + cardObj[0].x,
    })

    // setup callback
    HandUiAction.menu
      .on('button.over', function(button: any) {
        HandUiAction.hovering = true
        button.getElement('background').setStrokeStyle(2, 0xffffff)
      })
      .on('button.out', function(button: any) {
        HandUiAction.hovering = false
        button.getElement('background').setStrokeStyle()
      })
      .on('button.click', function(button: any) {
        HandUiAction.hovering = false
        switch (button.text) {
          case 'summon':
            HandUiAction.actionSummon()
            break
          case 'special summon':
            HandUiAction.actionSpecialSummon()
            break
          case 'set':
            HandUiAction.actionSet()
            break
          case 'activate':
            HandUiAction.actionActivate()
            break
        }
      })
  }
  static destroy() {
    if (HandUiAction.menu) {
      HandUiAction.menu.destroy()
    }
  }

  static actionSummon() {
    // TODO: make user unable to end turn
    Selection.lockCardObj(true)
    Selection.lockTileFn((x: number, y: number) => {
      // only empty tile can be selected
      return Board.at(x, y) != null
    })

    HandUiAction.menu.destroy()

    const handler = (x: number, y: number) => {
      // 0. pay its cost

      // 1. remove this card from the hand
      GameMatch.hands[GameMatch.turnPlayer].remove(Selection.selected.cardObj[0].card.handle)
      GameMatch.hands[GameMatch.turnPlayer].ui.updateLayout()

      // 2. negate summon trigger
      GameEvent.emit(GameEvent.Events.Trigger_NegateSummon)

      // 3. actually summon
      // if (negated) {
      //   // add this card back to its hand
      // }
      Board.createObj(x, y, Selection.selected.cardObj[0].card)

      // 4. on summon trigger
      GameEvent.emit(GameEvent.Events.Trigger_OnSummon)

      Selection.clearHoverCardObj()
      Selection.clearSelectCardObj()
      Selection.lockCardObj(false)
      Selection.lockTileFn(() => false)
      GameEvent.removeListener(GameEvent.Events.Selection_Select_Tile, handler)
    }

    // register event
    GameEvent.on(GameEvent.Events.Selection_Select_Tile, handler)
  }

  static actionSpecialSummon() {}

  static actionSet() {}

  static actionActivate() {}
}
