import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { Connector, UserRejectedRequestError, normalizeChainId } from '@wagmi/core';
import QRCodeModal from '@walletconnect/qrcode-modal';
import { getChainConfig, CHAIN_NAMESPACES, ADAPTER_EVENTS, ADAPTER_CATEGORY, ADAPTER_STATUS, WALLET_ADAPTERS, storageAvailable } from '@web3auth/base';
import { Web3AuthCore } from '@web3auth/core';
import { MetamaskAdapter } from '@web3auth/metamask-adapter';
import { OpenloginAdapter } from '@web3auth/openlogin-adapter';
import { TorusWalletAdapter } from '@web3auth/torus-evm-adapter';
import LoginModal, { getAdapterSocialLogins, OPENLOGIN_PROVIDERS, LOGIN_MODAL_EVENTS } from '@web3auth/ui';
import { WalletConnectV1Adapter } from '@web3auth/wallet-connect-v1-adapter';
import { defaultEvmDappModalConfig } from '@web3auth/web3auth';
import { ethers } from 'ethers';
import { getAddress } from 'ethers/lib/utils';

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
const IS_SERVER = typeof window === "undefined";
const ADAPTER_CACHE_KEY = "Web3Auth-cachedAdapter";
class Web3AuthConnector extends Connector {
  constructor(config) {
    var _this$options$uiConfi, _this$options$uiConfi2;

    super(config);

    _defineProperty(this, "ready", !IS_SERVER);

    _defineProperty(this, "id", "web3Auth");

    _defineProperty(this, "name", "web3Auth");

    _defineProperty(this, "provider", void 0);

    _defineProperty(this, "web3AuthInstance", void 0);

    _defineProperty(this, "isModalOpen", false);

    _defineProperty(this, "web3AuthOptions", void 0);

    _defineProperty(this, "loginModal", void 0);

    _defineProperty(this, "socialLoginAdapter", void 0);

    _defineProperty(this, "torusWalletAdapter", void 0);

    _defineProperty(this, "metamaskAdapter", void 0);

    _defineProperty(this, "walletConnectV1Adapter", void 0);

    _defineProperty(this, "adapters", {});

    _defineProperty(this, "modalConfig", defaultEvmDappModalConfig);

    _defineProperty(this, "storage", "localStorage");

    this.web3AuthOptions = config.options;
    const chainId = config.options.chainId ? parseInt(config.options.chainId, 16) : 1;
    const chainConfig = this.chains.filter(x => x.id === chainId);
    const defaultChainConfig = getChainConfig(CHAIN_NAMESPACES.EIP155, config.options.chainId || "0x1");

    let finalChainConfig = _objectSpread({
      chainNamespace: CHAIN_NAMESPACES.EIP155
    }, defaultChainConfig);

    if (chainConfig.length > 0) {
      var _chainConfig$0$native, _chainConfig$0$native2, _chainConfig$, _chainConfig$$blockEx;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      finalChainConfig = _objectSpread(_objectSpread({}, finalChainConfig), {}, {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: config.options.chainId || "0x1",
        rpcTarget: chainConfig[0].rpcUrls.default,
        displayName: chainConfig[0].name,
        tickerName: (_chainConfig$0$native = chainConfig[0].nativeCurrency) === null || _chainConfig$0$native === void 0 ? void 0 : _chainConfig$0$native.name,
        ticker: (_chainConfig$0$native2 = chainConfig[0].nativeCurrency) === null || _chainConfig$0$native2 === void 0 ? void 0 : _chainConfig$0$native2.symbol,
        blockExplorer: (_chainConfig$ = chainConfig[0]) === null || _chainConfig$ === void 0 ? void 0 : (_chainConfig$$blockEx = _chainConfig$.blockExplorers.default) === null || _chainConfig$$blockEx === void 0 ? void 0 : _chainConfig$$blockEx.url
      });
    }

    this.web3AuthInstance = new Web3AuthCore({
      clientId: config.options.clientId,
      chainConfig: {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: "0x1",
        rpcTarget: "https://rpc.ankr.com/eth" // This is the public RPC we have added, please pass on your own endpoint while creating an app

      }
    });
    this.socialLoginAdapter = new OpenloginAdapter({
      adapterSettings: _objectSpread({}, config.options),
      chainConfig: {
        chainId: "0x1",
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        rpcTarget: "https://rpc.ankr.com/eth",
        displayName: "mainnet",
        blockExplorer: "https://etherscan.io/",
        ticker: "ETH",
        tickerName: "Ethereum"
      }
    });
    this.torusWalletAdapter = new TorusWalletAdapter({
      adapterSettings: {
        buttonPosition: "bottom-left"
      },
      loginSettings: {
        verifier: "google"
      },
      initParams: {
        buildEnv: "testing"
      },
      chainConfig: {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: "0x1",
        rpcTarget: "https://rpc.ankr.com/eth",
        displayName: "Ethereum Mainnet",
        blockExplorer: "https://etherscan.io/",
        ticker: "ETH",
        tickerName: "Ethereum"
      }
    });
    this.metamaskAdapter = new MetamaskAdapter({
      clientId: config.options.clientId
    });
    this.walletConnectV1Adapter = new WalletConnectV1Adapter({
      adapterSettings: {
        bridge: "https://bridge.walletconnect.org",
        qrcodeModal: QRCodeModal
      },
      clientId: config.options.clientId
    });
    this.web3AuthInstance.configureAdapter(this.socialLoginAdapter);
    this.web3AuthInstance.configureAdapter(this.torusWalletAdapter);
    this.web3AuthInstance.configureAdapter(this.metamaskAdapter);
    this.web3AuthInstance.configureAdapter(this.walletConnectV1Adapter);
    this.adapters[this.socialLoginAdapter.name] = this.socialLoginAdapter;
    this.adapters[this.torusWalletAdapter.name] = this.torusWalletAdapter;
    this.adapters[this.metamaskAdapter.name] = this.metamaskAdapter;
    this.adapters[this.walletConnectV1Adapter.name] = this.walletConnectV1Adapter;
    this.loginModal = new LoginModal({
      theme: (_this$options$uiConfi = this.options.uiConfig) === null || _this$options$uiConfi === void 0 ? void 0 : _this$options$uiConfi.theme,
      appLogo: ((_this$options$uiConfi2 = this.options.uiConfig) === null || _this$options$uiConfi2 === void 0 ? void 0 : _this$options$uiConfi2.appLogo) || "",
      version: "",
      adapterListener: this.web3AuthInstance,
      displayErrorsOnModal: this.options.displayErrorsOnModal
    }); // this.loginModal.initExternalWalletContainer();

    this.subscribeToLoginModalEvents();
  }

