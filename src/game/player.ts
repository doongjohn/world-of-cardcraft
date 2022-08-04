export class Player {
  id: number
  name: string
  states: {
    // TODO: make player states
    // - cannot draw card
    // - cannot normal summon
    // - ...
  }

  constructor(id: number, name: string) {
    this.id = id
    this.name = name
  }
}
