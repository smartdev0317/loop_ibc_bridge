import React, { ReactElement, useEffect, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { useRecoilValue } from 'recoil'
import ClickAwayListener from 'react-click-away-listener'

import { COLOR, UTIL, STYLE } from 'consts'

import { Container, Text, View, Row } from 'components'

import useAuth from 'hooks/useAuth'
import useSelectWallet from 'hooks/useSelectWallet'

import AuthStore from 'store/AuthStore'

import bridgeLogo from 'images/log-loop.png'
import WalletLogo from 'components/WalletLogo'
import useTns from 'packages/tns/useTns'

const StyledContainer = styled(Container)`
  position: relative;
`
const StyledNavContainer = styled(Container)`
  max-width: 640px;
`

const StyledNav = styled(View)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-top: 47px;
  padding-bottom: 19px;
  @media ${STYLE.media.mobile} {
    padding: 20px 24px;
  }
`

const StyledLogo = styled(Text)`
  font-size: 0;
  img {
    width: 75px;
    height: auto;
  }
  @media ${STYLE.media.mobile} {
    img {
      width: 75px;
      height: auto;
    }
  }
`

const StyledAddress = styled(Text)`
  font-size: 12px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: -0.19px;
`

const StyledConnectWallet = styled(View)`
  display: flex;
  justify-content: center;
  align-items: center;
  text-transform: uppercase;
  background-color: #bf20ab;
  border-radius: 6px;
  color: #1b1b1b;
  font-size: 13px;
  font-weight: 600;
  height: 35px;
  padding: 0 10px;
  border: none;
  cursor: pointer;
  :hover {
    background-color: #c83e93;
    text-decoration: none;
  }
`
const StyledLoginUserInfoBox = styled(Row)`
  align-items: center;
  border-radius: ${STYLE.css.borderRadius};
  // border: solid 1px ${COLOR.terraSky};
  background: ${COLOR.black};
  font-size: 12px;
  padding: 7px 15px;
  cursor: pointer;
  :hover {
    // opacity: 0.8;
    background: ${COLOR.primary};
  }
`

const StyledDropdown = styled(View)`
  position: relative;
  justify-content: center;
`

const dropdownKeyframes = keyframes`
  0% {
    opacity: 0;
    margin-bottom: 0;
  }
  
  100% {
    margin-bottom: -40px;
    opacity: 1;
  }
`

const StyledDropdownMenu = styled(View)`
  position: absolute;
  cursor: pointer;
  bottom: 0;
  height: 40px;
  margin-bottom: -43px;
  justify-content: center;
  animation: ${dropdownKeyframes} 0.3s ease;
  background-color: #484848;
  border-radius: ${STYLE.css.borderRadius};
  width: 100%;
  padding: 0;
  text-align: center;
  :hover {
    background-color: #494f5a;
  }
  z-index: 1;
  a {
    display: block;
    color: ${COLOR.white};
    padding: 12px;
    font-size: 16px;
    font-weight: normal;
    font-stretch: normal;
    font-style: normal;
    line-height: normal;
    letter-spacing: -0.25px;
    border-radius: ${STYLE.css.borderRadius};
    text-decoration: none;
    :hover {
      color: ${COLOR.white};
      background-color: rgba(85, 146, 247, 0.1);
    }
  }
`

const LoginUserInfo = (): ReactElement => {
  const loginUser = useRecoilValue(AuthStore.loginUser)
  const [isOpen, setIsOpen] = useState(false)
  const [tnsName, setTnsName] = useState<undefined | string>(undefined)

  const { logout } = useAuth()
  const { getName } = useTns()

  useEffect(() => {
    if (!loginUser.address.startsWith('terra1')) {
      setTnsName(undefined)
      return
    }

    ;(async (): Promise<void> => {
      const name = await getName(loginUser.address)
      setTnsName(name)
    })()
  }, [loginUser.address])

  return (
    <ClickAwayListener
      onClickAway={(): void => {
        setIsOpen(false)
      }}
    >
      <StyledDropdown>
        <StyledLoginUserInfoBox onClick={(): void => setIsOpen(!isOpen)}>
          <WalletLogo
            style={{ marginRight: 5 }}
            walleEnum={loginUser.walletType}
            size={16}
          />
          <StyledAddress>
            {UTIL.truncate(tnsName || loginUser.address)}
          </StyledAddress>
        </StyledLoginUserInfoBox>

        {isOpen && (
          <StyledDropdownMenu>
            <View onClick={logout}>Disconnect</View>
          </StyledDropdownMenu>
        )}
      </StyledDropdown>
    </ClickAwayListener>
  )
}

const Header = (): ReactElement => {
  const selectWallet = useSelectWallet()
  const isLoggedIn = useRecoilValue(AuthStore.isLoggedIn)

  return (
    <StyledContainer>
      <StyledNavContainer>
        <StyledNav>
          <StyledLogo>
            <img src={bridgeLogo} alt="" />
          </StyledLogo>
          {isLoggedIn ? (
            <LoginUserInfo />
          ) : (
            <View style={{justifyContent: 'center'}}>
              <StyledConnectWallet onClick={selectWallet.open}>
                Connect Wallet
              </StyledConnectWallet>
            </View>
          )}
        </StyledNav>
      </StyledNavContainer>
    </StyledContainer>
  )
}

export default Header
