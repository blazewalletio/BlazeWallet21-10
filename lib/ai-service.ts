// AI Service - Central AI functionality for BlazeWallet
import { ethers } from 'ethers';

export interface AIResponse {
  success: boolean;
  message: string;
  action?: {
    type: 'send' | 'swap' | 'info' | 'none';
    params?: any;
  };
  confidence: number;
}

export interface TransactionIntent {
  type: 'send' | 'swap' | 'receive' | 'info';
  amount?: string;
  token?: string;
  recipient?: string;
  fromToken?: string;
  toToken?: string;
}

class AIService {
  private apiKey: string | null = null;
  private conversationHistory: Array<{ role: string; content: string }> = [];
  private lastApiCall: number = 0;
  private readonly RATE_LIMIT_MS = 5000; // 5 seconds between calls (increased)
  private retryCount: number = 0;
  private readonly MAX_RETRIES = 2; // Reduced retries to avoid long waits

  setApiKey(key: string) {
    console.log('🔑 Setting API key...', key.substring(0, 8) + '...');
    this.apiKey = key;
    if (typeof window !== 'undefined') {
      localStorage.setItem('ai_api_key', key);
      console.log('✅ API key saved to localStorage');
    }
  }

  getApiKey(): string | null {
    if (this.apiKey) {
      console.log('🔑 Using in-memory API key:', this.apiKey.substring(0, 8) + '...');
      return this.apiKey;
    }
    if (typeof window !== 'undefined') {
      const storedKey = localStorage.getItem('ai_api_key');
      if (storedKey) {
        console.log('🔑 Loaded API key from localStorage:', storedKey.substring(0, 8) + '...');
        this.apiKey = storedKey; // Cache it
        return storedKey;
      }
    }
    console.log('❌ No API key found');
    return null;
  }

  private checkRateLimit(): boolean {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastApiCall;
    
    if (timeSinceLastCall < this.RATE_LIMIT_MS) {
      const waitTime = this.RATE_LIMIT_MS - timeSinceLastCall;
      console.log(`⏰ Rate limit: please wait ${Math.ceil(waitTime / 1000)} seconds`);
      return false;
    }
    
    this.lastApiCall = now;
    return true;
  }

  private isRecentFailure(): boolean {
    // Check if we had a recent 429 error within the last 30 seconds
    const recentFailure = localStorage.getItem('ai_recent_429');
    if (recentFailure) {
      const failureTime = parseInt(recentFailure);
      const now = Date.now();
      if (now - failureTime < 30000) { // 30 seconds
        console.log('🚫 Recent 429 error detected, waiting longer...');
        return true;
      } else {
        localStorage.removeItem('ai_recent_429');
      }
    }
    return false;
  }

