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
  max-width: 780px;
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
    font-size: 40px;
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
    font-size: 24px;
    font-weight: 600;
    margin-top: 40px;
    margin-bottom: 14px;
    color: var(--text);

    @media (max-width: 768px) {
      font-size: 20px;
      margin-top: 32px;
    }
  }

  p {
    font-size: 16px;
    line-height: 1.85;
    margin-bottom: 16px;
    color: var(--muted);

    @media (max-width: 768px) {
      font-size: 15px;
    }
  }

  ul {
    margin-bottom: 16px;
    padding-left: 24px;
    color: var(--muted);
    line-height: 1.85;
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

const ProductBrief: React.FC = () => {
  return (
    <PageContainer>
      <ContentWrapper>
        <BackLink to="/">← Back to Home</BackLink>
        <Content>
          <h1>Product Brief</h1>
          <p className="subtitle">Future: Investment Portfolio Manager. Problem, Audience & Monetization</p>

          <h2>The Problem</h2>
          <p>
            If you invest in more than one place, you know the frustration. Stocks in one app, gold in another, bonds scribbled in a spreadsheet, real estate and cash somewhere else. To understand your real allocation or how you&apos;re actually doing, you hop between screens, copy numbers, and hope nothing&apos;s outdated. There&apos;s no single place that says: here&apos;s everything you own, here&apos;s what it&apos;s worth right now, and here&apos;s whether your portfolio is healthy or taking on too much risk.
          </p>
          <p>
            Josh @VisualPolitik put it simply: investors juggle stocks, gold, funds, fixed income, and real estate across multiple platforms, messy to track and hard to understand. We built Future because we wanted that problem gone. One app where you log everything, get live prices where the market provides them, set alerts for maturity dates and lock-ins, and finally see your portfolio as a whole, with clear, actionable insights instead of guesswork.
          </p>

          <h2>Target Audience</h2>
          <p>
            Future is for people who take their money seriously. Not day traders. People building wealth over time, across asset classes, who want clarity without jargon. We think about three kinds of users:
          </p>
          <ul>
            <li><strong>Multi-asset investors</strong>. You hold stocks, maybe some crypto, gold or silver, bonds or fixed deposits, perhaps a property or two. You don&apos;t want five different apps. You want one view that shows it all.</li>
            <li><strong>Josh&apos;s community</strong>. Viewers who care about economics, personal finance, and long-term wealth. They&apos;re already diversified; they just need a tool that matches how they think.</li>
            <li><strong>Privacy-minded users</strong>. People who prefer their financial data to stay on their device. No cloud sync, no broker links. You add your numbers, and Future helps you understand them, without ever sending your portfolio to a server.</li>
            <li><strong>Goal-driven savers</strong>. Anyone with targets: a house down payment, an emergency fund, a retirement number. Future lets you track those goals alongside your investments so you see progress in one place.</li>
          </ul>
          <p>
            We don&apos;t ask for sign-up. You can track investments, see charts, and use the free dashboard as an anonymous user. Premium unlocks when you want deeper analysis: risk flags, Future Score, AI help, and PDF exports.
          </p>

          <h2>Monetization Strategy</h2>
          <p>
            Future uses a <strong>freemium model</strong> powered by RevenueCat. The free tier gives you the dashboard, charts, asset list, timeline alerts, and basic tracking, enough to see your portfolio and keep it updated. Future Pro adds what serious investors actually want: a 0–100 Future Score, risk flags that spell out concentration and diversification issues, personalized suggestions, an AI chatbot that knows your holdings, PDF exports for records or advisors, and premium themes.
          </p>
          <p>
            <strong>Pricing:</strong> Monthly is $2.99; yearly is $24.99 (about two months free). We kept it low on purpose. Portfolio analysis shouldn&apos;t cost a fortune. At under three dollars a month, it&apos;s an easy yes for anyone who&apos;s already putting real money to work.
          </p>
          <p>
            <strong>Why it converts:</strong> Users see locked insights and immediately get it: they&apos;re missing clarity on risk, a health score for their portfolio, and AI help grounded in their actual data. The paywall explains this up front. We highlight the annual plan as best value, and Restore Purchases is always visible for people who already subscribed elsewhere.
          </p>
          <p>
            <strong>Long-term thinking:</strong> The more you use Future, the more valuable it becomes. Add more assets, and the analytics get smarter. Set goals, and the timeline keeps you on track. We&apos;re not chasing quick upgrades; we want people to stay because the app earns its place. Everything runs locally, so there&apos;s no fear of data leaks or broker connections, just a straightforward tool that helps you understand where you stand.
          </p>

          <p style={{ marginTop: 48, opacity: 0.85 }}>
            Future. Your present investments decide your future.
          </p>
        </Content>
      </ContentWrapper>
    </PageContainer>
  )
}

export default ProductBrief
