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

  // Get transaction history from block explorer APIs
  async getTransactionHistory(address: string, limit: number = 10): Promise<any[]> {
    try {
      const chainId = await this.provider.getNetwork().then(n => Number(n.chainId));
      
      // Get API keys from environment (optional, but recommended)
      const getApiKey = (chain: number): string => {
        const keys: Record<number, string | undefined> = {
          1: process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY,
          11155111: process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY,
          56: process.env.NEXT_PUBLIC_BSCSCAN_API_KEY,
          97: process.env.NEXT_PUBLIC_BSCSCAN_API_KEY,
          137: process.env.NEXT_PUBLIC_POLYGONSCAN_API_KEY,
        };
        return keys[chain] || 'YourApiKeyToken';
      };

      // API endpoints for different chains
      const apiConfig: Record<number, { url: string; v2: boolean }> = {
        1: { url: 'https://api.etherscan.io/v2/api', v2: true }, // Ethereum V2
        56: { url: 'https://api.bscscan.com/api', v2: false }, // BSC
        97: { url: 'https://api-testnet.bscscan.com/api', v2: false }, // BSC Testnet
        137: { url: 'https://api.polygonscan.com/api', v2: false }, // Polygon
        42161: { url: 'https://api.arbiscan.io/api', v2: false }, // Arbitrum
        11155111: { url: 'https://api-sepolia.etherscan.io/v2/api', v2: true }, // Sepolia V2
      };

      const config = apiConfig[chainId];
      if (!config) {
        console.warn(`No API config for chain ${chainId}`);
        return [];
      }

      const apiKey = getApiKey(chainId);

      // Build API URL
      let apiUrl: string;
      if (config.v2) {
        // Etherscan V2 format (requires API key)
        apiUrl = `${config.url}?chainid=${chainId}&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=${limit}&sort=desc&apikey=${apiKey}`;
      } else {
        // V1 format for other chains
        apiUrl = `${config.url}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=${limit}&sort=desc&apikey=${apiKey}`;
      }

      console.log(`Fetching transactions for chain ${chainId}...`);

      // Fetch transactions
      const response = await fetch(apiUrl);

      if (!response.ok) {
        console.error(`API error: ${response.status}`);
        return [];
      }

      const data = await response.json();

      if (data.status !== '1') {
        console.warn(`API returned status: ${data.status}, message: ${data.message}`);
        
        // If API key is missing or invalid, show helpful message
        if (data.message && data.message.includes('API Key')) {
          console.warn('💡 Tip: Add a free Etherscan API key to .env.local for transaction history');
          console.warn('Get your key at: https://etherscan.io/apis');
        }
        
        return [];
      }

      if (!data.result || !Array.isArray(data.result)) {
        console.warn('No transaction results found');
        return [];
      }

      console.log(`✅ Loaded ${data.result.length} transactions`);

      // Format transactions
      return data.result.map((tx: any) => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: ethers.formatEther(tx.value),
        timestamp: parseInt(tx.timeStamp) * 1000,
        isError: tx.isError === '1',
        gasUsed: tx.gasUsed,
        gasPrice: tx.gasPrice,
        blockNumber: tx.blockNumber,
      }));
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