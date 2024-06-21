import { createContext, useContext } from 'react'

export interface Env {
  name: string
  configs: Map<Provided<any, any>, any>
  values: Map<Provided<any, any>, any>
}

interface ProvidedConfig<T, C> {
  provided: Provided<T, C>
  config: C
}

export type Provided<T, C> = {
  name: string
  create: (env: Env, c: C) => T
  defaultConfig: C
}

export function createEnv(
  name: string,
  configs: Array<ProvidedConfig<any, any>>,
): Env {
  return {
    name,
    configs: new Map(configs.map((config) => [config.provided, config.config])),
    values: new Map(),
  }
}

export const ProviderEnvContext = createContext<Env>(createEnv('root', []))

export function createProvided<T, C>(
  name: string,
  create: (env: Env, c: C) => T,
  defaultConfig: C,
): Provided<T, C> {
  return {
    name,
    create,
    defaultConfig,
  }
}

export function useProvided<T>(provided: Provided<T, any>): T {
  const env = useContext(ProviderEnvContext)
  let value = env.values.get(provided)
  if (!value) {
    let config = env.configs.get(provided)
    if (!config) {
      config = provided.defaultConfig
      env.configs.set(provided, config)
    }
    value = provided.create(env, config)
    env.values.set(provided, value)
  }
  return value
}
