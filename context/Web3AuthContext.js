'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import {
    AccountAbstractionProvider,
    BiconomySmartAccount,

  } from "@web3auth/account-abstraction-provider";
  import {
    CHAIN_NAMESPACES,
    WEB3AUTH_NETWORK,
  } from "@web3auth/base";
  import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
  import { Web3Auth } from "@web3auth/modal";
import RPC from "../hooks/ethersRPC";

const Web3AuthContext = createContext({
  web3auth: null,
  provider: null,
  isLoading: false,
  user: null,
  initt: false,
  tokenclaim: false,
  login: async () => {},
  logout: async () => {},
  getUserInfo: async () => {},
  getAccounts: async () => {},
  sendTransaction: async () => {},
  signMessage: async () => {},
  ownerAddCertificate: async () => {},
  getCertificate: async () => {},
  claimToken: async () => {},
  balanceToken: async () => {},
});

export function useWeb3Auth() {
  return useContext(Web3AuthContext);
}

export function Web3AuthContextProvider({ children }) {
  const [web3auth, setWeb3auth] = useState(null);
  const [provider, setProvider] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
const [initt, setinitt] = useState(false);
const [tokenclaim, setTokenclaim]= useState(false)
  useEffect(() => {
    const init = async () => {
      try {
        const chainConfig = {
            chainNamespace: CHAIN_NAMESPACES.EIP155,
            chainId: "0x61", // hex of 97
            rpcTarget: "https://rpc.ankr.com/bsc_testnet_chapel",
            // Avoid using public rpcTarget in production.
            // Use services like Infura, Quicknode etc
            displayName: "Binance SmartChain Testnet",
            blockExplorerUrl: "https://testnet.bscscan.com",
            ticker: "BNB",
            tickerName: "BNB",
            logo: "https://cryptologos.cc/logos/bnb-bnb-logo.png",
          };
          // IMP END - Chain Config
          
          const accountAbstractionProvider = new AccountAbstractionProvider({
            config: {
              chainConfig,
              bundlerConfig: {
                // Get the pimlico API Key from dashboard.pimlico.io
                url: `https://api.pimlico.io/v2/97/rpc?apikey=pim_nXWicVjUDNS4AWuBioN32f`,
              },
              smartAccountInit: new BiconomySmartAccount(),

              paymasterConfig: {
                // Get the pimlico API Key from dashboard.pimlico.io
                url: `https://api.pimlico.io/v2/97/rpc?apikey=pim_nXWicVjUDNS4AWuBioN32f`,
              },
            },
          });
          
          // IMP START - SDK Initialization
          const privateKeyProvider = new EthereumPrivateKeyProvider({
            config: { chainConfig },
          });
          
          const web3AuthOptions = {
            clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID,
            web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
            privateKeyProvider,
            accountAbstractionProvider,
            // useAAWithExternalWallet: false,
          };
          
        const web3auth = new Web3Auth(web3AuthOptions);
          setinitt(true);
       

        setWeb3auth(web3auth);
        await web3auth.initModal(); 
        if (localStorage.getItem('userEmail')) {
            const provider = await web3auth.connect();
            setProvider(provider);
          }

      } catch (error) {
        console.error(error);
      }
    };

    init();
  }, []);

  const login = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    setIsLoading(true);
    try {
      const web3authProvider = await web3auth.connect();
      setProvider(web3authProvider);
      const user = await web3auth.getUserInfo();
      setUser(user);
      if(localStorage.getItem('userReload')==null || localStorage.getItem('userReload')=='false') {
        window.location.reload();
        localStorage.setItem('userReload', 'true');
      }
    } catch (error) {
      console.error("Error logging in:", error);
    }
    setIsLoading(false);
  };

  const logout = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    setIsLoading(true);
    try {
      await web3auth.logout();
      setProvider(null);
      setUser(null);
    } catch (error) {
      console.error("Error logging out:", error);
    }
    setIsLoading(false);
  };

  const getUserInfo = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    try {
      const user = await web3auth.getUserInfo();
      return user;
    } catch (error) {
      console.error("Error getting user info:", error);
      return null;
    }
  };
  const getAccounts = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const address = await RPC.getAccounts(provider);
    return address;
  };
  const sendTransaction = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    console.log("Sending Transaction...");
    const transactionReceipt = await RPC.sendTransaction(provider);
    console.log(transactionReceipt);
  };
  const signMessage = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const signedMessage = await RPC.signMessage(provider);
    return JSON.stringify(signedMessage);
  };
  const ownerAddCertificate = async (address,courseName,metadataURI) => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    console.log("Sending Transaction...");

    const signedMessage = await RPC.ownerAddCertificate(provider,address,courseName,metadataURI );
    console.log(signedMessage);
    return JSON.stringify(signedMessage);
  };
  const getCertificate = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    console.log("Sending Transaction...");
    const signedMessage = await RPC.getCertificate(provider);
    console.log(signedMessage);
    return signedMessage;
  };
  const claimToken = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    console.log("Sending Transaction...");
    const signedMessage = await RPC.claimToken(provider);
    console.log(signedMessage);
    setTokenclaim(true)
    return signedMessage;
  };
  const balanceToken = async (address) => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    console.log("Sending Transaction...");
    const signedMessage = await RPC.balanceToken(provider,address);
    console.log(signedMessage);
    return signedMessage;
  };
  const value = {
    web3auth,
    provider,
    user,
    initt,
    isLoading,
    login,
    logout,
    getUserInfo,
    getAccounts,
    sendTransaction,
    signMessage,
    ownerAddCertificate,
    getCertificate,
    claimToken,
    balanceToken,
    tokenclaim
  };

  return (
    <Web3AuthContext.Provider value={value}>
      {children}
    </Web3AuthContext.Provider>
  );
}