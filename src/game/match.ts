import * as CardDB from './cards/card_db'
import { BoardObj, Card } from './cards/card'
import { Board } from './match/board'
import { Player } from './player'
import { Hand } from './match/hand'
import * as Grid from './match/grid'
import * as Scenes from './scenes/match'

export let scene: Scenes.Match
export let turnPlayer = 0
export let grid: Grid.Grid
export const players: Player[] = []
export const board: BoardObj[][] = []
export const cards: Card[][] = []
export const hands: Hand[] = []
export const limbo: Card[] = []
// decks
// side decks
// graveyards
// timestreams
// banishs

export const Events = {
  handCardClick: new Phaser.Events.EventEmitter(),
  // other events...
}

export function initScene(matchScene: Scenes.Match) {
  scene = matchScene
}

export function setTurnPlayer(playerIndex: number) {
  turnPlayer = playerIndex

  // show current hand ui
  hands[turnPlayer].ui.setVisible(true)
  for (let i = 0; i < players.length; ++i) {
    if (i != turnPlayer) hands[i].ui.setVisible(false)
  }
}

// TODO: make game phase
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
  ])
  cards.push([
    CardDB.createCard(0, 'Patrick Fitzgerald', players[1]),
    CardDB.createCard(1, 'Chinese rooster', players[1]),
    CardDB.createCard(2, 'Chinese rooster', players[1]),
    CardDB.createCard(3, 'Chinese rooster', players[1]),
    CardDB.createCard(4, 'Chinese rooster', players[1]),
  ])

  // init hands
  hands.push(new Hand(players[0]))
  for (let i = 1; i < cards[0].length; ++i) hands[0].add(i)
  hands.push(new Hand(players[1]))
  for (let i = 1; i < cards[1].length; ++i) hands[1].add(i)

  // init turn player
  setTurnPlayer(0)
}

export function initBoard(scene: Phaser.Scene) {
  grid = new Grid.Grid(scene)

  for (let y = 0; y < Grid.h; ++y) {
    board[y] = []
    for (let x = 0; x < Grid.w; ++x) {
      board[y][x] = null
    }
  }

  // TODO: init commander card
  Board.createObj(1, 3, cards[0][0])
  Board.createObj(9, 3, cards[1][0])
}
