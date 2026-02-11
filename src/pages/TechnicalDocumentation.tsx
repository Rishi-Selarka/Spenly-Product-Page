import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

const PageContainer = styled.div`
  min-height: 100vh;
  background: #000000;
  color: var(--text);
  padding: 40px 20px 80px;
`

const ContentWrapper = styled.div`
  max-width: 860px;
  margin: 0 auto;
`

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--brand);
  text-decoration: none;
  font-size: 14px;
  margin-bottom: 32px;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
  }
`

const Content = styled.div`
  h1 {
    font-size: 42px;
    font-weight: 700;
    margin-bottom: 12px;
    color: var(--text);

    @media (max-width: 768px) {
      font-size: 32px;
    }
  }

  .subtitle {
    font-size: 15px;
    color: var(--muted);
    margin-bottom: 40px;
  }

  h2 {
    font-size: 26px;
    font-weight: 600;
    margin-top: 48px;
    margin-bottom: 16px;
    color: var(--text);

    @media (max-width: 768px) {
      font-size: 22px;
      margin-top: 36px;
    }
  }

  h3 {
    font-size: 18px;
    font-weight: 600;
    margin-top: 28px;
    margin-bottom: 12px;
    color: var(--text);
  }

  p {
    font-size: 16px;
    line-height: 1.8;
    margin-bottom: 16px;
    color: var(--muted);

    @media (max-width: 768px) {
      font-size: 15px;
    }
  }

  ul, ol {
    margin-bottom: 16px;
    padding-left: 24px;
    color: var(--muted);
    line-height: 1.8;
  }

  li {
    margin-bottom: 8px;
  }

  strong {
    color: var(--text);
    font-weight: 600;
  }

  a {
    color: var(--brand);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`

const CodeBlock = styled.pre`
  background: #0d1117;
  border: 1px solid #21262d;
  border-radius: 12px;
  padding: 20px;
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.6;
  color: #e6edf3;
  margin: 24px 0;

  code {
    font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
  }
`

const TableWrapper = styled.div`
  overflow-x: auto;
  margin: 20px 0;
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  th, td {
    padding: 12px 16px;
    text-align: left;
    border-bottom: 1px solid var(--border);
  }

  th {
    color: var(--text);
    font-weight: 600;
  }

  td {
    color: var(--muted);
  }
`

const Divider = styled.hr`
  border: none;
  height: 1px;
  background: var(--border);
  margin: 40px 0;
`

const TechnicalDocumentation: React.FC = () => {
  return (
    <PageContainer>
      <ContentWrapper>
        <BackLink to="/">← Back to Home</BackLink>
        <Content>
          <h1>Technical Documentation</h1>
          <p className="subtitle">Future: Investment Portfolio Manager — Architecture, Tech Stack & RevenueCat Implementation</p>

          <p>
            Future is an iOS investment portfolio tracker built for investors who want to consolidate fragmented holdings (stocks, crypto, gold, bonds, real estate, cash) into one app with live prices, risk analysis, and premium insights.
          </p>

          <h2>Tech Stack</h2>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <th>Layer</th>
                  <th>Technology</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Language</td><td>Swift</td></tr>
                <tr><td>UI</td><td>SwiftUI</td></tr>
                <tr><td>Persistence</td><td>SwiftData (on-device)</td></tr>
                <tr><td>Monetization</td><td>RevenueCat iOS SDK</td></tr>
                <tr><td>Charts</td><td>Swift Charts</td></tr>
                <tr><td>PDF Export</td><td>PDFKit</td></tr>
                <tr><td>Platform</td><td>iOS 17+</td></tr>
                <tr><td>Distribution</td><td>TestFlight</td></tr>
              </tbody>
            </Table>
          </TableWrapper>

          <h2>Architecture Overview</h2>
          <p>
            The app uses a <strong>SwiftUI + Services</strong> architecture with environment-injected managers and <code>@Observable</code> state. Portfolio data is stored locally with SwiftData. No backend or cloud sync—everything stays on device for privacy.
          </p>
          <p>Key design decisions: <strong>local-first</strong> data, <strong>offline support</strong> via a price cache, and <strong>anonymous monetization</strong> via RevenueCat (no sign-up required).</p>

          <h3>Data layer: SwiftData schema</h3>
          <p>
            We use three SwiftData models. <strong>Asset</strong> is the core: a unified model for stocks, crypto, gold, bonds, real estate, and cash. Each asset type has different fields—stocks use <code>quantity</code> and <code>tickerSymbol</code>; gold uses <code>weight</code> and <code>weightUnit</code>; bonds use <code>maturityDate</code> and <code>interestRate</code>. Storing them in one model simplifies queries and charts. Enums like <code>AssetType</code> and <code>AssetClass</code> are persisted as raw strings for SwiftData compatibility.
          </p>
          <p>
            <strong>PriceCache</strong> stores symbol → price → lastUpdated for market-linked assets. When the app is offline or an API fails, we read from this cache so portfolio values still display. <strong>Goal</strong> tracks savings targets and deadlines.
          </p>

          <h2>RevenueCat Implementation</h2>
          <p>
            Future uses <a href="https://docs.revenuecat.com/docs" target="_blank" rel="noopener noreferrer">RevenueCat</a> for subscription management. The integration follows their recommended patterns for configuration, entitlement checks, and purchase flows.
          </p>

          <h3>1. Early initialization</h3>
          <p>RevenueCat is configured in the app's <code>init</code> before any view loads, and premium status is checked on launch:</p>
          <CodeBlock>
            <code>{`@main
struct FutureApp: App {
    init() {
        RevenueCatManager.configure()  // SDK setup at launch
        clearAppBadge()
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(revenueCatManager)
                .task {
                    await revenueCatManager.checkPremiumStatus()
                }
        }
        .modelContainer(sharedModelContainer)
    }
}`}</code>
          </CodeBlock>

          <h3>2. Entitlement and purchase flow</h3>
          <p>The <code>RevenueCatManager</code> is an <code>@Observable</code> singleton that wraps Purchases and exposes <code>isPremium</code> based on the "Future Pro" entitlement. Purchase and restore flows use async/await with proper error handling and MainActor updates:</p>
          <CodeBlock>
            <code>{`@Observable
