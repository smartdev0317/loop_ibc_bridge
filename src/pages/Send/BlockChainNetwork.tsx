import { ReactElement } from 'react'
import styled from 'styled-components'
import { useRecoilState } from 'recoil'

import { NETWORK } from 'consts'

import { BlockChainType, getDefaultBridge } from 'types/network'

import useAuth from 'hooks/useAuth'

import SendStore from 'store/SendStore'

import SelectBlockChain from '../../components/SelectBlockChain'
// import SelectBridge from 'components/SelectBridge'
import useUpdateBridgeType from 'hooks/useUpdateBridgeType'

const StyledNetworkBox = styled.div`
  // display: flex;
  // padding: 0 40px;

  @media (max-width: 575px) {
    padding: 0;
  }
`

// const BackgroundImg = styled.div`
//   display: flex;
//   align-items: center;
//   justify-content: space-between;
//   width: 100%;

//   background-repeat: no-repeat;
//   background-size: 40% 60%;
//   background-position: 50% 50%;
// `

const BlockChainNetwork = (): ReactElement => {
  const { logout } = useAuth()
  const [toBlockChain, setToBlockChain] = useRecoilState(SendStore.toBlockChain)

  const [fromBlockChain, setFromBlockChain] = useRecoilState(
    SendStore.fromBlockChain
  )
  const [bridgeUsed, setBridgeUsed] = useRecoilState(SendStore.bridgeUsed)
  useUpdateBridgeType()
  const { setBlockchainStorage, getLoginStorage } = useAuth()

  const { lastFromBlockChain, lastToBlockChain } = getLoginStorage()
  setFromBlockChain(lastFromBlockChain as BlockChainType)
  setToBlockChain(lastToBlockChain as BlockChainType)

  if (bridgeUsed) {

  }

  return (
    <StyledNetworkBox>
        <SelectBlockChain
          {...{
            blockChain: fromBlockChain,
            setBlockChain: (value): void => {
              logout()
              setFromBlockChain(value)
              // setToBlockChain(BlockChainType.osmo)
              const toChain = value === BlockChainType.osmo ? BlockChainType.juno : BlockChainType.osmo
              setToBlockChain(toChain)
              setBridgeUsed(getDefaultBridge(value, toChain))
              setBlockchainStorage({
                fromBlockChain: value,
                toBlockChain: toChain,
                bridgeUsed: getDefaultBridge(value, toChain),
              })
            },
            optionList: [
              // {
              //   label: NETWORK.blockChainName[BlockChainType.terra],
              //   value: BlockChainType.terra,
              //   isDisabled: fromBlockChain === BlockChainType.terra,
              // },
              // {
              //   label: NETWORK.blockChainName[BlockChainType.ethereum],
              //   value: BlockChainType.ethereum,
              //   isDisabled: fromBlockChain === BlockChainType.ethereum,
              // },
              {
                label: NETWORK.blockChainName[BlockChainType.osmo],
                value: BlockChainType.osmo,
                isDisabled: fromBlockChain === BlockChainType.osmo,
              },
              // {
              //   label: NETWORK.blockChainName[BlockChainType.scrt],
              //   value: BlockChainType.scrt,
              //   isDisabled: fromBlockChain === BlockChainType.scrt,
              // },
              // {
              //   label: NETWORK.blockChainName[BlockChainType.cosmos],
              //   value: BlockChainType.cosmos,
              //   isDisabled: fromBlockChain === BlockChainType.cosmos,
              // },
              {
                label: NETWORK.blockChainName[BlockChainType.juno],
                value: BlockChainType.juno,
                isDisabled: fromBlockChain === BlockChainType.juno,
              },
              // {
              //   label: NETWORK.blockChainName[BlockChainType.crescent],
              //   value: BlockChainType.crescent,
              //   isDisabled: fromBlockChain === BlockChainType.crescent,
              // },
            ],
            label: 'FROM',
          }}
        />
        {/* <div style={{ height: '100%', display: 'flex', alignItems: 'start' }}>
          <SelectBridge />
        </div> */}
        <SelectBlockChain
          {...{
            blockChain: toBlockChain,
            setBlockChain: (b): void => {
              setToBlockChain(b)
              logout()
              // if (fromBlockChain !== BlockChainType.terra) {
              //   setFromBlockChain(BlockChainType.terra)
              //   logout()
              // }
              const fromChain = b === BlockChainType.osmo ? BlockChainType.juno : BlockChainType.osmo
              setToBlockChain(fromChain)
              setBridgeUsed(getDefaultBridge(fromChain, b))
              setBlockchainStorage({
                fromBlockChain: fromChain,
                toBlockChain: b,
                bridgeUsed: getDefaultBridge(fromChain, b),
              })
            },
            optionList: [
              // {
              //   label: NETWORK.blockChainName[BlockChainType.terra],
              //   value: BlockChainType.terra,
              //   isDisabled: toBlockChain === BlockChainType.terra,
              // },
              // {
              //   label: NETWORK.blockChainName[BlockChainType.ethereum],
              //   value: BlockChainType.ethereum,
              //   isDisabled: toBlockChain === BlockChainType.ethereum,
              // },
              {
                label: NETWORK.blockChainName[BlockChainType.osmo],
                value: BlockChainType.osmo,
                isDisabled: toBlockChain === BlockChainType.osmo,
              },
              // {
              //   label: NETWORK.blockChainName[BlockChainType.scrt],
              //   value: BlockChainType.scrt,
              //   isDisabled: toBlockChain === BlockChainType.scrt,
              // },
              // {
              //   label: NETWORK.blockChainName[BlockChainType.cosmos],
              //   value: BlockChainType.cosmos,
              //   isDisabled: toBlockChain === BlockChainType.cosmos,
              // },
              {
                label: NETWORK.blockChainName[BlockChainType.juno],
                value: BlockChainType.juno,
                isDisabled: toBlockChain === BlockChainType.juno,
              },
              // {
              //   label: NETWORK.blockChainName[BlockChainType.crescent],
              //   value: BlockChainType.crescent,
              //   isDisabled: toBlockChain === BlockChainType.crescent,
              // },
            ],
            label: 'TO',
          }}
        />
    </StyledNetworkBox>
  )
}

export default BlockChainNetwork
