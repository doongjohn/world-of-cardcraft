import * as Scenes from './scenes/match'
import * as CardDB from './cards/card_db'
import * as Grid from './match/grid'
import { Player } from './player'
import { Board } from './match/board'
import { BoardObj, Card } from './cards/card'
import { Hand } from './match/hand'

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

// TODO: make game phase
// 게임 시작 전:
// -> 사이드보딩
// -> 선/후 턴 플레이어 결정
// -> 패 5장 드로우
// -> 플레이어가 팩트카드 1장 원하는 것 선택 후 무조건 플레이

// 턴 구조: (all phase must be ended by a player input)
// -> untap all cards
// -> 드로우 페이즈
//   -> 일반 드로우 1장
// -> Stand-by Phase
//   -> player can only activate quick effect
// -> Main Phase
//   -> You can Place 1 Pact to the Pact zone
//   -> You can do Main Phase things (summon, activate, etc...)
//   -> You can enter the End Phase
// -> Battle Phase
//   -> You can do Battle Phase things (move, attack, quick effect)
//   -> You can't directly go to the end phase (unless there is an effect that blocks you from entering MP2)
// -> Main Phase 2
//   -> You cannot enter MP2 if you have not conducted your Battle Phase.
//   -> You can do Main Phase things
//   -> You can enter the End Phase
// -> End Phase
//
// - Attack
// - Counter Attack
// - health can be minus

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

export function initBoard(scene: Phaser.Scene) {
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
