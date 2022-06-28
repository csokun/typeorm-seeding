import {
  useSeeding,
  useRefreshDatabase,
  tearDownDatabase,
  factory,
  setConnectionOptions,
} from '../../src/typeorm-seeding'
import { User } from '../entities/User.entity'
import { DataSource } from 'typeorm'

describe('Sample Integration Test', () => {
  let datasource: DataSource
  beforeAll(async () => {
    setConnectionOptions({
      type: 'sqlite',
      database: ':memory:',
      entities: ['sample/entities/**/*{.ts,.js}'],
    })
    datasource = await useRefreshDatabase()
    await useSeeding()
  })

  afterAll(async () => {
    await tearDownDatabase()
  })

  test('Should create a user with the entity factory', async () => {
    const createdUser = await factory(User)().create()
    const user = await datasource.getRepository(User).findOneBy({ id: createdUser.id })
    expect(createdUser.id).toBe(user.id)
  })
})
