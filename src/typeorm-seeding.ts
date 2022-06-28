import 'reflect-metadata'
import { ObjectType, DataSource } from 'typeorm'

import { EntityFactory } from './entity-factory'
import { EntityFactoryDefinition, Factory, FactoryFunction, SeederConstructor, Seeder } from './types'
import { getNameOfEntity } from './utils/factory.util'
import { loadFiles, importFiles } from './utils/file.util'
import { ConfigureOption, configureConnection, getConnectionOptions, createConnection } from './connection'

// -------------------------------------------------------------------------
// Handy Exports
// -------------------------------------------------------------------------

export * from './importer'
export * from './connection'
export { Factory, Seeder } from './types'
export { times } from './helpers'

// -------------------------------------------------------------------------
// Types & Variables
// -------------------------------------------------------------------------
;(global as any).seeder = {
  entityFactories: new Map<string, EntityFactoryDefinition<any, any>>(),
}

// -------------------------------------------------------------------------
// Facade functions
// -------------------------------------------------------------------------

export const define = <Entity, Context>(entity: ObjectType<Entity>, factoryFn: FactoryFunction<Entity, Context>) => {
  ;(global as any).seeder.entityFactories.set(getNameOfEntity(entity), {
    entity,
    factory: factoryFn,
  })
}

export const factory: Factory = <Entity, Context>(entity: ObjectType<Entity>) => (context?: Context) => {
  const name = getNameOfEntity(entity)
  const entityFactoryObject = (global as any).seeder.entityFactories.get(name)
  return new EntityFactory<Entity, Context>(name, entity, entityFactoryObject.factory, context)
}

export const runSeeder = async (clazz: SeederConstructor): Promise<any> => {
  const seeder: Seeder = new clazz()
  const datasource = await createConnection()
  return seeder.run(factory, datasource)
}

// -------------------------------------------------------------------------
// Facade functions for testing
// -------------------------------------------------------------------------
export const useRefreshDatabase = async (options: ConfigureOption = {}): Promise<DataSource> => {
  configureConnection(options)
  const option = await getConnectionOptions()
  const ds = await createConnection(option)

  if (!ds.isInitialized) {
    await ds.initialize()
    await ds.dropDatabase()
    await ds.synchronize();
  } 

  return ds
}

export const tearDownDatabase = async (): Promise<void> => {
  const datasource = await createConnection()
  if (datasource.isInitialized) await datasource.destroy()
}

// dynamically import seeding script
export const useSeeding = async (options: ConfigureOption = {}): Promise<void> => {
  configureConnection(options)
  const option = await getConnectionOptions()
  const factoryFiles = loadFiles(option.factories)
  await importFiles(factoryFiles)
}
