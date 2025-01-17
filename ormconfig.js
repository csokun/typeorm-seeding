module.exports = [
    {
        name: 'default',
        type: 'sqlite',
        database: 'test.db',
        synchronize: true,
        entities: ['sample/entities/**/*{.ts,.js}'],
        factories: ['sample/factories/**/*{.ts,.js}'],
        seeds: ['sample/seeds/**/*{.ts,.js}'],
    },
    {
        name: 'memory',
        type: 'sqlite',
        database: ':memory:',
        synchronize: true,
        entities: ['sample/entities/**/*{.ts,.js}'],
        factories: ['sample/factories/**/*{.ts,.js}'],
        seeds: ['sample/seeds/**/*{.ts,.js}'],
    }
]
