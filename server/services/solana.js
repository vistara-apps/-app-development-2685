import { 
  Connection, 
  PublicKey, 
  Keypair, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction
} from '@solana/web3.js';
import { 
  createTransferInstruction, 
  getAssociatedTokenAddress, 
  createAssociatedTokenAccountInstruction 
} from '@solana/spl-token';
import { logger } from '../utils/logger.js';

// Initialize Solana connection
const getConnection = () => {
  const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
  const connection = new Connection(rpcUrl, 'confirmed');
  return connection;
};

// Get wallet keypair from private key
const getWalletKeypair = () => {
  try {
    const privateKey = process.env.SOLANA_WALLET_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('Solana wallet private key not found in environment variables');
    }
    
    // Convert private key to Uint8Array
    const secretKey = Uint8Array.from(JSON.parse(privateKey));
    return Keypair.fromSecretKey(secretKey);
  } catch (error) {
    logger.error(`Error creating wallet keypair: ${error.message}`);
    throw new Error('Failed to initialize Solana wallet');
  }
};

/**
 * Get SOL balance for an address
 * @param {string} address - Solana address
 * @returns {Promise<number>} - Balance in SOL
 */
export const getBalance = async (address) => {
  try {
    const connection = getConnection();
    const publicKey = new PublicKey(address);
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    logger.error(`Error getting balance: ${error.message}`);
    throw new Error(`Failed to get balance for address ${address}`);
  }
};

/**
 * Send SOL from service wallet to recipient
 * @param {string} recipientAddress - Recipient Solana address
 * @param {number} amount - Amount in SOL
 * @returns {Promise<string>} - Transaction signature
 */
export const sendSol = async (recipientAddress, amount) => {
  try {
    const connection = getConnection();
    const senderKeypair = getWalletKeypair();
    const recipientPublicKey = new PublicKey(recipientAddress);
    
    // Create transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: senderKeypair.publicKey,
        toPubkey: recipientPublicKey,
        lamports: amount * LAMPORTS_PER_SOL
      })
    );
    
    // Send transaction
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [senderKeypair]
    );
    
    logger.info(`SOL transfer successful: ${signature}`);
    return signature;
  } catch (error) {
    logger.error(`Error sending SOL: ${error.message}`);
    throw new Error(`Failed to send ${amount} SOL to ${recipientAddress}`);
  }
};

/**
 * Send SPL token from service wallet to recipient
 * @param {string} recipientAddress - Recipient Solana address
 * @param {string} tokenMint - Token mint address
 * @param {number} amount - Amount of tokens
 * @param {number} decimals - Token decimals
 * @returns {Promise<string>} - Transaction signature
 */
export const sendToken = async (recipientAddress, tokenMint, amount, decimals) => {
  try {
    const connection = getConnection();
    const senderKeypair = getWalletKeypair();
    
    const mintPublicKey = new PublicKey(tokenMint);
    const recipientPublicKey = new PublicKey(recipientAddress);
    
    // Get associated token accounts
    const senderTokenAccount = await getAssociatedTokenAddress(
      mintPublicKey,
      senderKeypair.publicKey
    );
    
    const recipientTokenAccount = await getAssociatedTokenAddress(
      mintPublicKey,
      recipientPublicKey
    );
    
    // Check if recipient token account exists
    const recipientAccountInfo = await connection.getAccountInfo(recipientTokenAccount);
    
    // Create transaction
    const transaction = new Transaction();
    
    // If recipient token account doesn't exist, create it
    if (!recipientAccountInfo) {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          senderKeypair.publicKey,
          recipientTokenAccount,
          recipientPublicKey,
          mintPublicKey
        )
      );
    }
    
    // Add transfer instruction
    transaction.add(
      createTransferInstruction(
        senderTokenAccount,
        recipientTokenAccount,
        senderKeypair.publicKey,
        amount * (10 ** decimals)
      )
    );
    
    // Send transaction
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [senderKeypair]
    );
    
    logger.info(`Token transfer successful: ${signature}`);
    return signature;
  } catch (error) {
    logger.error(`Error sending token: ${error.message}`);
    throw new Error(`Failed to send ${amount} tokens to ${recipientAddress}`);
  }
};

/**
 * Get transaction status
 * @param {string} signature - Transaction signature
 * @returns {Promise<object>} - Transaction status
 */
export const getTransactionStatus = async (signature) => {
  try {
    const connection = getConnection();
    const status = await connection.getSignatureStatus(signature);
    return status;
  } catch (error) {
    logger.error(`Error getting transaction status: ${error.message}`);
    throw new Error(`Failed to get status for transaction ${signature}`);
  }
};

/**
 * Estimate transaction fee
 * @returns {Promise<number>} - Estimated fee in SOL
 */
export const estimateTransactionFee = async () => {
  try {
    const connection = getConnection();
    
    // Get recent blockhash
    const { feeCalculator } = await connection.getRecentBlockhash();
    
    // Calculate fee for a standard transfer transaction
    const fee = feeCalculator.lamportsPerSignature / LAMPORTS_PER_SOL;
    
    return fee;
  } catch (error) {
    logger.error(`Error estimating transaction fee: ${error.message}`);
    throw new Error('Failed to estimate transaction fee');
  }
};

/**
 * Validate Solana address
 * @param {string} address - Solana address to validate
 * @returns {boolean} - Whether address is valid
 */
export const isValidSolanaAddress = (address) => {
  try {
    new PublicKey(address);
    return true;
  } catch (error) {
    return false;
  }
};

