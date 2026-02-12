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
          <p className="subtitle">Future: Investment Portfolio Manager — Problem, Audience & Monetization</p>

          <h2>The Problem</h2>
          <p>
            Investors today hold fragmented portfolios across many platforms: stocks in a brokerage app, gold in a separate tracker, bonds in spreadsheets, real estate and cash elsewhere. Getting a true picture of allocation, risk, and performance means switching between apps and manual aggregation. There is no single place to log everything, see live updates where possible, set maturity alerts for illiquid assets, or understand portfolio health at a glance.
          </p>
          <p>
            Josh @VisualPolitik articulated this clearly: investors juggle stocks, gold, funds, fixed income, and real estate across multiple platforms—messy to track and hard to understand. Future solves this by consolidating all holdings into one app, with real-time prices for market-linked assets, manual entry for the rest, and premium risk and diversification analysis to make sense of it all.
          </p>

          <h2>Target Audience</h2>
          <p>
            Future is built for <strong>serious retail investors</strong> who care about their financial future and want clarity without complexity. Specifically:
          </p>
          <ul>
            <li><strong>Multi-asset holders</strong> — People who invest in stocks, crypto, gold, bonds, real estate, or cash. They need one portfolio view, not five disconnected apps.</li>
            <li><strong>Josh @VisualPolitik&apos;s community</strong> — Viewers who follow news, economics, and personal finance and are actively building wealth across asset classes.</li>
            <li><strong>Privacy-conscious users</strong> — Those who prefer local data storage over cloud sync and want full control of their financial information.</li>
            <li><strong>Goal-oriented savers</strong> — Users who set targets (house down payment, emergency fund, etc.) and want to track progress alongside their portfolio.</li>
          </ul>
          <p>
            The app assumes no sign-up: anonymous users can track investments, see charts, and use the free dashboard. Premium features unlock for subscribers who want deeper insights.
          </p>

          <h2>Monetization Strategy</h2>
          <p>
            Future uses a <strong>freemium subscription model</strong> powered by RevenueCat. The free tier includes dashboard, charts, asset list, timeline alerts, and basic tracking. Premium (Future Pro) adds Future Score, risk flags, personalized suggestions, AI chatbot, PDF export, and premium themes.
          </p>
          <p>
            <strong>Why it converts:</strong> The value is clear. Users see locked insights and understand what they&apos;re missing: actionable risk analysis, a 0–100 portfolio health score, and AI assistance grounded in their actual holdings. The paywall explains these benefits up front. We offer monthly and annual plans, with the annual plan positioned as best value. Restore purchases is always visible for users who already subscribe on another device.
          </p>
          <p>
            <strong>Sustainability:</strong> A $4.99/month or equivalent annual subscription is aligned with the value of professional-grade portfolio analysis. Serious investors pay for tools that help them make better decisions. Future delivers that without requiring a broker connection or sharing sensitive data—everything stays on device. The model is designed for long-term retention: the more assets users add, the more useful Future becomes, and the harder it is to leave.
          </p>

          <p style={{ marginTop: 48, opacity: 0.85 }}>
            Future — Your present investments decide your future.
          </p>
        </Content>
      </ContentWrapper>
    </PageContainer>
  )
}

export default ProductBrief
