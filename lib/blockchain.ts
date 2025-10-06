import { ethers } from 'ethers';
import { CHAINS } from './chains';

export class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private chainKey: string;

  constructor(chainKey: string = 'ethereum') {
    this.chainKey = chainKey;
    const chain = CHAINS[chainKey];
    if (!chain) {
      throw new Error(`Unknown chain: ${chainKey}`);
    }
    this.provider = new ethers.JsonRpcProvider(chain.rpcUrl);
  }

  getChain() {
    return CHAINS[this.chainKey];
  }

  // Get ETH/native balance
  async getBalance(address: string): Promise<string> {
    try {
      // Force latest block to avoid cached data
      const balance = await this.provider.getBalance(address, 'latest');
      const formatted = ethers.formatEther(balance);
      console.log(`Balance for ${address}: ${formatted} on chain ${this.chainKey}`);
      return formatted;
    } catch (error) {
      console.error('Error fetching balance:', error);
      throw error; // Re-throw so we can see the actual error
    }
  }

  // Get current gas price
  async getGasPrice(): Promise<{ slow: string; standard: string; fast: string }> {
    try {
      const feeData = await this.provider.getFeeData();
      const gasPrice = feeData.gasPrice || BigInt(0);
      
      // Calculate different speed options
      const slow = ethers.formatUnits(gasPrice * BigInt(80) / BigInt(100), 'gwei');
      const standard = ethers.formatUnits(gasPrice, 'gwei');
      const fast = ethers.formatUnits(gasPrice * BigInt(120) / BigInt(100), 'gwei');

      return { slow, standard, fast };
    } catch (error) {
      console.error('Error fetching gas price:', error);
      return { slow: '0', standard: '0', fast: '0' };
    }
  }

  // Send ETH transaction
  async sendTransaction(
    wallet: ethers.Wallet | ethers.HDNodeWallet,
    to: string,
    amount: string,
    gasPrice?: string
  ): Promise<ethers.TransactionResponse> {
    try {
      // Connect wallet to provider
      const connectedWallet = wallet.connect(this.provider);

      // Prepare transaction
      const tx = {
        to,
        value: ethers.parseEther(amount),
        gasLimit: 21000,
        ...(gasPrice && { gasPrice: ethers.parseUnits(gasPrice, 'gwei') }),
      };

      // Send transaction
      const transaction = await connectedWallet.sendTransaction(tx);
      return transaction;
    } catch (error) {
      console.error('Error sending transaction:', error);
      throw error;
    }
  }

  // Get transaction history
  async getTransactionHistory(address: string, limit: number = 10): Promise<any[]> {
    try {
      // In productie zou je een indexer zoals Etherscan API gebruiken
      return [];
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
  }

  // Validate Ethereum address
  static isValidAddress(address: string): boolean {
    return ethers.isAddress(address);
  }

  // Format address for display (0x1234...5678)
  static formatAddress(address: string): string {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  // Estimate transaction fee in USD (simplified)
  async estimateTransactionFee(gasPrice: string): Promise<string> {
    try {
      const gasPriceWei = ethers.parseUnits(gasPrice, 'gwei');
      const gasLimit = BigInt(21000); // Standard ETH transfer
      const feeInEth = ethers.formatEther(gasPriceWei * gasLimit);
      
      // In production, fetch real ETH price
      const ethPriceUSD = 1700; // Placeholder
      const feeInUSD = (parseFloat(feeInEth) * ethPriceUSD).toFixed(2);
      
      return feeInUSD;
    } catch (error) {
      console.error('Error estimating fee:', error);
      return '0';
    }
  }
}