  async connect() {
    this.web3AuthInstance.init();
    const adapterEventsPromise = this.subscribeToAdpaterConnectionEvents();
    await this.init();
    this.loginModal.open();
    const elem = document.getElementById("w3a-container");
    elem.style.zIndex = "10000000000";
    return await adapterEventsPromise;
  }

  async subscribeToAdpaterConnectionEvents() {
    return new Promise((resolve, reject) => {
      this.web3AuthInstance.once(ADAPTER_EVENTS.CONNECTED, async () => {
        console.log("Received event connected: ", this.web3AuthInstance.connectedAdapterName);
        console.log("Requesting Signer");
        const signer = await this.getSigner();
        const account = await signer.getAddress();
        const provider = await this.getProvider();

        if (provider.on) {
          provider.on("accountsChanged", this.onAccountsChanged.bind(this));
          provider.on("chainChanged", this.onChainChanged.bind(this));
          provider.on("disconnect", this.onDisconnect.bind(this));
        }

        return resolve({
          account,
          chain: {
            id: 0,
            unsupported: false
          },
          provider
        });
      });
      this.web3AuthInstance.once(ADAPTER_EVENTS.ERRORED, err => {
        console.log("error while connecting", err);
        return reject(err);
      });
    });
  }

  async init() {
    console.log("What is this type: ", typeof this);
    console.log("What is this instance: ", this instanceof Web3AuthConnector);

    try {
      await this.loginModal.initModal();
      const allAdapters = [...new Set([...Object.keys(this.modalConfig.adapters || {}), ...Object.keys(this.adapters)])];
      const adapterNames = ["torus-evm", "metamask", "openlogin", "wallet-connect-v1"];
      const hasInAppWallets = true; // Now, initialize the adapters.

      const initPromises = adapterNames.map(async adapterName => {
        if (!adapterName) return;

        try {
          const adapter = this.adapters[adapterName];
          console.log("Adapter Found: ", adapterName);
          console.log("Cached Adapter: ", this.web3AuthInstance.cachedAdapter); // only initialize a external adapter here if it is a cached adapter.

          if (this.web3AuthInstance.cachedAdapter !== adapterName && adapter.type === ADAPTER_CATEGORY.EXTERNAL) {
            console.log(adapterName, " Adapter is not External");
            return;
          } // in-app wallets or cached wallet (being connected or already connected) are initialized first.
          // if adapter is configured thn only initialize in app or cached adapter.
          // external wallets are initialized on INIT_EXTERNAL_WALLET event.


          this.subscribeToAdapterEvents(adapter);

          if (adapter.status === ADAPTER_STATUS.NOT_READY) {
            await adapter.init({
              autoConnect: this.web3AuthInstance.cachedAdapter === adapterName
            });
            console.log("Initializing In Wallet: COMPLETED", adapter, adapter.status);
          } // note: not adding cachedWallet to modal if it is external wallet.
          // adding it later if no in-app wallets are available.


          if (adapter.type === ADAPTER_CATEGORY.IN_APP) {
            var _this$options$uiConfi3, _this$options$uiConfi4;

            this.loginModal.addSocialLogins(WALLET_ADAPTERS.OPENLOGIN, getAdapterSocialLogins(WALLET_ADAPTERS.OPENLOGIN, this.socialLoginAdapter, (_this$options$uiConfi3 = this.options.uiConfig) === null || _this$options$uiConfi3 === void 0 ? void 0 : _this$options$uiConfi3.loginMethodConfig), ((_this$options$uiConfi4 = this.options.uiConfig) === null || _this$options$uiConfi4 === void 0 ? void 0 : _this$options$uiConfi4.loginMethodsOrder) || OPENLOGIN_PROVIDERS);
          }
        } catch (error) {
          console.log(error, "error while initializing adapter");
        }
      });
      this.web3AuthInstance.status = ADAPTER_STATUS.READY;
      await Promise.all(initPromises);
      const hasExternalWallets = allAdapters.some(adapterName => {
        var _this$adapters$adapte, _this$modalConfig$ada;

        return ((_this$adapters$adapte = this.adapters[adapterName]) === null || _this$adapters$adapte === void 0 ? void 0 : _this$adapters$adapte.type) === ADAPTER_CATEGORY.EXTERNAL && ((_this$modalConfig$ada = this.modalConfig.adapters) === null || _this$modalConfig$ada === void 0 ? void 0 : _this$modalConfig$ada[adapterName].showOnModal);
      });
      console.log("Has External Wallets: ", hasExternalWallets);

      if (hasExternalWallets) {
        this.loginModal.initExternalWalletContainer();
      }

      if (!hasInAppWallets && hasExternalWallets) ;
    } catch (error) {
      console.log("error while connecting", error);
      throw new UserRejectedRequestError("Something went wrong");
    }
  }

