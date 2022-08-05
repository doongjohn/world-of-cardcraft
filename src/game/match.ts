import * as Scenes from './scenes/match'
import * as CardDB from './cards/card_db'
import * as Grid from './match/grid'
import * as GameEvent from './event'
import { Player } from './player'
import { Board } from './match/board'
import { BoardObj, Card } from './cards/card'
import { Hand } from './match/hand'
import { Label, Buttons } from 'phaser3-rex-plugins/templates/ui/ui-components.js'

export let scene: Scenes.Match
export let turnPlayer = 0
export let grid: Grid.Grid
export const players: Player[] = []
export const cards: Card[][] = []
// export const decks: Deck[] = []
// export const sideDecks: SideDeck[] = []
// export const pactDecks: PactDeck[] = []
// export const extraDecks: extraDeck[] = []
export const board: BoardObj[][] = []
export const hands: Hand[] = []
// graveyards
// pactzones
// timestreams
// voids (banish)

export function initScene(matchScene: Scenes.Match) {
  scene = matchScene
}

export function setTurnPlayer(playerId: number) {
  turnPlayer = playerId

  // show current hand ui
  hands[turnPlayer].ui.setVisible(true)
  for (let i = 0; i < players.length; ++i) {
    if (i != turnPlayer) hands[i].ui.setVisible(false)
  }
}

export function initPlayers() {
  players.push(new Player(0, 'John'))
  players.push(new Player(1, 'Sam'))

  // init all cards
  cards.push([
    CardDB.createCard(0, 'Battle Axe', players[0]),
    CardDB.createCard(1, 'Harry Lyons', players[0]),
    CardDB.createCard(2, 'Harry Lyons', players[0]),
    CardDB.createCard(3, 'Chinese rooster', players[0]),
    CardDB.createCard(4, 'Chinese rooster', players[0]),
    CardDB.createCard(5, 'Chinese rooster', players[0]),
  ])
  cards.push([
    CardDB.createCard(0, 'Patrick Fitzgerald', players[1]),
    CardDB.createCard(1, 'Chinese rooster', players[1]),
    CardDB.createCard(2, 'Chinese rooster', players[1]),
    CardDB.createCard(3, 'Chinese rooster', players[1]),
    CardDB.createCard(4, 'Chinese rooster', players[1]),
    CardDB.createCard(5, 'Harry Lyons', players[1]),
  ])

  // init hands
  hands.push(new Hand(players[0]))
  hands.push(new Hand(players[1]))
  for (let i = 1; i < cards[0].length; ++i) hands[0].add(i)
  for (let i = 1; i < cards[1].length; ++i) hands[1].add(i)

  // init turn player
  setTurnPlayer(0)
}

export function initBoard() {
  grid = new Grid.Grid(scene)

  // init board
  for (let y = 0; y < Grid.h; ++y) {
    board[y] = []
    for (let x = 0; x < Grid.w; ++x) {
      board[y][x] = null
    }
  }

  // init commander cards
  Board.createObj(1, 3, cards[0][0])
  Board.createObj(9, 3, cards[1][0])
}

/* TODO: make game phase
게임 시작 전:
-> 사이드보딩
-> 선/후 턴 플레이어 결정
-> 패 5장 드로우
-> 플레이어가 팩트카드 1장 원하는 것 선택 후 무조건 플레이

턴 구조: (all phase must be ended by a player input)
-> untap all cards
-> 드로우 페이즈
  -> 일반 드로우 1장
-> Stand-by Phase
  -> player can only activate quick effect
-> Main Phase
  -> You can Place 1 Pact to the Pact zone
  -> You can do Main Phase things (summon, activate, etc...)
  -> You can enter the End Phase
-> Battle Phase
  -> You can do Battle Phase things (move, attack, quick effect)
  -> You can't directly go to the end phase (unless there is an effect that blocks you from entering MP2)
-> Main Phase 2
  -> You cannot enter MP2 if you have not conducted your Battle Phase.
  -> You can do Main Phase things
  -> You can enter the End Phase
-> End Phase

- Attack
- Counter Attack
- health can be minus
*/
export enum Phase {
  Draw,
  StandBy,
  Main1,
  Battle,
  Main2,
  End,
}
export enum Step {
  None,
  Draw,
  Battle,
  Damage,
}

export let phase = Phase.Draw
export let step = Step.None

export const skips = new Set<Phase>()
export function skipPhase(value: Phase) {
  skips.add(value)
}

export function nextPhase() {
  // on phase end event
  GameEvent.emit(GameEvent.Events.Phase_End_Draw + phase)

  // get next phase
  for (;;) {
    phase = (phase + 1) % 6
    if (skips.has(phase)) {
      skips.delete(phase)
      continue
    }
    break
  }

  if (phase == Phase.Draw) {
    // change turn player
    setTurnPlayer((turnPlayer + 1) % 2)
  }

  // on phase start event
  GameEvent.emit(GameEvent.Events.Phase_Start_Draw + phase)
}
export function setStep(value: Step) {
  step = value
}

export class PhaseUi {
  static currentPlayerLabel: Label
  static currentPhaseLabel: Label
  static endPhaseButton: Buttons

  static init() {
    PhaseUi.currentPlayerLabel = scene.rexUI.add
      .label({
        width: 100,
        height: 40,
        background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 0, 0x212121),
        text: scene.add.text(0, 0, 'Turn player: ###', {
          fontSize: '18px',
        }),
        space: {
          left: 10,
          right: 10,
        },
      })
      .setAnchor({
        top: '1%',
        centerX: '50%',
      })
      .layout()
    PhaseUi.updatePlayerText()

    // show current phase
    PhaseUi.currentPhaseLabel = scene.rexUI.add
      .label({
        width: 100,
        height: 40,
        background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 0, 0x212121),
        text: scene.add.text(0, 0, 'Phase', {
          fontSize: '18px',
        }),
        space: {
          left: 10,
          right: 10,
        },
      })
      .setAnchor({
        top: '5%',
        centerX: '50%',
      })
      .layout()
    PhaseUi.updatePhaseText()

    // end phase
    PhaseUi.endPhaseButton = scene.rexUI.add
      .buttons({
        buttons: [PhaseUi.createEndPhaseButton()],
        click: {
          mode: 'pointerup',
        },
      })
      .setAnchor({
        right: '98%',
        centerY: '50%',
      })
      .layout()

    // NOTE: https://codepen.io/rexrainbow/pen/eYvxqLJ?editors=0010
    // buttons.setButtonEnable(false)
    PhaseUi.endPhaseButton
      .on('button.click', function() {
        nextPhase()
        PhaseUi.updatePlayerText()
        PhaseUi.updatePhaseText()
      })
      .on('button.over', function(button: any) {
        button.getElement('background').setStrokeStyle(2, 0xffffff)
      })
      .on('button.out', function(button: any) {
        button.getElement('background').setStrokeStyle()
      })
  }
  static createEndPhaseButton() {
    return scene.rexUI.add.label({
      width: 100,
      height: 40,
      background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 0, 0x212121),
      text: scene.add.text(0, 0, 'End Phase', {
        fontSize: '18px',
      }),
      space: {
        left: 10,
        right: 10,
      },
    })
  }
  static updatePlayerText() {
    PhaseUi.currentPlayerLabel.text = 'Turn player: ' + players[turnPlayer].name
    PhaseUi.currentPlayerLabel.layout()
  }
  static updatePhaseText() {
    PhaseUi.currentPhaseLabel.text = 'Phase: ' + Phase[phase]
    PhaseUi.currentPhaseLabel.layout()
  }
}
export const phaseUi = new PhaseUi()
