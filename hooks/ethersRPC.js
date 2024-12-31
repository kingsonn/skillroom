/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import { ethers } from "ethers";

const getChainId = async (provider) => {
  try {
    const ethersProvider = new ethers.BrowserProvider(provider);
    // Get the connected Chain's ID
    const networkDetails = await ethersProvider.getNetwork();
    return networkDetails.chainId.toString();
  } catch (error) {
    return error;
  }
};

const getAccounts = async (provider) => {
  try {
    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();

    // Get user's Ethereum public address
    const address = signer.getAddress();

    return await address;
  } catch (error) {
    return error;
  }
};

const getBalance = async (provider) => {
  try {
    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();

    // Get user's Ethereum public address
    const address = signer.getAddress();

    // Get user's balance in ether
    const balance = ethers.formatEther(
      await ethersProvider.getBalance(address) // Balance is in wei
    );

    return balance;
  } catch (error) {
    return error;
  }
};

const sendTransaction = async (provider) => {
  try {
    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    const abi = [
      {
        inputs: [
          { internalType: "bytes32", name: "userHash", type: "bytes32" },
          { internalType: "string", name: "encryptedData", type: "string" },
        ],
        name: "addOrUpdateUserData",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [{ internalType: "address", name: "initialOwner", type: "address" }],
        stateMutability: "nonpayable",
        type: "constructor",
      },
      // ... rest of the ABI omitted for brevity
    ];
    const destination = "0xF9FDDC4D650DF5650F2aD311e49f7195D49cAd28";
    const contractInterface = new ethers.Interface(abi); // Direct access

    // Encode the function call
    const data = contractInterface.encodeFunctionData("addOrUpdateUserData", [
      "0x1334567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      "hellofromnexus",
    ]);
    const fees = await ethersProvider.getFeeData();
    const amount = ethers.parseEther("0");

    // Submit transaction to the blockchain
    const tx = await signer.sendTransaction({
      to: destination,
      value: amount, // Amount in wei
      maxPriorityFeePerGas: fees.maxPriorityFeePerGas, // Max priority fee per gas
      maxFeePerGas: fees.maxFeePerGas, // Max fee per gas
      data: data,
    });

    // Wait for transaction to be mined
    const receipt = await tx.wait();

    return receipt;
  } catch (error) {
    return error;
  }
};

const signMessage = async (provider) => {
  try {
    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    const originalMessage = "YOUR_MESSAGE";

    // Sign the message
    const signedMessage = await signer.signMessage(originalMessage);

    return signedMessage;
  } catch (error) {
    return error;
  }
};

export default { getChainId, getAccounts, getBalance, sendTransaction, signMessage };
