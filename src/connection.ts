import {
  ConnectionOptionsReader,
  DataSource,
  DataSourceOptions,
} from 'typeorm'
import { printError } from './utils/log.util'

interface SeedingOptions {
  factories: string[]
  seeds: string[]
}

export declare type ConnectionOptions = DataSourceOptions & SeedingOptions

export interface ConfigureOption {
  root?: string
  configName?: string
  connection?: string
}

const KEY = 'TypeORM_Seeding_Connection'

const defaultConfigureOption: ConfigureOption = {
  root: process.cwd(),
  configName: '',
  connection: '',
}

if ((global as any)[KEY] === undefined) {
  ;(global as any)[KEY] = {
    configureOption: defaultConfigureOption,
    ormConfig: undefined,
    datasource: undefined,
    overrideConnectionOptions: {},
  }
}

export const configureConnection = (option: ConfigureOption = {}) => {
  ;(global as any)[KEY].configureOption = {
    ...defaultConfigureOption,
    ...option,
  }
}

export const setConnectionOptions = (options: Partial<DataSourceOptions>): void => {
  ;(global as any)[KEY].overrideConnectionOptions = options
}

export const getConnectionOptions = async (): Promise<ConnectionOptions> => {
  const ormConfig = (global as any)[KEY].ormConfig
  const overrideConnectionOptions = (global as any)[KEY].overrideConnectionOptions
  if (ormConfig === undefined) {
    const configureOption = (global as any)[KEY].configureOption
    const connection = configureOption.connection
    const reader = new ConnectionOptionsReader({
      root: configureOption.root,
      configName: configureOption.configName,
    })
    let options = (await reader.all()) as any[]
    if (connection !== undefined && connection !== '') {
      const filteredOptions = options.filter((o) => o.name === connection)
      if (filteredOptions.length === 1) {
        options = filteredOptions
      }
    }
    if (options.length > 1) {
      const filteredOptions = options.filter((o) => o.name === 'default')
      if (filteredOptions.length === 1) {
        options = filteredOptions
      }
    }
    if (options.length === 1) {
      const option = options[0]
      if (!option.factories) {
        option.factories = [process.env.TYPEORM_SEEDING_FACTORIES || 'src/database/factories/**/*{.ts,.js}']
      }
      if (!option.seeds) {
        option.seeds = [process.env.TYPEORM_SEEDING_SEEDS || 'src/database/seeds/**/*{.ts,.js}']
      }
      ;(global as any)[KEY].ormConfig = {
        ...option,
        ...overrideConnectionOptions,
      }
      return (global as any)[KEY].ormConfig
    }
    printError('There are multiple connections please provide a connection name')
  }
  return ormConfig
}

export const createConnection = async (option?: DataSourceOptions): Promise<DataSource> => {
  let dataSource = (global as any)[KEY].dataSource
  let ormConfig = (global as any)[KEY].ormConfig

  if (option !== undefined) {
    ormConfig = option
  }

  if (dataSource === undefined) {
      dataSource = new DataSource(ormConfig)
      await dataSource.initialize()
    ;(global as any)[KEY].dataSource = dataSource
  }

  return dataSource
}
