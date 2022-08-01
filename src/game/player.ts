export class Player {
  index: number
  name: string
  states: {
    // TODO: make player states
    // - cannot draw card
    // - cannot normal summon
    // - ...
  }

  constructor(index: number, name: string) {
    this.index = index
    this.name = name
  }
}
