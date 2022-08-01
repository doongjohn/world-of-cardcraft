import * as GameMatch from '../match'
import { BoardObj, Card } from '../cards/card'

export class Board {
  static at(x: number, y: number) {
    return GameMatch.board[y][x]
  }
  static createObj(x: number, y: number, card: Card) {
    GameMatch.board[y][x] = new BoardObj(GameMatch.scene, card)
    const [worldX, worldY] = GameMatch.grid.gridToWorldPos(x, y)
    GameMatch.board[y][x].setPosition(worldX, worldY)
  }
  static destroyObj(x: number, y: number) {
    GameMatch.board[y][x].destroy()
    GameMatch.board[y][x] = null
  }
  static moveObj(x: number, y: number, newX: number, newY: number) {
    const boardObj1 = GameMatch.board[y][x]
    const boardObj2 = GameMatch.board[newY][newX]
    GameMatch.board[y][x] = boardObj2
    GameMatch.board[newY][newX] = boardObj1
    {
      const [worldX, worldY] = GameMatch.grid.gridToWorldPos(x, y)
      GameMatch.board[y][x].setPosition(worldX, worldY)
    }
    {
      const [worldX, worldY] = GameMatch.grid.gridToWorldPos(x, y)
      GameMatch.board[newY][newX].setPosition(worldX, worldY)
    }
  }
}
