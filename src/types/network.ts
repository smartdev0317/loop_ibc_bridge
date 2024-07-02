export enum BlockChainType {
  terra = 'terra',
  ethereum = 'ethereum',
  bsc = 'bsc',
  osmo = 'osmosis',
  scrt = 'secret',
  inj = 'injective',
  axelar = 'axelar',
  avalanche = 'avalanche',
  fantom = 'fantom',
  cosmos = 'cosmos',
  polygon = 'polygon',
  moonbeam = 'moonbeam',
  juno = 'juno',
  crescent = 'crescent',
}

export enum BridgeType {
  wormhole = 'wormhole',
  ibc = 'ibc',
  axelar = 'axelar',
}

export const availableBridges: Record<BlockChainType, BridgeType[]> = {
  [BlockChainType.osmo]: [BridgeType.ibc],
  [BlockChainType.scrt]: [BridgeType.ibc],
  [BlockChainType.inj]: [BridgeType.ibc],
  [BlockChainType.axelar]: [BridgeType.ibc],
  [BlockChainType.cosmos]: [BridgeType.ibc],
  [BlockChainType.juno]: [BridgeType.ibc],
  [BlockChainType.crescent]: [BridgeType.ibc],
  [BlockChainType.ethereum]: [BridgeType.axelar],

  // disabled
  [BlockChainType.bsc]: [],
  [BlockChainType.avalanche]: [BridgeType.wormhole, BridgeType.axelar],
  [BlockChainType.fantom]: [BridgeType.wormhole, BridgeType.axelar],
  [BlockChainType.polygon]: [BridgeType.wormhole, BridgeType.axelar],
  [BlockChainType.moonbeam]: [BridgeType.axelar],
  [BlockChainType.terra]: [],
}

export function getDefaultBridge(
  from: BlockChainType,
  to: BlockChainType
): BridgeType | undefined {
  // const chain = from === BlockChainType.terra ? to : from
  const chain = from
  return availableBridges[chain][0]
}

export type IbcNetwork =
  | BlockChainType.osmo
  | BlockChainType.scrt
  | BlockChainType.inj
  | BlockChainType.axelar
  | BlockChainType.cosmos
  | BlockChainType.juno
  | BlockChainType.crescent

export function isIbcNetwork(network: BlockChainType): boolean {
  return [
    BlockChainType.osmo,
    BlockChainType.scrt,
    BlockChainType.inj,
    BlockChainType.axelar,
    BlockChainType.cosmos,
    BlockChainType.juno,
    BlockChainType.crescent,
  ].includes(network)
}

// channels Terra -> IBC chain
export const terraIbcChannels: Record<IbcNetwork, string> = {
  [BlockChainType.osmo]: 'channel-1',
  [BlockChainType.scrt]: 'channel-3',
  [BlockChainType.inj]: 'channel-', // TODO: update inj channel
  [BlockChainType.axelar]: 'channel-6',
  [BlockChainType.cosmos]: 'channel-0',
  [BlockChainType.juno]: 'channel-2',
  [BlockChainType.crescent]: 'channel-7',
}

