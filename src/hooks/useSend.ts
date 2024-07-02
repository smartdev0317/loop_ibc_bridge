import { useEffect } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import axios from 'axios'
import {
  MsgSend,
  Coins,
  MsgExecuteContract,
  Fee,
  LCDClient,
  Coin,
  CreateTxOptions,
  MsgTransfer,
} from '@terra-money/terra.js'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx.js'
import { getInjectiveSequence } from 'packages/injective'
import _ from 'lodash'
import BigNumber from 'bignumber.js'
import { isMobile } from 'react-device-detect'
import { useQuery } from 'react-query'
import { useDebouncedCallback } from 'use-debounce/lib'

import { UTIL, NETWORK } from 'consts'

import terraService from 'services/terraService'
import AuthStore from 'store/AuthStore'
import NetworkStore from 'store/NetworkStore'
import SendStore from 'store/SendStore'

import {
  BlockChainType,
  isIbcNetwork,
  terraIbcChannels,
  ibcChannels,
  IbcNetwork,
  ibcChainId,
  BridgeType,
} from 'types/network'
import { AssetNativeDenomEnum } from 'types/asset'
import { RequestTxResultType, EtherBaseReceiptResultType } from 'types/send'
import { WalletEnum } from 'types/wallet'

import useEtherBaseContract from './useEtherBaseContract'
import useNetwork from './useNetwork'
import QueryKeysEnum from 'types/queryKeys'
import { getDepositAddress as getAxelarAddress } from 'packages/axelar/getDepositAddress'
import useTns from 'packages/tns/useTns'

export type TerraSendFeeInfo = {
  gasPrices: Record<string, string>
  fee: Fee
  feeOfGas: BigNumber
}

type AllowanceOfSelectedAssetType =
  | {
    isNeedApprove: true
    allowance: BigNumber
  }
  | {
    isNeedApprove: false
  }

type UseSendType = {
  allowanceOfSelectedAsset: AllowanceOfSelectedAssetType
  initSendData: () => void
  submitRequestTx: () => Promise<RequestTxResultType>
  getTerraFeeList: () => Promise<
    {
      denom: AssetNativeDenomEnum
      fee?: Fee
    }[]
  >
  getTerraMsgs: () => Promise<MsgSend[] | MsgExecuteContract[] | MsgTransfer[]>
  waitForEtherBaseTransaction: (props: {
    hash: string
  }) => Promise<EtherBaseReceiptResultType | undefined>
  approveTxFromEtherBase: () => Promise<RequestTxResultType>
}

