import { Card, CardData, CardTag } from './card'
import { Player } from '../player'

export function loadImages(scene: Phaser.Scene) {
  scene.load.image(
    'Battle Axe',
    'https://collectionapi.metmuseum.org/api/collection/v1/iiif/406565/779850/main-image'
  )
  scene.load.image(
    'Patrick Fitzgerald',
    'https://collectionapi.metmuseum.org/api/collection/v1/iiif/400463/772755/main-image'
  )
  scene.load.image(
    'Harry Lyons',
    'https://collectionapi.metmuseum.org/api/collection/v1/iiif/403833/1442413/main-image'
  )
  scene.load.image(
    'Chinese rooster',
    'https://collectionapi.metmuseum.org/api/collection/v1/iiif/203044/409734/main-image'
  )
}

export function createCard(handle: number, name: string, owner: Player): Card {
  let card: Card = null

  switch (name) {
    case 'Battle Axe':
      card = new Card(
        handle,
        owner,
        CardTag.Commander,
        new CardData(
          name,
          'Trade cards from the "Arms of All Nations" series (N3), issued in 1887 in a series of 50 cards to promote Allen & Ginter Brand Cigarettes.'
        ),
        [0, 40]
      )
      break

    case 'Patrick Fitzgerald':
      card = new Card(
        handle,
        owner,
        CardTag.Commander,
        new CardData(
          name,
          'The Goodwin Champions series of trading cards (N162), was issued by Goodwin & Company in 1888 to promote Old Judge and Gypsy Queen Cigarettes. The series of 50 cards depicts athletes in various disciplines. The Metropolitan Museum of Art owns all 50 cards from the series.'
        ),
        [0, 60]
      )
      break

    case 'Harry Lyons':
      card = new Card(
        handle,
        owner,
        CardTag.Creature,
        new CardData(
          name,
          'The "Old Judge" series of baseball cards (N172) was issued by Goodwin & Company from 1887 to 1890 to promote Old Judge Cigarettes.'
        ),
        [0, 50]
      )
      break

    case 'Chinese rooster':
      card = new Card(
        handle,
        owner,
        CardTag.Creature,
        new CardData(
          name,
          'Porcelain birds have their origins in the princely tradition of maintaining collections of living animals and birds in menageries and aviaries, which were viewed as microcosms of the universe, and emblems of royal power and enlightenment. These collections often included exotic birds such as parrots, admired for their rarity, as well as more familiar native species.'
        ),
        [0, -10]
      )
      break

    default:
      break
  }

  return card
}