  async getAccount() {
    const provider = new ethers.providers.Web3Provider(await this.getProvider());
    const signer = provider.getSigner();
    const account = await signer.getAddress();
    return account;
  }

  async getProvider() {
    if (this.provider) {
      return this.provider;
    }

    this.provider = this.web3AuthInstance.provider;
    return this.provider;
  }

  async getSigner() {
    console.log("Getting Signer");
    const provider = new ethers.providers.Web3Provider(await this.getProvider());
    const signer = provider.getSigner();
    return signer;
  }

  async isAuthorized() {
    try {
      const account = await this.getAccount();
      return !!(account && this.provider);
    } catch {
      return false;
    }
  }

  async getChainId() {
    try {
      const networkOptions = this.socialLoginAdapter.chainConfigProxy;

      if (typeof networkOptions === "object") {
        const chainID = networkOptions.chainId;

        if (chainID) {
          return normalizeChainId(chainID);
        }
      }

      throw new Error("Chain ID is not defined");
    } catch (error) {
      console.log("error", error);
      throw error;
    }
  }

  async disconnect() {
    await this.web3AuthInstance.logout();
    this.provider = null;
  }

  onAccountsChanged(accounts) {
    if (accounts.length === 0) this.emit("disconnect");else this.emit("change", {
      account: getAddress(accounts[0])
    });
  }

  onChainChanged(chainId) {
    const id = normalizeChainId(chainId);
    const unsupported = this.isChainUnsupported(id);
    this.emit("change", {
      chain: {
        id,
        unsupported
      }
    });
  }

  onDisconnect() {
    this.emit("disconnect");
  }

  subscribeToLoginModalEvents() {
    this.loginModal.on(LOGIN_MODAL_EVENTS.LOGIN, async params => {
      try {
        console.log("Wallet Adapters: ", +params.adapter);
        await this.web3AuthInstance.connectTo(params.adapter, params.loginParams);
      } catch (error) {
        console.log(`Error while connecting to adapter: ${params.adapter}`, error);
      }
    });
    this.loginModal.on(LOGIN_MODAL_EVENTS.INIT_EXTERNAL_WALLETS, async params => {
      await this.initExternalWalletAdapters(params.externalWalletsInitialized);
    });
    this.loginModal.on(LOGIN_MODAL_EVENTS.DISCONNECT, async () => {
      try {
        await this.disconnect();
      } catch (error) {
        console.log(`Error while disconnecting`, error);
      }
    });
  }