final class RevenueCatManager {
    static let shared = RevenueCatManager()
    var isPremium: Bool = false
    var offerings: Offerings?
    var currentOffering: Offering?

    static func configure() {
        Purchases.configure(withAPIKey: "appl_...")
    }

    func checkPremiumStatus() async {
        do {
            let customerInfo = try await Purchases.shared.customerInfo()
            await MainActor.run {
                self.isPremium = customerInfo.entitlements["Future Pro"]?.isActive == true
            }
        } catch { /* Handle gracefully */ }
    }

    func purchase(_ package: Package) async -> Bool {
        let result = try await Purchases.shared.purchase(package: package)
        self.isPremium = result.customerInfo.entitlements["Future Pro"]?.isActive == true
        return isPremium
    }
}`}</code>
          </CodeBlock>

          <p><strong>Documentation:</strong> <a href="https://docs.revenuecat.com/docs/getting-started/configuring-sdk" target="_blank" rel="noopener noreferrer">Configuring the SDK</a> · <a href="https://docs.revenuecat.com/docs/tools/paywalls" target="_blank" rel="noopener noreferrer">Paywalls</a></p>

          <h3>3. Paywall gating and premium features</h3>
          <p>
            Premium features (Future Score, risk flags, AI chatbot, PDF export) are gated by <code>revenueCat.isPremium</code>. When a user taps Insights or ChatBot without a subscription, we present a native SwiftUI paywall sheet. The paywall shows feature benefits, package options (monthly vs annual), and a restore purchases link. All state updates run on the MainActor so the UI reflects subscription status immediately after purchase.
          </p>

          <Divider />

          <h2>Multi-API price service</h2>
          <p>
            Different financial APIs have different coverage and rate limits. Twelve Data handles international stocks; Finnhub focuses on US markets; Alpha Vantage has stricter limits. Instead of depending on one provider, we use a <strong>fallback chain</strong>: try the primary API, then the next, then the last. That keeps the app working even when one provider is rate-limited or down.
          </p>
          <p>
            We also <strong>deduplicate requests</strong> during batch refresh: if five assets use AAPL, we fetch AAPL once and apply the price to all of them. For gold and silver, we fetch spot prices per currency (USD, INR, etc.) and convert from troy ounce to grams so users can enter weight in their preferred unit.
          </p>
          <h3>Stock price fallback logic</h3>
          <CodeBlock>
            <code>{`func fetchStockPrice(ticker: String) async throws -> Double {
    do {
        return try await fetchStockPriceTwelveData(ticker: ticker)
    } catch {
        do {
            return try await fetchStockPriceFinnhub(ticker: ticker)
        } catch {
            return try await fetchStockPriceAlphaVantage(ticker: ticker)
        }
    }
}`}</code>
          </CodeBlock>
          <p>
            Results are written to the <code>PriceCache</code> SwiftData model after each successful fetch. On the next app launch or refresh, we first try the API; on failure we read from cache and show a "last updated" timestamp so users know the data may be stale.
          </p>

          <h2>Future Score algorithm</h2>
          <p>
            Premium insights include a <strong>Future Score</strong> (0–100) that measures portfolio health. We chose deterministic rules over black-box ML so users can understand why their score changes. The score has three parts:
          </p>
          <ul>
            <li><strong>Diversification (0–35):</strong> Rewards having multiple asset classes (equity, commodity, fixed income, alternative, cash). Applies a concentration penalty: if any single asset is &gt;30% of the portfolio, the score drops. Above 50% concentration we cap the diversification component to zero.</li>
            <li><strong>Asset Balance (0–35):</strong> Starts at 35 and deducts for common issues: equity overweight (&gt;60%), no fixed income, no cash buffer, no alternatives, or any single class dominating (&gt;80%).</li>
            <li><strong>Country Spread (0–30):</strong> Rewards geographic diversification. More countries = higher score. We also penalize single-country concentration above 50%.</li>
          </ul>
          <p>
            The total is <code>min(diversification + assetBalance + countrySpread, 100)</code>. We surface the sub-scores in the UI so users can see exactly which area to improve.
          </p>
          <CodeBlock>
            <code>{`func computeFutureScore() -> FutureScore {
    guard !assets.isEmpty else {
        return FutureScore(total: 0, diversification: 0, assetBalance: 0, countrySpread: 0)
    }
    let diversification = computeDiversificationScore()
    let assetBalance = computeAssetBalanceScore()
    let countrySpread = computeCountrySpreadScore()
    let total = min(diversification + assetBalance + countrySpread, 100)
    return FutureScore(total: total, diversification: diversification,
                      assetBalance: assetBalance, countrySpread: countrySpread)
}`}</code>
          </CodeBlock>

          <h2>Risk flags and suggestions</h2>
          <p>
            Beyond the Future Score, we generate <strong>risk flags</strong> and <strong>suggestions</strong> from the same portfolio data. Flags are rule-based: we check equity percentage, country concentration, presence of fixed income and cash, and single-asset concentration. Each flag has a severity (high/medium/low) and a plain-language description. Suggestions are contextual—e.g. "Consider geographic diversification" if the user has investments in only one or two countries, or "Add fixed income" if the allocation is below 15%.
          </p>
          <p>
            Both run synchronously on the main portfolio snapshot. No external APIs are called—everything is computed locally from the assets already in SwiftData. That keeps the Insights tab fast and usable offline.
          </p>

          <h2>AI chatbot and portfolio context</h2>
          <p>
            The premium AI chatbot uses <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer">OpenRouter</a> with a model that receives a <strong>system prompt</strong> containing the user's full portfolio: asset names, types, values, gain/loss, country exposure, and goals. The model is instructed to answer only investment-related questions and to reference the user's actual holdings. We stream the response using Server-Sent Events (SSE) so text appears progressively instead of waiting for the full reply. Markdown is stripped before display since we use plain SwiftUI Text.
          </p>

          <h2>Async and threading</h2>
          <p>
            Network calls (price fetches, RevenueCat, AI chat) run in async tasks. SwiftUI views update on the main thread, so we use <code>await MainActor.run &#123; ... &#125;</code> whenever we mutate observable state from a background task. That prevents UI flicker and ensures subscription status, loading indicators, and error messages update correctly. The paywall and premium-gated views react to <code>revenueCat.isPremium</code> via SwiftUI's observation system, so they re-render automatically when a purchase completes.
          </p>

          <Divider />

          <h2>External documentation</h2>
          <ul>
            <li><a href="https://docs.revenuecat.com/docs" target="_blank" rel="noopener noreferrer">RevenueCat iOS Documentation</a></li>
            <li><a href="https://developer.apple.com/documentation/swiftui" target="_blank" rel="noopener noreferrer">SwiftUI Documentation</a></li>
            <li><a href="https://developer.apple.com/documentation/swiftdata" target="_blank" rel="noopener noreferrer">SwiftData Documentation</a></li>
          </ul>

          <p style={{ marginTop: 32, opacity: 0.8 }}>
            Future — Your present investments decide your future.
          </p>
        </Content>
      </ContentWrapper>
    </PageContainer>
  )
}

export default TechnicalDocumentation
