import { ReactElement, useState } from 'react'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { LockFill } from 'react-bootstrap-icons'
import { CircularProgress } from '@material-ui/core'

import { COLOR } from 'consts'

import { BlockChainType } from 'types/network'
import { RequestTxResultType, ValidateItemResultType } from 'types/send'
import useSend from 'hooks/useSend'

import { Button, Row } from 'components'

import SendStore from 'store/SendStore'
import SendProcessStore, { ProcessStatus } from 'store/SendProcessStore'
import FormErrorMessage from 'components/FormErrorMessage'
import useAuth from 'hooks/useAuth'
import { WalletEnum } from 'types/wallet'

import keplrService from 'services/keplrService'
import AuthStore, { initLoginUser } from 'store/AuthStore'

const NextOrApproveButton = ({
  feeValidationResult,
}: {
  feeValidationResult: ValidateItemResultType
}): ReactElement => {
  const setStatus = useSetRecoilState(SendProcessStore.sendProcessStatus)
  const asset = useRecoilValue(SendStore.asset)
  const setRelayLoginUser = useSetRecoilState(AuthStore.relayLoginUser)
  const { relayLogin } = useAuth()

  const fromBlockChain = useRecoilValue(SendStore.fromBlockChain)
  const toBlockChain = useRecoilValue(SendStore.toBlockChain)
  const validationResult = useRecoilValue(SendStore.validationResult)
  const amount = useRecoilValue(SendStore.amount)

  const [waitingForApprove, setWaitingForApprove] = useState(false)
  const [approveResult, setApproveResult] = useState<RequestTxResultType>()
  const { allowanceOfSelectedAsset, approveTxFromEtherBase } = useSend()

  const ableButton =
    fromBlockChain === BlockChainType.terra
      ? validationResult.isValid && feeValidationResult.isValid
      : validationResult.isValid

  const onClickApproveTxFromEtherBase = async (): Promise<void> => {
    setWaitingForApprove(true)
    setApproveResult(undefined)
    const res = await approveTxFromEtherBase()
    setApproveResult(res)
    setWaitingForApprove(false)
  }

  const onRelaySign = async (asset: any): Promise<void> => {
    if (keplrService.checkInstalled()) {
      const { address, signingCosmosClient } = await keplrService.connect(
        asset.network_name as BlockChainType
      )
      await relayLogin({
        user: {
          address,
          signer: signingCosmosClient,
          walletType: WalletEnum.Keplr,
        },
      })
    }
  }

  const onClickSendNextButton = async (asset: any): Promise<void> => {
    if (asset.network_name !== fromBlockChain && asset.network_name !== toBlockChain) {
      // relayLogout()
      onRelaySign(asset)
    } else {
      setRelayLoginUser((user) => {
        user.terraWalletConnect?.killSession()
        return initLoginUser
      })
    }
    setStatus(ProcessStatus.Confirm)
  }

  if (
    allowanceOfSelectedAsset.isNeedApprove &&
    allowanceOfSelectedAsset.allowance.isLessThan(amount)
  ) {
    return (
      <>
        <Button
          onClick={onClickApproveTxFromEtherBase}
          disabled={waitingForApprove}
        >
          {waitingForApprove ? (
            <CircularProgress size={20} style={{ color: COLOR.darkGray2 }} />
          ) : (
            <Row style={{ justifyContent: 'center' }}>
              <LockFill style={{ paddingRight: 5 }} /> Unlock token to send
            </Row>
          )}
        </Button>
        {false === approveResult?.success && (
          <FormErrorMessage
            errorMessage={approveResult.errorMessage}
            style={{ display: 'block', textAlign: 'center', marginTop: 10 }}
          />
        )}
      </>
    )
  }

  return (
    <Button onClick={(): Promise<void> => onClickSendNextButton(asset)} disabled={!ableButton}>
      Next
    </Button>
  )
}

export default NextOrApproveButton