  async initExternalWalletAdapters(externalWalletsInitialized, options) {
    if (externalWalletsInitialized) return;
    const adaptersConfig = {};
    const adaptersData = {};
    const adapterPromises = Object.keys(this.adapters).map(async adapterName => {
      try {
        const adapter = this.adapters[adapterName];

        if ((adapter === null || adapter === void 0 ? void 0 : adapter.type) === ADAPTER_CATEGORY.EXTERNAL) {
          console.log("init external wallet", adapterName);
          this.subscribeToAdapterEvents(adapter); // we are not initializing cached adapter here as it is already being initialized in initModal before.

          if (this.web3AuthInstance.cachedAdapter === adapterName) {
            return;
          }

          if (adapter.status === ADAPTER_STATUS.NOT_READY) {
            console.log(`Adapter not Ready: ${adapterName}`);
            return await Promise.race([adapter.init({
              autoConnect: this.web3AuthInstance.cachedAdapter === adapterName
            }).then(() => {
              adaptersConfig[adapterName] = defaultEvmDappModalConfig.adapters[adapterName];
              adaptersData[adapterName] = adapter.adapterData || {};
              console.log("Adapter Init: ", adapterName);
              return adapterName;
            }), new Promise(resolve => {
              setTimeout(() => {
                return resolve(null);
              }, 5000);
            })]);
          }

          console.log(`Adapter Ready: ${adapterName}`);
          return adapterName;
        }
      } catch (error) {
        console.log(error, "error while initializing adapter");
      }
    });
    const adapterInitResults = await Promise.all(adapterPromises);
    console.log("Adapter Init Results: ", adapterInitResults);
    const finalAdaptersConfig = {};
    adapterInitResults.forEach(result => {
      if (result) {
        finalAdaptersConfig[result] = adaptersConfig[result];
      }
    });
    this.loginModal.addWalletLogins(finalAdaptersConfig, {
      showExternalWalletsOnly: !!(options !== null && options !== void 0 && options.showExternalWalletsOnly)
    });
  }

  subscribeToAdapterEvents(walletAdapter) {
    console.log("Running adapter events");
    walletAdapter.on(ADAPTER_EVENTS.CONNECTED, data => {
      const status = ADAPTER_STATUS.CONNECTED;
      this.web3AuthInstance.connectedAdapterName = data.adapter;
      this.cacheWallet(data.adapter);
      console.log("connected", status, this.web3AuthInstance.connectedAdapterName);
      this.web3AuthInstance.emit(ADAPTER_EVENTS.CONNECTED, _objectSpread({}, data));
    });
    walletAdapter.on(ADAPTER_EVENTS.DISCONNECTED, async data => {
      // get back to ready state for rehydrating.
      const status = ADAPTER_STATUS.READY;

      if (storageAvailable(this.storage)) {
        const cachedAdapter = window[this.storage].getItem(ADAPTER_CACHE_KEY);

        if (this.web3AuthInstance.connectedAdapterName === cachedAdapter) {
          this.web3AuthInstance.clearCache();
        }
      }

      console.log("disconnected", status, this.web3AuthInstance.connectedAdapterName);
      this.web3AuthInstance.connectedAdapterName = null;
      this.web3AuthInstance.emit(ADAPTER_EVENTS.DISCONNECTED, data);
    });
    walletAdapter.on(ADAPTER_EVENTS.CONNECTING, data => {
      const status = ADAPTER_STATUS.CONNECTING;
      this.web3AuthInstance.emit(ADAPTER_EVENTS.CONNECTING, data);
      console.log("connecting", status, this.web3AuthInstance.connectedAdapterName);
    });
    walletAdapter.on(ADAPTER_EVENTS.ERRORED, data => {
      const status = ADAPTER_STATUS.ERRORED;
      this.web3AuthInstance.clearCache();
      this.web3AuthInstance.emit(ADAPTER_EVENTS.ERRORED, data);
      console.log("errored", status, this.web3AuthInstance.connectedAdapterName);
    });
    walletAdapter.on(ADAPTER_EVENTS.ADAPTER_DATA_UPDATED, data => {
      console.log("adapter data updated", data);
      this.web3AuthInstance.emit(ADAPTER_EVENTS.ADAPTER_DATA_UPDATED, data);
    });
  }

  cacheWallet(walletName) {
    if (!storageAvailable(this.storage)) return;
    window[this.storage].setItem(ADAPTER_CACHE_KEY, walletName);
    this.web3AuthInstance.cachedAdapter = walletName;
  }

}

export { Web3AuthConnector };
//# sourceMappingURL=web3authWagmiConnector.esm.js.map
