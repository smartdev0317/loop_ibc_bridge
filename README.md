# Loop IBC Bridge Web App

The **Loop IBC Bridge** is a web frontend that allows users to easily send Terra assets across supported blockchains via their respective bridges.

Users can connect their wallets to the Loop IBC Bridge web app through a browser plugin for Chromium-based web browsers, as shown below:

| Blockchain | Supported Wallets                                                                                                                                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Terra      | [Terra Station Extension](https://terra.money/extension)                                                                                                                                                                                   |
| Ethereum   | [MetaMask](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en), [CoinBase](https://wallet.coinbase.com/) or [Trustwallet](https://trustwallet.com/) for [WalletConnect](https://walletconnect.org/) |
| BSC        | [Binance Chain Wallet](https://chrome.google.com/webstore/detail/binance-chain-wallet/fhbohimaelbohpjbbldcngcnapndodjp?hl=en) or [MetaMask](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en)     |

## Instructions

1. Install dependencies

```bash
$ npm install
```

2. Run Bridge

```bash
$ npm start
```

## Add a new IBC network

1. Update `src/types/network.ts`:

Add the chain to BlockChainType, IbcNetwork, isIbcNetwork, ibcChannels, ibcPrefix and allowedCoins

2. Update `src/consts/network.ts`:

Update blockChainImage and blockChainName

3. Add the chain in `src/pages/Send/BlockChainNetwork.tsx`:

Add the chain in the TO SelectBlockchain's array

4. (optional) Add the chain token to the assets list:

Make a PR to https://github.com/terra-money/assets/blob/master/ibc/tokens.js and add the chain native token, it's necessary if you want to send the token back to it's native chain

## License

This software is licensed under the Apache 2.0 license. Read more about it [here](./LICENSE).

© 2022 Loop IBC Bridge Web App