const useSend = (): UseSendType => {
  const loginUser = useRecoilValue(AuthStore.loginUser)
  const relayLoginUser = useRecoilValue(AuthStore.relayLoginUser)
  const terraExt = useRecoilValue(NetworkStore.terraExt)
  const terraLocal = useRecoilValue(NetworkStore.terraLocal)

  const [gasPricesFromServer, setGasPricesFromServer] = useRecoilState(
    SendStore.gasPrices
  )

  // Send Data
  const [asset, setAsset] = useRecoilState(SendStore.asset)
  const [toAddress, setToAddress] = useRecoilState(SendStore.toAddress)
  const [sendAmount, setSendAmount] = useRecoilState(SendStore.amount)
  const [memo, setMemo] = useRecoilState(SendStore.memo)
  const [toBlockChain, setToBlockChain] = useRecoilState(SendStore.toBlockChain)
  const fromBlockChain = useRecoilValue(SendStore.fromBlockChain)
  const relayBlockChain = useRecoilValue(SendStore.relayBlockChain)
  const bridgeUsed = useRecoilValue(SendStore.bridgeUsed)
  const feeDenom = useRecoilValue<AssetNativeDenomEnum>(SendStore.feeDenom)
  const [fee, setFee] = useRecoilState(SendStore.fee)
  const assetList = useRecoilValue(SendStore.loginUserAssetList)

  const { getEtherBaseContract } = useEtherBaseContract()

  const { fromTokenAddress, toTokenAddress } = useNetwork()
  const { getAddress } = useTns()

  const {
    data: allowanceOfSelectedAsset = {
      isNeedApprove: false,
    },
  } = useQuery<AllowanceOfSelectedAssetType>(
    [
      QueryKeysEnum.allowanceOfSelectedAsset,
      fromBlockChain,
      asset,
      fromTokenAddress,
    ],
    async (): Promise<AllowanceOfSelectedAssetType> => {
      if (
        NETWORK.isEtherBaseBlockChain(fromBlockChain) &&
        asset &&
        fromTokenAddress
      ) {
        const contract = getEtherBaseContract({ token: fromTokenAddress })

        if (contract && loginUser.provider) {
          if (bridgeUsed === BridgeType.wormhole) {
            // not supported on Terra2
          }
        }
      }

      return {
        isNeedApprove: false,
      }
    }
  )

  const getGasPricesFromServer = useDebouncedCallback(
    async (fcd): Promise<void> => {
      const { data } = await axios.get('/v1/txs/gas_prices', {
        baseURL: fcd,
      })
      setGasPricesFromServer(data)
    },
    300
  )

  useEffect(() => {
    getGasPricesFromServer.callback(terraLocal.fcd)
    return (): void => {
      getGasPricesFromServer.cancel()
    }
  }, [terraLocal.fcd])

  const initSendData = (): void => {
    setAsset(undefined)
    setToAddress('')
    setSendAmount('')
    setMemo('')
    setToBlockChain(BlockChainType.osmo)

    setFee(undefined)
  }

  const getTerraFeeList = async (): Promise<
    {
      denom: AssetNativeDenomEnum
      fee?: Fee
    }[]
  > => {
    if (terraExt) {
      let gas = 200000
      try {
        let feeDenoms = [AssetNativeDenomEnum.uluna]
        const ownedAssetList = assetList.filter(
          (x) => _.toNumber(x.balance) > 0
        )

        if (ownedAssetList.length > 0) {
          if (ownedAssetList.length === 1) {
            feeDenoms = [ownedAssetList[0].terraToken as AssetNativeDenomEnum]
          } else {
            const target = ownedAssetList.find(
              (x) => x.terraToken !== asset?.terraToken
            )
            if (target) {
              feeDenoms = [target.terraToken as AssetNativeDenomEnum]
            }
          }
        }

        const msgs = await getTerraMsgs(true)
        const lcd = new LCDClient({
          chainID: terraExt.chainID,
          URL: terraLocal.lcd,
          gasPrices: gasPricesFromServer,
        })
        // fee
        const unsignedTx = await lcd.tx.create(
          [{ address: loginUser.address }],
          {
            msgs,
            feeDenoms,
          }
        )

        gas = unsignedTx.auth_info.fee.gas_limit
      } catch {
        // gas is just default value
      }

      return _.map(AssetNativeDenomEnum, (denom) => {
        const amount = new BigNumber(gasPricesFromServer[denom])
          .multipliedBy(gas)
          .dp(0, BigNumber.ROUND_UP)
          .toString(10)
        const gasFee = new Coins({ [denom]: amount })
        const fee = new Fee(gas, gasFee)
        return {
          denom,
          fee,
        }
      })
    }
    return []
  }

  // get terra msgs
  const getTerraMsgs = async (
    isSimulation?: boolean
  ): Promise<MsgSend[] | MsgExecuteContract[] | MsgTransfer[]> => {
    if (asset) {
      switch (bridgeUsed) {
        case BridgeType.ibc:
          return [
            new MsgTransfer(
              'transfer',
              terraIbcChannels[toBlockChain as IbcNetwork],
              new Coin(asset.terraToken, sendAmount),
              loginUser.address,
              toAddress,
              undefined,
              (Date.now() + 120 * 1000) * 1e6
            ),
          ]

        case BridgeType.axelar:
          // in the fee simulation use the user address
          const axelarAddress = isSimulation
            ? loginUser.address
            : await getAxelarAddress(
              toAddress,
              fromBlockChain,
              toBlockChain,
              asset.terraToken as 'uusd' | 'uluna'
            )

          return [
            new MsgTransfer(
              'transfer',
              terraIbcChannels[BlockChainType.axelar],
              new Coin(asset.terraToken, sendAmount),
              loginUser.address,
              axelarAddress || '',
              undefined,
              (Date.now() + 300 * 1000) * 1e6
            ),
          ]
        case BridgeType.wormhole:
          // not supported on Terra2
          return []
        // terra -> terra
        case undefined:
          const recipient = (await getAddress(toAddress)) || toAddress
          return UTIL.isNativeDenom(asset.terraToken)
            ? [
              new MsgSend(loginUser.address, recipient, [
                new Coin(asset.terraToken, sendAmount),
              ]),
            ]
            : [
              new MsgExecuteContract(
                loginUser.address,
                asset.terraToken,
                { transfer: { recipient, amount: sendAmount } },
                new Coins([])
              ),
            ]
      }
    }
    return []
  }

  // sign Terra tx
  const submitRequestTxFromTerra = async (): Promise<RequestTxResultType> => {
    let errorMessage
    const memoOrToAddress =
      toBlockChain === BlockChainType.terra
        ? // only terra network can get user's memo
        memo
        : // if send to ether-base then memo must be to-address
        toAddress
    const msgs = await getTerraMsgs()

    const tx: CreateTxOptions = {
      gasPrices: [new Coin(feeDenom, gasPricesFromServer[feeDenom])],
      msgs,
      fee,
      memo: memoOrToAddress,
    }
    const connector = loginUser.terraWalletConnect
    if (connector) {
      const sendId = Date.now()
      const serializedTxOptions = {
        msgs: tx.msgs.map((msg) => msg.toJSON()),
        fee: tx.fee?.toJSON(),
        memo: tx.memo,
        gasPrices: tx.gasPrices?.toString(),
        gasAdjustment: tx.gasAdjustment?.toString(),
        feeDenoms: tx.feeDenoms,
      }

      if (isMobile) {
        const payload = btoa(
          JSON.stringify({
            id: sendId,
            handshakeTopic: connector.handshakeTopic,
            params: serializedTxOptions,
          })
        )
        window.location.href = `terrastation://walletconnect_confirm/?payload=${payload}`
      }
      try {
        const result = await connector.sendCustomRequest({
          id: sendId,
          method: 'post',
          params: [serializedTxOptions],
        })
        return {
          success: true,
          hash: result.txhash,
          hash1: '',
        }
      } catch (error) {
        const jsonMsg = UTIL.jsonTryParse<{
          id: number
          errorCode?: number
          message: string
          txHash?: string
          raw_message?: any
        }>(error.message)
        const errorMessage = jsonMsg?.message || _.toString(error)
        return {
          success: false,
          errorMessage,
        }
      }
    } else {
      const result = await terraService.post(tx)

      if (result.success && result.result) {
        return {
          success: true,
          hash: result.result.txhash,
          hash1: '',
        }
      }
      errorMessage =
        result.error?.code === 1 ? 'Denied by the user' : result.error?.message
    }

    return {
      success: false,
      errorMessage,
    }
  }

  // function for 'submitRequestTxFromEtherBase'
  const handleTxErrorFromEtherBase = (error: any): RequestTxResultType => {
    let errorMessage = _.toString(error)
    if (loginUser.walletType === WalletEnum.Binance) {
      errorMessage = _.toString(error.error)
    } else if (loginUser.walletType === WalletEnum.MetaMask) {
      errorMessage = error?.message
    }

    return {
      success: false,
      errorMessage,
    }
  }

  // increase allowance
  const approveTxFromEtherBase = async (): Promise<RequestTxResultType> => {
    // only for wormhole (not supported on Terra2)

    return {
      success: false,
    }
  }

  // Send tx from EVM chain to Terra
  const submitRequestTxFromEtherBase =
    async (): Promise<RequestTxResultType> => {
      const terraAddress = (await getAddress(toAddress)) || toAddress
      if (
        fromBlockChain !== BlockChainType.terra &&
        asset &&
        fromTokenAddress
      ) {
        const contract = getEtherBaseContract({ token: fromTokenAddress })

        if (contract && loginUser.provider) {
          const signer = loginUser.provider.getSigner()
          const withSigner = contract.connect(signer)
          try {
            switch (bridgeUsed) {
              // with axelar
              case BridgeType.axelar:
                const axelarAddress = await getAxelarAddress(
                  terraAddress,
                  fromBlockChain,
                  toBlockChain,
                  toTokenAddress as string
                )
                const result = await withSigner.transfer(
                  axelarAddress,
                  sendAmount
                )
                return { success: true, hash: result.hash, hash1: '' }

              // with wormhole
              case BridgeType.wormhole:
              // not supported on Terra2
            }
          } catch (error) {
            return handleTxErrorFromEtherBase(error)
          }
        }
      }

      return {
        success: false,
      }
    }

  const waitForEtherBaseTransaction = async ({
    hash,
  }: {
    hash: string
  }): Promise<EtherBaseReceiptResultType | undefined> => {
    if (fromBlockChain !== BlockChainType.terra && asset?.terraToken) {
      return loginUser.provider?.waitForTransaction(hash)
    }
  }

  const handleTxErrorFromIbc = (error: any): RequestTxResultType => {
    let errorMessage = _.toString(error)
    return {
      success: false,
      errorMessage,
    }
  }

  // IBC transfer with Keplr
  const submitRequestTxFromIbc = async (): Promise<RequestTxResultType> => {
    if (
      isIbcNetwork(fromBlockChain) &&
      asset &&
      fromTokenAddress &&
      toBlockChain !== fromBlockChain
    ) {
      if (loginUser.signer) {
        try {
          if (relayLoginUser.signer) {
            const relayerAddress = (await getAddress(relayLoginUser.address)) || relayLoginUser.address
            const receiverAddress = (await getAddress(toAddress)) || toAddress

            await window.keplr.enable(ibcChainId[fromBlockChain as IbcNetwork])
            await window.keplr.enable(ibcChainId[relayBlockChain as IbcNetwork])

            let denom = ''
            if (asset.name.toLowerCase() === fromBlockChain) {
              denom = fromTokenAddress
            } else {
              denom = asset.terraToken
            }

            const block1 = await loginUser.signer.getBlock()

            const transferMsg1 = {
              typeUrl: '/ibc.applications.transfer.v1.MsgTransfer',
              value: {
                sourcePort: 'transfer',
                sourceChannel: ibcChannels[fromBlockChain as IbcNetwork][relayBlockChain as IbcNetwork].sourceChannel,
                sender: loginUser.address,
                receiver: relayerAddress,
                token: { denom: denom, amount: sendAmount },
                timeoutHeight: 100,
                timeoutTimestamp: (Date.parse(block1.header.time) + 120 * 1000) * 1e6,
              },
            }

            let account
            if (fromBlockChain === BlockChainType.inj) {
              account = await getInjectiveSequence(loginUser.address)
            } else {
              account = await loginUser.signer.getSequence(loginUser.address)
            }

            const tx1 = await loginUser.signer.sign(
              loginUser.address,
              [transferMsg1],
              {
                amount: [],
                gas: '150000',
              },
              '', // memo
              {
                chainId: ibcChainId[fromBlockChain as IbcNetwork],
                accountNumber: account.accountNumber,
                sequence: account.sequence,
              }
            )

            const { code, transactionHash } = await loginUser.signer.broadcastTx(
              TxRaw.encode(tx1).finish()
            )

            let statusCode = code

            const transactionHash1 = transactionHash
            let transactionHash2 = ''
            console.log('transaction hash1', transactionHash1)

            if (code === 0) {
              let denom = ''
              if (asset.name.toLowerCase() === relayBlockChain) {
                denom = fromTokenAddress
              } else {
                denom = asset.terraToken
              }

              const block2 = await relayLoginUser.signer.getBlock()

              const transferMsg2 = {
                typeUrl: '/ibc.applications.transfer.v1.MsgTransfer',
                value: {
                  sourcePort: 'transfer',
                  sourceChannel: ibcChannels[relayBlockChain as IbcNetwork][toBlockChain as IbcNetwork].sourceChannel,
                  sender: relayLoginUser.address,
                  receiver: receiverAddress,
                  token: { denom: denom, amount: sendAmount },
                  timeoutHeight: 100,
                  timeoutTimestamp: (Date.parse(block2.header.time) + 240 * 1000) * 1e6,
                },
              }

              let account
              if (relayBlockChain === BlockChainType.inj) {
                account = await getInjectiveSequence(relayLoginUser.address)
              } else {
                account = await relayLoginUser.signer.getSequence(relayLoginUser.address)
              }

              const tx2 = await relayLoginUser.signer.sign(
                relayLoginUser.address,
                [transferMsg2],
                {
                  amount: [],
                  gas: '150000',
                },
                '', // memo
                {
                  chainId: ibcChainId[relayBlockChain as IbcNetwork],
                  accountNumber: account.accountNumber,
                  sequence: account.sequence,
                }
              )

              const { code, transactionHash } = await relayLoginUser.signer.broadcastTx(
                TxRaw.encode(tx2).finish()
              )

              transactionHash2 = transactionHash
              console.log('transaction hash2', transactionHash2)
              statusCode = code
            }
            return { success: statusCode === 0, hash: transactionHash1, hash1: transactionHash2 }
          } else {
            const receiverAddress = (await getAddress(toAddress)) || toAddress

            await window.keplr.enable(ibcChainId[fromBlockChain as IbcNetwork])

            console.log('asset', asset)

            console.log('before transaction making...')

            console.log(fromBlockChain)

            let denom = ''
            if (asset.name.toLowerCase() === fromBlockChain) {
              denom = fromTokenAddress
            } else {
              denom = asset.terraToken
            }

            const block = await loginUser.signer.getBlock()

            const transferMsg = {
              typeUrl: '/ibc.applications.transfer.v1.MsgTransfer',
              value: {
                sourcePort: 'transfer',
                sourceChannel: ibcChannels[fromBlockChain as IbcNetwork][toBlockChain as IbcNetwork].sourceChannel,
                sender: loginUser.address,
                receiver: receiverAddress,
                token: { denom: denom, amount: sendAmount },
                timeoutHeight: 100,
                timeoutTimestamp: (Date.parse(block.header.time) + 120 * 1000) * 1e6,
              },
            }

            let account
            if (fromBlockChain === BlockChainType.inj) {
              account = await getInjectiveSequence(loginUser.address)
            } else {
              account = await loginUser.signer.getSequence(loginUser.address)
            }

            const tx = await loginUser.signer.sign(
              loginUser.address,
              [transferMsg],
              {
                amount: [],
                gas: '150000',
              },
              '', // memo
              {
                chainId: ibcChainId[fromBlockChain as IbcNetwork],
                accountNumber: account.accountNumber,
                sequence: account.sequence,
              }
            )

            const { code, transactionHash } = await loginUser.signer.broadcastTx(
              TxRaw.encode(tx).finish()
            )
            return { success: code === 0, hash: transactionHash, hash1: '' }
          }

        } catch (error) {
          console.error(error)
          return handleTxErrorFromIbc(error)
        }
      }
    }
    return {
      success: false,
    }
  }

  // get tx based on the fromBlockChain
  const submitRequestTx = async (): Promise<RequestTxResultType> => {
    if (fromBlockChain === BlockChainType.terra) {
      return submitRequestTxFromTerra()
    }
    if (isIbcNetwork(fromBlockChain)) {
      return submitRequestTxFromIbc()
    }
    return submitRequestTxFromEtherBase()
  }

  return {
    allowanceOfSelectedAsset,
    initSendData,
    submitRequestTx,
    getTerraFeeList,
    getTerraMsgs,
    waitForEtherBaseTransaction,
    approveTxFromEtherBase,
  }
}

export default useSend
