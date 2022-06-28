import {
  useSeeding,
  useRefreshDatabase,
  tearDownDatabase,
  factory,
  setConnectionOptions,
  runSeeder,
} from '../../src/typeorm-seeding'
import { User } from '../entities/User.entity'
import { DataSource } from 'typeorm'
import { Pet } from '../entities/Pet.entity'
import CreatePets from '../seeds/create-pets.seed'
import CreateUsers from '../seeds/create-users.seed'

describe('Sample Integration Test', () => {
  let datasource: DataSource
  beforeEach(async () => {
    setConnectionOptions({
      type: 'sqlite',
      database: ':memory:',
      entities: ['sample/entities/**/*{.ts,.js}'],
    })
    datasource = await useRefreshDatabase()
    await useSeeding()
  })

  afterEach(async () => {
    await tearDownDatabase()
  })

  test('Should be able to seed Pets', async () => {
    await runSeeder(CreatePets)
    const pets = await datasource.getRepository(Pet).find();
    expect(pets.length).toEqual(1)
  })

  test('Should be able to seed Users', async () => {
    await runSeeder(CreateUsers)
    const users = await datasource.getRepository(User).find();
    expect(users.length).toEqual(10)
  })

  test('Should create a user with the entity factory', async () => {
    const createdUser = await factory(User)().create()
    const user = await datasource.getRepository(User).findOneBy({ id: createdUser.id })
    expect(createdUser.id).toBe(user.id)
  })
})