// channels IBC chain -> Terra
export const ibcChannels: Record<IbcNetwork, any> = {
  // [BlockChainType.osmo]: 'channel-251',
  // [BlockChainType.scrt]: 'channel-16',
  // [BlockChainType.inj]: 'channel-', // TODO: update inj channel
  // [BlockChainType.axelar]: 'channel-11',
  // [BlockChainType.cosmos]: 'channel-339',
  // [BlockChainType.juno]: 'channel-86',
  // [BlockChainType.crescent]: 'channel-8',

  //
  [BlockChainType.scrt]: {
    [BlockChainType.juno]: {
      sourceChannel: 'channel-8',
      destinationChannel: 'channel-48',
    },
    [BlockChainType.osmo]: {
      sourceChannel: 'channel-1',
      destinationChannel: 'channel-88',
    },
    [BlockChainType.inj]: {
      sourceChannel: 'channel-7',
      destinationChannel: 'channel-74',
    },
    [BlockChainType.cosmos]: {
      sourceChannel: 'channel-0',
      destinationChannel: 'channel-235',
    },
  },
  [BlockChainType.juno]: {
    [BlockChainType.scrt]: {
      sourceChannel: 'channel-48',
      destinationChannel: 'channel-8',
    },
    [BlockChainType.osmo]: {
      sourceChannel: 'channel-0',
      destinationChannel: 'channel-42',
    },
    [BlockChainType.inj]: {
      sourceChannel: 'channel-59',
      destinationChannel: 'channel-78',
    },
    [BlockChainType.axelar]: {
      sourceChannel: 'channel-71',
      destinationChannel: 'channel-4',
    },
    [BlockChainType.cosmos]: {
      sourceChannel: 'channel-1',
      destinationChannel: 'channel-207',
    },
    [BlockChainType.crescent]: {
      sourceChannel: 'channel-81',
      destinationChannel: 'channel-3',
    },
  },
  [BlockChainType.osmo]: {
    [BlockChainType.juno]: {
      sourceChannel: 'channel-42',
      destinationChannel: 'channel-0',
    },
    [BlockChainType.scrt]: {
      sourceChannel: 'channel-88',
      destinationChannel: 'channel-1',
    },
    [BlockChainType.inj]: {
      sourceChannel: 'channel-122',
      destinationChannel: 'channel-8',
    },
    [BlockChainType.axelar]: {
      sourceChannel: 'channel-208',
      destinationChannel: 'channel-3',
    },
    [BlockChainType.cosmos]: {
      sourceChannel: 'channel-0',
      destinationChannel: 'channel-141',
    },
  },
  [BlockChainType.inj]: {
    [BlockChainType.juno]: {
      sourceChannel: 'channel-42',
      destinationChannel: 'channel-0',
    },
    [BlockChainType.scrt]: {
      sourceChannel: 'channel-74',
      destinationChannel: 'channel-7',
    },
    [BlockChainType.osmo]: {
      sourceChannel: 'channel-8',
      destinationChannel: 'channel-122',
    },
    [BlockChainType.axelar]: {
      sourceChannel: 'channel-84',
      destinationChannel: 'channel-10',
    },
    [BlockChainType.cosmos]: {
      sourceChannel: 'channel-1',
      destinationChannel: 'channel-220',
    },
  },
  [BlockChainType.axelar]: {
    [BlockChainType.juno]: {
      sourceChannel: 'channel-4',
      destinationChannel: 'channel-71',
    },
    [BlockChainType.inj]: {
      sourceChannel: 'channel-10',
      destinationChannel: 'channel-84',
    },
    [BlockChainType.osmo]: {
      sourceChannel: 'channel-3',
      destinationChannel: 'channel-208',
    },
    [BlockChainType.cosmos]: {
      sourceChannel: 'channel-2',
      destinationChannel: 'channel-293',
    },
    [BlockChainType.crescent]: {
      sourceChannel: 'channel-7',
      destinationChannel: 'channel-4',
    }
  },
  [BlockChainType.cosmos]: {
    [BlockChainType.juno]: {
      sourceChannel: 'channel-207',
      destinationChannel: 'channel-1',
    },
    [BlockChainType.scrt]: {
      sourceChannel: 'channel-235',
      destinationChannel: 'channel-0',
    },
    [BlockChainType.inj]: {
      sourceChannel: 'channel-220',
      destinationChannel: 'channel-1',
    },
    [BlockChainType.axelar]: {
      sourceChannel: 'channel-293',
      destinationChannel: 'channel-2',
    },
    [BlockChainType.osmo]: {
      sourceChannel: 'channel-141',
      destinationChannel: 'channel-0',
    },
    [BlockChainType.crescent]: {
      sourceChannel: 'channel-141',
      destinationChannel: 'channel-0',
    }
  },
  [BlockChainType.crescent]: {
    [BlockChainType.juno]: {
      sourceChannel: 'channel-3',
      destinationChannel: 'channel-81',
    },
    [BlockChainType.axelar]: {
      sourceChannel: 'channel-4',
      destinationChannel: 'channel-7',
    },
    [BlockChainType.cosmos]: {
      sourceChannel: 'channel-1',
      destinationChannel: 'channel-326',
    },
  },
}

export const ibcPrefix: Record<IbcNetwork, string> = {
  [BlockChainType.osmo]: 'osmo1',
  [BlockChainType.scrt]: 'secret1',
  [BlockChainType.inj]: 'inj1',
  [BlockChainType.axelar]: 'axelar1',
  [BlockChainType.cosmos]: 'cosmos1',
  [BlockChainType.juno]: 'juno1',
  [BlockChainType.crescent]: 'cre1',
}

export const ibcChainId: Record<IbcNetwork, string> = {
  [BlockChainType.osmo]: 'osmosis-1',
  [BlockChainType.scrt]: 'secret-4',
  [BlockChainType.inj]: 'injective-1',
  [BlockChainType.axelar]: 'axelar-dojo-1',
  [BlockChainType.cosmos]: 'cosmoshub-4',
  [BlockChainType.juno]: 'juno-1',
  [BlockChainType.crescent]: 'crescent-1',
}

export const ibcRpc: Record<IbcNetwork, string> = {
  [BlockChainType.osmo]: 'https://rpc-osmosis.blockapsis.com/',
  [BlockChainType.scrt]: 'https://lcd-secret.scrtlabs.com/rpc/',
  [BlockChainType.inj]: 'https://tm.injective.network/',
  [BlockChainType.axelar]: 'https://axelar-rpc.quickapi.com/',
  [BlockChainType.cosmos]: 'https://rpc-cosmoshub.blockapsis.com/',
  [BlockChainType.juno]: 'https://rpc.juno.omniflix.co/',
  [BlockChainType.crescent]: 'https://mainnet.crescent.network:26657/',
}

export interface LocalTerraNetwork {
  name: TerraNetworkEnum
  chainID: string
  mantle: string
  lcd: string
  fcd: string
  walletconnectID: number
}

export enum TerraNetworkEnum {
  mainnet = 'mainnet',
  testnet = 'testnet',
}

export enum TerraAssetsPathEnum {
  station_maintenamce = '/station/maintenance.json',
  chains = '/chains.json',

  cw20_tokens = '/cw20/tokens.json',
  ibc_tokens = '/ibc/tokens.json',
}
