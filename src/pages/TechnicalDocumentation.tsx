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

          <Divider />

          <h2>Multi-API price service</h2>
          <p>
            Market prices are fetched from multiple providers with a fallback chain to improve reliability. Stocks: Twelve Data → Finnhub → Alpha Vantage. Crypto: Binance public API. Gold/silver: GoldAPI. FX: ExchangeRate-API.
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
          <p>Results are cached in SwiftData for offline use.</p>

          <h2>Future Score algorithm</h2>
          <p>
            Premium insights include a <strong>Future Score</strong> (0–100) computed from three components: Diversification (0–35), Asset Balance (0–35), and Country Spread (0–30). The algorithm uses deterministic rules and concentration penalties for transparency.
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
