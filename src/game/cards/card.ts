import { Player } from '../player'

export class Effect {
  // effect type
  //   - continuous
  //   - lingering
  //   - fire and forget
  // activation timing
  //   - triggered
  //   - activated
  //   - quick
  // effect capabilities
  //   - does heal permanent
  //   - does increase attack
  //   - does draw
  //   - does search
  //   - ...
  // activation condition
  // effect function
}

export type CardIndex = number

export enum CardTag {
  Commander,
  Creature,
  Structure,
  ContinuousSpell,
  NormalSpell,
  QuiclSpell,
  ArtifactSpell,
  ContinuousRune,
  NormalRune,
}

export enum CardLocation {
  Deck,
  Hand,
  Board,
}

export class CardData {
  name: string
  desc: string
  controller: Player

  // - permanent
  //   - structure
  //   - creature
  // - spell
  //   - continuous spell
  //   - normal spell
  //   - quick spell
  //   - artifact spell
  // - rune
  //   - continuous rune
  //   - normal rune
  tag: Set<CardTag> = new Set()

  attack: number
  health: number
  manaCost: number

  // if multiple effect can be activated,
  // user chooses the order of execution (ui)
  effects: Effect[] = []

  constructor(name: string, desc: string, attack?: number, health?: number, manaCost?: number) {
    this.name = name
    this.desc = desc
    this.attack = attack
    this.health = health
    this.manaCost = manaCost
  }
}

export class Card {
  index: number
  owner: Player
  tag: CardTag
  data: {
    default: CardData
    current: CardData
  }
  boardObjImageOffset: [x: number, y: number]

  constructor(index: number, owner: Player, tag: CardTag, cardData: CardData, boardObjImageOffset: [x: number, y: number]) {
    this.index = index
    this.owner = owner
    this.data = { default: structuredClone(cardData), current: structuredClone(cardData) }
    this.data.default.controller = owner
    this.data.current.controller = owner
    this.data.default.tag.add(tag)
    this.data.current.tag.add(tag)
    Object.freeze(this.data.default)
    this.boardObjImageOffset = boardObjImageOffset
  }
}

export class CardObj {
  card: Card
  static size = {
    x: 140,
    y: 200,
  }
  static maskSize = {
    x: this.size.x - 10,
    y: this.size.y - 10,
  }
  container: Phaser.GameObjects.Container
  maskShape: Phaser.GameObjects.Graphics
  text: Phaser.GameObjects.Text
  tween: Phaser.Tweens.Tween

  constructor(scene: Phaser.Scene, card: Card) {
    this.card = card

    const background = scene.add.rectangle(0, 0, CardObj.size.x, CardObj.size.y, 0xffffff)
    const image = scene.add.image(0, 20, card.data.current.name)
    image.setScale(0.24)

    this.maskShape = scene.make.graphics({})
    this.maskShape.fillStyle(0xffffff)
    this.maskShape.beginPath()
    this.maskShape.fillRect(
      CardObj.maskSize.x / 2,
      CardObj.maskSize.y / 2 + 20,
      CardObj.maskSize.x,
      CardObj.maskSize.y - 20
    )
    this.maskShape.closePath()
    this.maskShape.setPosition(-CardObj.maskSize.x, -CardObj.maskSize.y)

    // create and set image mask
    const mask = this.maskShape.createGeometryMask()
    image.setMask(mask)

    this.text = scene.add.text(
      -CardObj.size.x / 2 + 4,
      -CardObj.size.y / 2 + 2,
      card.data.current.name,
      {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#000000',
        align: 'left',
      }
    )

    // add objects to the container
    this.container = scene.add.container(0, 0)
    this.container.add([background, image, this.text])
  }

  destroy() {
    this.container.destroy()
    this.maskShape.destroy()
  }

  get x(): number {
    return this.container.x
  }
  set x(value: number) {
    this.container.x = value
    this.maskShape.x = value - CardObj.maskSize.x
  }

  get y(): number {
    return this.container.y
  }
  set y(value: number) {
    this.container.y = value
    this.maskShape.y = value - CardObj.maskSize.y
  }

  setPosition(x: number, y: number) {
    this.container.setPosition(x, y)
    this.maskShape.setPosition(x - CardObj.maskSize.x, y - CardObj.maskSize.y)
  }
}

export class BoardObj {
  card: Card
  static size = {
    x: 76,
    y: 76,
  }
  static maskSize = {
    x: this.size.x - 6,
    y: this.size.y - 6,
  }
  container: Phaser.GameObjects.Container
  maskShape: Phaser.GameObjects.Graphics

  constructor(scene: Phaser.Scene, card: Card) {
    this.card = card
    const background = scene.add.rectangle(0, 0, BoardObj.size.x, BoardObj.size.y, 0xffffff)
    const [offsetX, offsetY] = this.card.boardObjImageOffset;
    const image = scene.add.image(offsetX, offsetY, card.data.current.name)
    image.setScale(0.18)

    this.maskShape = scene.make.graphics({})
    this.maskShape.fillStyle(0xffffff)
    this.maskShape.beginPath()
    this.maskShape.fillRect(
      BoardObj.maskSize.x / 2,
      BoardObj.maskSize.y / 2,
      BoardObj.maskSize.x,
      BoardObj.maskSize.y
    )
    this.maskShape.closePath()
    this.maskShape.setPosition(-BoardObj.maskSize.x, -BoardObj.maskSize.y)

    // create and set image mask
    const mask = this.maskShape.createGeometryMask()
    image.setMask(mask)

    // add objects to the container
    this.container = scene.add.container(0, 0)
    this.container.add([background, image])

    this.updateVisual()
  }

  destroy() {
    this.container.destroy()
    this.maskShape.destroy()
  }

  get x(): number {
    return this.container.x
  }
  set x(value: number) {
    this.container.x = value
    this.maskShape.x = value - BoardObj.maskSize.x
  }

  get y(): number {
    return this.container.y
  }
  set y(value: number) {
    this.container.y = value
    this.maskShape.y = value - BoardObj.maskSize.y
  }

  setPosition(x: number, y: number) {
    this.container.setPosition(x, y)
    this.maskShape.setPosition(x - BoardObj.maskSize.x, y - BoardObj.maskSize.y)
  }

  updateVisual() {
    const background = this.container.getAt(0) as Phaser.GameObjects.Rectangle
    if (this.card.owner.index == 0) {
      background.setFillStyle(0x323ea8)
    } else {
      background.setFillStyle(0xcc4e3d)
    }
  }
}