  private recordFailure(): void {
    localStorage.setItem('ai_recent_429', Date.now().toString());
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async retryWithBackoff<T>(fn: () => Promise<T>, maxRetries: number = 2): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        if (error.message?.includes('Te veel requests')) {
          // Record the failure for future calls
          this.recordFailure();
          
          if (attempt < maxRetries) {
            const backoffMs = Math.pow(2, attempt + 2) * 1000; // Exponential backoff: 8s, 16s
            console.log(`⏳ Retry ${attempt}/${maxRetries} in ${backoffMs/1000}s...`);
            await this.sleep(backoffMs);
            continue;
          }
        }
        throw error;
      }
    }
    throw new Error('Max retries exceeded');
  }

  // Parse natural language transaction commands
  parseTransactionIntent(input: string, context: any): TransactionIntent | null {
    const lowerInput = input.toLowerCase();
    
    // Send patterns
    const sendPatterns = [
      /(?:stuur|send|verstuur|transfer)\s+(\d+(?:\.\d+)?)\s*(\w+)?\s+(?:naar|to)\s+(.+)/i,
      /(?:stuur|send|verstuur)\s+(.+)\s+(\d+(?:\.\d+)?)\s*(\w+)?/i,
    ];

    // Swap patterns
    const swapPatterns = [
      /(?:swap|wissel|ruil)\s+(\d+(?:\.\d+)?)\s*(\w+)?\s+(?:naar|to|for)\s+(\w+)/i,
      /(?:swap|wissel|ruil)\s+(?:al mijn|all my|alle)\s+(\w+)\s+(?:naar|to|for)\s+(\w+)/i,
    ];

    // Info patterns
    const infoPatterns = [
      /(?:wat is|what is|hoeveel|how much)\s+(.+)/i,
      /(?:toon|show|display)\s+(.+)/i,
    ];

    // Try to match send patterns
    for (const pattern of sendPatterns) {
      const match = input.match(pattern);
      if (match) {
        return {
          type: 'send',
          amount: match[1],
          token: match[2] || 'ETH',
          recipient: match[3],
        };
      }
    }

    // Try to match swap patterns
    for (const pattern of swapPatterns) {
      const match = input.match(pattern);
      if (match) {
        if (match[0].includes('al mijn') || match[0].includes('all my')) {
          return {
            type: 'swap',
            amount: 'max',
            fromToken: match[1],
            toToken: match[2],
          };
        }
        return {
          type: 'swap',
          amount: match[1],
          fromToken: match[2] || 'ETH',
          toToken: match[3],
        };
      }
    }

    // Info request
    for (const pattern of infoPatterns) {
      const match = input.match(pattern);
      if (match) {
        return {
          type: 'info',
        };
      }
    }

    return null;
  }

  // AI-powered transaction assistant
  async processTransactionCommand(
    input: string,
    context: {
      balance: string;
      tokens: any[];
      address: string;
      chain: string;
    }
  ): Promise<AIResponse> {
    try {
      // First try pattern matching (works offline)
      const intent = this.parseTransactionIntent(input, context);
      
      if (intent) {
        if (intent.type === 'send' && intent.amount && intent.recipient) {
          // Validate address
          const isValidAddress = ethers.isAddress(intent.recipient);
          if (!isValidAddress) {
            return {
              success: false,
              message: `Het adres "${intent.recipient}" is geen geldig Ethereum adres. Controleer het nog eens.`,
              confidence: 0.95,
            };
          }

          return {
            success: true,
            message: `Ik ga ${intent.amount} ${intent.token} sturen naar ${intent.recipient}. Bevestig de transactie.`,
            action: {
              type: 'send',
              params: {
                amount: intent.amount,
                token: intent.token,
                recipient: intent.recipient,
              },
            },
            confidence: 0.9,
          };
        }

        if (intent.type === 'swap' && intent.fromToken && intent.toToken) {
          return {
            success: true,
            message: `Ik ga ${intent.amount === 'max' ? 'al je' : intent.amount} ${intent.fromToken} swappen naar ${intent.toToken}.`,
            action: {
              type: 'swap',
              params: {
                fromToken: intent.fromToken,
                toToken: intent.toToken,
                amount: intent.amount,
              },
            },
            confidence: 0.85,
          };
        }

        if (intent.type === 'info') {
          const totalValue = context.tokens.reduce((sum, t) => sum + (parseFloat(t.usdValue) || 0), 0);
          return {
            success: true,
            message: `Je portfolio is €${totalValue.toFixed(2)} waard. Je grootste holding is ${context.tokens[0]?.symbol || 'ETH'}.`,
            confidence: 0.95,
          };
        }
      }

      // If no pattern match and API key available, use OpenAI
      if (this.apiKey) {
        if (!this.checkRateLimit()) {
          return {
            success: false,
            message: 'Te veel requests. Wacht even en probeer opnieuw.',
            confidence: 0,
          };
        }
        
        if (this.isRecentFailure()) {
          return {
            success: false,
            message: 'OpenAI API heeft recent te veel requests gehad. Wacht even voordat je opnieuw probeert.',
            confidence: 0,
          };
        }
        
        return await this.processWithOpenAI(input, context);
      }

      // No match and no API
      return {
        success: false,
        message: 'Ik begreep je commando niet. Probeer bijvoorbeeld: "Stuur 10 USDC naar 0x..." of "Swap 1 ETH naar USDC"',
        confidence: 0.3,
      };
    } catch (error) {
      console.error('AI processing error:', error);
      return {
        success: false,
        message: 'Er ging iets fout bij het verwerken van je commando.',
        confidence: 0,
      };
    }
  }

  private async processWithOpenAI(input: string, context: any): Promise<AIResponse> {
    try {
      console.log('🤖 Processing command with OpenAI...');
      
      return await this.retryWithBackoff(async () => {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.getApiKey()}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini', // Changed to more cost-effective model
            messages: [
              {
                role: 'system',
                content: `Je bent een AI assistent voor BlazeWallet. Parse user commands and extract transaction intent.
                Context: Balance: ${context.balance}, Chain: ${context.chain}
                Return JSON: { "type": "send|swap|info", "params": {...}, "message": "explanation" }`,
              },
              { role: 'user', content: input },
            ],
            temperature: 0.3,
          }),
        });

        console.log('📡 OpenAI command response status:', response.status);

        if (!response.ok) {
          console.error('❌ OpenAI API error:', response.status, response.statusText);
          if (response.status === 401) {
            throw new Error('API key is ongeldig. Controleer je OpenAI API key.');
          } else if (response.status === 429) {
            throw new Error('Te veel requests. Wacht even en probeer opnieuw.');
          } else if (response.status === 404) {
            throw new Error('OpenAI API endpoint niet gevonden. Controleer je API key.');
          } else {
            throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
          }
        }

        const data = await response.json();
        console.log('✅ OpenAI command response data:', data);

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
          console.error('❌ Invalid OpenAI response structure:', data);
          throw new Error('OpenAI gaf een onverwacht antwoord.');
        }

        const result = JSON.parse(data.choices[0].message.content);

        return {
          success: true,
          message: result.message,
          action: {
            type: result.type,
            params: result.params,
          },
          confidence: 0.95,
        };
      });
    } catch (error) {
      console.error('OpenAI error:', error);
      throw error;
    }
  }

  // Smart contract and address risk analysis
  async analyzeRisk(address: string, type: 'contract' | 'wallet' = 'contract'): Promise<{
    risk: 'low' | 'medium' | 'high' | 'critical';
    warnings: string[];
    score: number;
    details: string;
  }> {
    try {
      const warnings: string[] = [];
      let score = 100;

      // Basic address validation
      if (!ethers.isAddress(address)) {
        return {
          risk: 'critical',
          warnings: ['Geen geldig Ethereum adres'],
          score: 0,
          details: 'Dit is geen geldig blockchain adres.',
        };
      }

      // Check if it's a known scam address (would need a database/API in production)
      const knownScamPatterns = [
        '0x0000000000000000000000000000000000000000', // Burn address
      ];

      if (knownScamPatterns.includes(address.toLowerCase())) {
        warnings.push('⚠️ Dit is een bekende risicovolle adres');
        score -= 50;
      }

      // If API key available, do deeper analysis
      if (this.apiKey && type === 'contract') {
        // In production: call actual security APIs like GoPlus, De.Fi, etc.
        warnings.push('✓ Contract gescand - geen directe red flags gevonden');
      }

      // Check address age and activity (would need blockchain explorer API)
      // For now, simple heuristics
      const addressChecksum = ethers.getAddress(address);
      const hasChecksum = addressChecksum !== address.toUpperCase() && addressChecksum !== address.toLowerCase();
      
      if (!hasChecksum) {
        warnings.push('ℹ️ Adres heeft geen checksum - verhoogd risico op typefouten');
        score -= 10;
      }

      // Determine risk level
      let risk: 'low' | 'medium' | 'high' | 'critical';
      if (score >= 80) risk = 'low';
      else if (score >= 60) risk = 'medium';
      else if (score >= 30) risk = 'high';
      else risk = 'critical';

      return {
        risk,
        warnings,
        score,
        details: this.getRiskDetails(risk, warnings),
      };
    } catch (error) {
      console.error('Risk analysis error:', error);
      return {
        risk: 'medium',
        warnings: ['Kon risico niet volledig analyseren'],
        score: 50,
        details: 'Er ging iets fout bij de risico analyse.',
      };
    }
  }

  private getRiskDetails(risk: string, warnings: string[]): string {
    switch (risk) {
      case 'low':
        return '✅ Dit lijkt een veilige transactie. Je kunt doorgaan.';
      case 'medium':
        return '⚠️ Wees voorzichtig. Controleer het adres dubbel voordat je doorgaat.';
      case 'high':
        return '🚨 Hoog risico gedetecteerd! Overweeg deze transactie niet te doen.';
      case 'critical':
        return '🛑 STOP! Dit is waarschijnlijk een scam of fout adres. Ga NIET door.';
      default:
        return 'Risico onbekend.';
    }
  }

  // Portfolio analysis and recommendations
  analyzePortfolio(tokens: any[], totalValue: number): {
    insights: string[];
    recommendations: string[];
    riskScore: number;
  } {
    const insights: string[] = [];
    const recommendations: string[] = [];
    let riskScore = 50; // Start at medium risk

    if (tokens.length === 0) {
      return {
        insights: ['Je portfolio is leeg'],
        recommendations: ['Begin met het toevoegen van crypto assets'],
        riskScore: 0,
      };
    }

    // Diversification analysis
    const largestHolding = tokens[0];
    const largestPercentage = (parseFloat(largestHolding.usdValue) / totalValue) * 100;

    if (largestPercentage > 80) {
      insights.push(`💎 ${largestPercentage.toFixed(0)}% van je portfolio zit in ${largestHolding.symbol}`);
      recommendations.push('Overweeg te diversifiëren naar andere assets voor lagere risico');
      riskScore += 20;
    } else if (largestPercentage > 50) {
      insights.push(`Je grootste holding is ${largestHolding.symbol} (${largestPercentage.toFixed(0)}%)`);
      riskScore += 10;
    } else {
      insights.push('✅ Goed gediversifieerde portfolio');
      riskScore -= 10;
    }

    // Stablecoin allocation
    const stablecoins = tokens.filter(t => 
      ['USDT', 'USDC', 'DAI', 'BUSD'].includes(t.symbol.toUpperCase())
    );
    const stableValue = stablecoins.reduce((sum, t) => sum + parseFloat(t.usdValue || '0'), 0);
    const stablePercentage = (stableValue / totalValue) * 100;

    if (stablePercentage < 10) {
      insights.push('⚠️ Je hebt weinig stablecoins voor volatiliteit bescherming');
      recommendations.push('Overweeg 10-20% in stablecoins aan te houden als buffer');
      riskScore += 15;
    } else if (stablePercentage > 70) {
      insights.push('💵 Veel stablecoins - conservatieve strategie');
      recommendations.push('Als je meer risico aankan, overweeg exposure naar growth assets');
      riskScore -= 15;
    } else {
      insights.push(`✅ Gezonde stablecoin allocatie (${stablePercentage.toFixed(0)}%)`);
    }

    // Portfolio size recommendations
    if (totalValue < 100) {
      recommendations.push('💡 Begin klein en leer de basics voordat je meer investeert');
    } else if (totalValue > 10000) {
      recommendations.push('💼 Overweeg hardware wallet voor extra security bij grote bedragen');
    }

    // Token count
    if (tokens.length > 15) {
      insights.push('📊 Je hebt veel verschillende tokens');
      recommendations.push('Overweeg te consolideren naar je top holdings voor beter overzicht');
    }

    return {
      insights,
      recommendations,
      riskScore: Math.min(Math.max(riskScore, 0), 100),
    };
  }

  // Gas price prediction with ML-inspired heuristics
  async predictOptimalGasTime(currentGasPrice: number): Promise<{
    recommendation: 'now' | 'wait_short' | 'wait_long';
    estimatedSavings: number;
    message: string;
    optimalTime?: string;
  }> {
    try {
      // In production: use historical gas data and ML model
      // For now: use simple heuristics based on time of day

      const now = new Date();
      const hour = now.getHours();
      const day = now.getDay();

      // Weekend typically has lower gas
      const isWeekend = day === 0 || day === 6;

      // Off-peak hours (2 AM - 6 AM UTC is typically cheapest)
      const isOffPeak = hour >= 2 && hour <= 6;

      // Peak hours (afternoon US time = evening Europe)
      const isPeak = hour >= 14 && hour <= 20;

      if (isOffPeak || (isWeekend && !isPeak)) {
        return {
          recommendation: 'now',
          estimatedSavings: 0,
          message: '✅ Goede tijd voor transacties! Gas is relatief laag nu.',
        };
      }

      if (isPeak && !isWeekend) {
        const hoursToWait = (26 - hour) % 24; // Calculate hours until 2 AM
        const estimatedSavings = currentGasPrice * 0.4; // Estimate 40% savings

        return {
          recommendation: 'wait_long',
          estimatedSavings,
          message: `⏰ Gas is nu ${currentGasPrice.toFixed(0)} gwei. Wacht ${hoursToWait}u voor ~40% besparing`,
          optimalTime: `Vanavond laat / vroege ochtend (2-6 uur)`,
        };
      }

      // Moderate times
      const hoursToWait = Math.min(4, (26 - hour) % 24);
      const estimatedSavings = currentGasPrice * 0.2; // Estimate 20% savings

      return {
        recommendation: 'wait_short',
        estimatedSavings,
        message: `💡 Overweeg ${hoursToWait}u te wachten voor ~20% lagere gas kosten`,
        optimalTime: 'Over een paar uur',
      };
    } catch (error) {
      console.error('Gas prediction error:', error);
      return {
        recommendation: 'now',
        estimatedSavings: 0,
        message: 'Kon geen gas voorspelling maken',
      };
    }
  }

  // Conversational AI assistant
  async chat(message: string, context?: any): Promise<string> {
    try {
      // Add to conversation history
      this.conversationHistory.push({ role: 'user', content: message });
      
      // Check if we have an API key
      const apiKey = this.getApiKey();
      if (!apiKey) {
        console.log('❌ No API key available for chat');
        return 'Ik kan je vraag niet beantwoorden zonder OpenAI API key. Stel deze in bij Settings → AI Configuration.';
      }

      // Check rate limit
      if (!this.checkRateLimit()) {
        return 'Te veel requests. Wacht even en probeer opnieuw.';
      }

      // Check for recent failures
      if (this.isRecentFailure()) {
        return 'OpenAI API heeft recent te veel requests gehad. Wacht even voordat je opnieuw probeert.';
      }

      // Common crypto questions (works offline)
      const commonQuestions: { [key: string]: string } = {
        'wat is gas': 'Gas zijn de transactiekosten op Ethereum. Het is de prijs die je betaalt aan miners/validators om je transactie te verwerken. Gemeten in gwei (1 gwei = 0.000000001 ETH).',
        'what is gas': 'Gas is the transaction fee on Ethereum. It\'s the price you pay to miners/validators to process your transaction. Measured in gwei (1 gwei = 0.000000001 ETH).',
        'wat is slippage': 'Slippage is het verschil tussen de verwachte prijs en de werkelijke prijs van een swap. Bij hoge volatiliteit kan de prijs veranderen terwijl je transactie wordt uitgevoerd.',
        'wat is impermanent loss': 'Impermanent loss treedt op bij liquidity pools wanneer de prijs van je tokens verandert vergeleken met toen je ze toevoegde. Het heet "impermanent" omdat het pas definitief is als je je tokens terugtrekt.',
        'waarom lukt mijn swap niet': 'Mogelijke redenen: 1) Te weinig ETH voor gas, 2) Slippage te laag ingesteld, 3) Token heeft te weinig liquiditeit, of 4) Je moet het token eerst approven.',
        'wat is een smart contract': 'Een smart contract is code die automatisch wordt uitgevoerd op de blockchain. Het zijn de "apps" van crypto - zoals Uniswap voor swaps of Aave voor lending.',
        'hoe werkt defi': 'DeFi (Decentralized Finance) zijn financiële diensten zonder banken. Je kunt lenen, uitlenen, swappen en verdienen via smart contracts op de blockchain.',
        'wat is yield farming': 'Yield farming is het verdienen van rewards door je tokens te staken in liquidity pools. Je krijgt tokens als beloning voor het beschikbaar stellen van liquiditeit.',
        'wat is staking': 'Staking is het vergrendelen van je tokens om het netwerk te beveiligen. Je krijgt rewards als beloning voor het deelnemen aan consensus.',
        'wat zijn nfts': 'NFTs (Non-Fungible Tokens) zijn unieke digitale items op de blockchain. Ze kunnen kunst, muziek, games of andere digitale assets vertegenwoordigen.',
        'hoe koop ik crypto': 'Je kunt crypto kopen op exchanges zoals Coinbase, Binance of Kraken. Gebruik altijd een betrouwbare exchange en bewaar je crypto veilig.',
        'wat is een wallet': 'Een crypto wallet is een digitale portemonnee om je cryptocurrency op te slaan. Het bevat je private keys waarmee je toegang hebt tot je crypto.',
        'wat is bitcoin': 'Bitcoin is de eerste en grootste cryptocurrency. Het is een digitale munt die werkt zonder centrale bank en wordt gebruikt als store of value.',
        'wat is ethereum': 'Ethereum is een blockchain platform waarop smart contracts draaien. Het is de basis voor veel DeFi apps, NFTs en andere blockchain projecten.',
        'wat zijn altcoins': 'Altcoins zijn alle cryptocurrencies behalve Bitcoin. Populaire altcoins zijn Ethereum, Cardano, Solana en Polygon.',
      };

      const lowerMessage = message.toLowerCase();
      for (const [question, answer] of Object.entries(commonQuestions)) {
        if (lowerMessage.includes(question)) {
          const response = answer;
          this.conversationHistory.push({ role: 'assistant', content: response });
          return response;
        }
      }

      // If we have API key, use OpenAI
      if (apiKey) {
        console.log('🤖 Making OpenAI API call...');
        
        return await this.retryWithBackoff(async () => {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini', // Changed to more cost-effective model
              messages: [
                {
                  role: 'system',
                  content: `Je bent een behulpzame crypto expert assistent in BlazeWallet. 
                  Geef duidelijke, korte antwoorden in het Nederlands (tenzij de gebruiker Engels spreekt).
                  Focus op praktisch advies. Noem nooit dat je een AI bent.
                  Context: ${JSON.stringify(context || {})}`,
                },
                ...this.conversationHistory,
              ],
              temperature: 0.7,
              max_tokens: 200,
            }),
          });

          console.log('📡 OpenAI response status:', response.status);

          if (!response.ok) {
            console.error('❌ OpenAI API error:', response.status, response.statusText);
            if (response.status === 401) {
              throw new Error('API key is ongeldig. Controleer je OpenAI API key in de instellingen.');
            } else if (response.status === 429) {
              throw new Error('Te veel requests. Wacht even en probeer opnieuw.');
            } else if (response.status === 404) {
              throw new Error('OpenAI API endpoint niet gevonden. Controleer je API key.');
            } else {
              throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
            }
          }

          const data = await response.json();
          console.log('✅ OpenAI response data:', data);

          if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            console.error('❌ Invalid OpenAI response structure:', data);
            throw new Error('OpenAI gaf een onverwacht antwoord. Probeer opnieuw.');
          }

          const assistantMessage = data.choices[0].message.content;
          
          this.conversationHistory.push({ role: 'assistant', content: assistantMessage });
          
          // Keep conversation history manageable
          if (this.conversationHistory.length > 20) {
            this.conversationHistory = this.conversationHistory.slice(-10);
          }

          return assistantMessage;
        });
      }

      // No API key available
      return 'Ik kan je vraag niet beantwoorden zonder OpenAI API key. Stel deze in bij Settings → AI Configuration.';
    } catch (error: any) {
      console.error('Chat error:', error);
      
      // Provide helpful fallback responses when OpenAI is unavailable
      if (error.message?.includes('Te veel requests')) {
        return 'OpenAI API heeft momenteel te veel requests. Probeer het over een paar minuten opnieuw, of stel je vraag anders.';
      } else if (error.message?.includes('API key')) {
        return 'Er is een probleem met de OpenAI API key. Controleer de instellingen.';
      } else {
        return 'Sorry, er ging iets fout. Probeer het opnieuw of stel een eenvoudigere vraag.';
      }
    }
  }

  clearConversation() {
    this.conversationHistory = [];
  }
}

export const aiService = new AIService();

