import * as Game from '../game'
import * as GameMatch from '../match'
import * as Selection from './selection'
import * as Scenes from '../scenes/match'
import { Player } from '../player'
import { CardIndex, CardObj } from '../cards/card'
import { Menu } from 'phaser3-rex-plugins/templates/ui/ui-components'
import { Board } from './board'

// TODO: make hand zone
export class Hand {
  // data: card index list
  cards: CardIndex[] = []
  ui: HandUi

  constructor(owner: Player) {
    this.ui = new HandUi(owner)
  }

  add(cardIndex: CardIndex) {
    this.cards.push(cardIndex)
    this.ui.add(cardIndex)
  }

  remove(cardIndex: CardIndex) {
    const arrayIndex = this.cards.indexOf(cardIndex)
    this.cards.splice(arrayIndex, 1)
    this.ui.remove(cardIndex)
  }
}

export class HandUi {
  owner: Player
  cardObjs: CardObj[] = []
  baselineY: number

  constructor(owner: Player) {
    this.owner = owner
    this.baselineY = Game.h - 50

    GameMatch.scene.input.on('gameout', () => {
      if (GameMatch.turnPlayer != owner.index) return
      if (
        Selection.selected.cardObj.length == 0 ||
        !this.cardObjs.includes(Selection.selected.cardObj[0])
      ) {
        this.update()
      }
    })

    // reset selection when click empty space
    GameMatch.scene.input.on('pointerdown', () => {
      if (GameMatch.turnPlayer != owner.index) return
      const cardObjHoveringOrSelected =
        Selection.selected.cardObj.length > 0 || this.cardObjs.includes(Selection.hovering.cardObj)
      if (!cardObjHoveringOrSelected && !HandUiAction.hovering) {
        Selection.clearSelectCardObj()
        this.update()
        HandUiAction.destroy()
      }
    })
  }

  setVisible(value: boolean) {
    for (const cardObj of this.cardObjs) {
      cardObj.container.setVisible(value)
    }

    if (value) {
      // show
      this.update()
    } else {
      // hide
      HandUiAction.destroy()
    }
  }

  add(cardIndex: CardIndex) {
    const cardObj = new CardObj(GameMatch.scene, GameMatch.cards[this.owner.index][cardIndex])
    cardObj.container.depth = 100
    cardObj.container
      .setSize(CardObj.size.x, CardObj.size.y)
      .setInteractive()
      // on card obj click
      .on('pointerdown', () => {
        // clear selected tile
        Selection.clearSelectTile()
        GameMatch.grid.updateVisual()

        Selection.selected.cardObj[0] = cardObj
        for (const cardObj of this.cardObjs) {
          cardObj.y =
            Selection.selected.cardObj[0] == cardObj ? this.baselineY - 60 : this.baselineY
        }

        // trigger event
        GameMatch.Events.handCardClick.emit('hand.card.click', cardObj)

        // action ui
        HandUiAction.createButtons(GameMatch.scene as Scenes.Match)

        // TODO: make on card select action
        // permanent
        //   - normal summon
        //   - special summon
        //   - activate (hand)
        //   - set
        // spell, rune card
        //   - activate (board or hand)
        //   - set
      })
      // on card obj hover
      .on('pointerover', () => {
        Selection.hoverCardObj(cardObj)
        cardObj.y = this.baselineY - 60
      })
      // on card obj hover end
      .on('pointerout', () => {
        Selection.clearHoverCardObj()
        if (Selection.selected.cardObj[0] != cardObj) {
          cardObj.y = this.baselineY
        }
      })

    this.cardObjs.push(cardObj)
    this.update()
  }

  remove(cardIndex: CardIndex) {
    const card = GameMatch.cards[this.owner.index][cardIndex]
    const arrayIndex = this.cardObjs.findIndex((cardObj) => cardObj.card == card)
    this.cardObjs[arrayIndex].destroy()
    this.cardObjs.splice(arrayIndex, 1)
    this.update()
  }

  update() {
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

    // https://codepen.io/rexrainbow/pen/KKopywp?editors=0010
    // TODO: make this list dynamically base on the card data
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

    HandUiAction.menu = matchScene.rexUI.add.menu({
      x: cardObj[0].x,
      y: cardObj[0].y - 280,
      orientation: 'y',
      subMenuSide: 'right',
      items: items,
      createBackgroundCallback: function(items: any) {
        const scene: Scenes.Match = items.scene
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

    HandUiAction.menu.setAnchor({
      centerX: '0%+' + cardObj[0].x,
    })

    HandUiAction.menu
      .on('button.over', function(button: any) {
        HandUiAction.hovering = true
        button.getElement('background').setStrokeStyle(1, 0xffffff)
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
      .on('popup.complete', function() {
        // console.log('popup.complete')
      })
      .on('scaledown.complete', function() {
        // console.log('scaledown.complete')
      })
  }
  static destroy() {
    if (HandUiAction.menu) {
      HandUiAction.menu.destroy()
    }
  }

  static actionSummon() {
    HandUiAction.menu.destroy()

    // only empty tile can be selected
    GameMatch.grid.setSelectable((x: number, y: number) => {
      return !Board.at(x, y)
    })

    // TODO: press esc to cancel summon
    // TODO: make user unable to select or unselect cardObj
    // TODO: make user unable to end turn

    const handler = (x: number, y: number) => {
      // TODO: (longterm) impl full summon sequence
      // 1. send selected card to the limbo
      // 2. negate summon trigger
      // 3. actually summon (if negated send to the graveyard)
      Board.createObj(x, y, Selection.selected.cardObj[0].card)
      Selection.clearHoverCardObj()
      Selection.clearSelectCardObj()
      GameMatch.grid.setSelectableAll()
      GameMatch.hands[GameMatch.turnPlayer].ui.update()
      GameMatch.scene.events.removeListener('selection.select.tile', handler)
      // 4. on summon trigger
    }
    GameMatch.scene.events.on('selection.select.tile', handler)
  }
  static actionSpecialSummon() {}
  static actionSet() {}
  static actionActivate() {}
}
