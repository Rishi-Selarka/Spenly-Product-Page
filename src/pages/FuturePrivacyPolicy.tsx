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
  max-width: 800px;
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
    font-size: 48px;
    font-weight: 700;
    margin-bottom: 16px;
    color: var(--text);

    @media (max-width: 768px) {
      font-size: 36px;
    }
  }

  h2 {
    font-size: 28px;
    font-weight: 600;
    margin-top: 48px;
    margin-bottom: 16px;
    color: var(--text);

    @media (max-width: 768px) {
      font-size: 24px;
      margin-top: 36px;
    }
  }

  h3 {
    font-size: 20px;
    font-weight: 600;
    margin-top: 32px;
    margin-bottom: 12px;
    color: var(--text);

    @media (max-width: 768px) {
      font-size: 18px;
    }
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

const EffectiveDate = styled.p`
  color: var(--muted);
  font-size: 14px;
  margin-bottom: 32px;
  opacity: 0.7;
`

const FuturePrivacyPolicy: React.FC = () => {
  return (
    <PageContainer>
      <ContentWrapper>
        <BackLink to="/">&larr; Back to Home</BackLink>
        <Content>
          <h1>Privacy Policy</h1>
          <EffectiveDate>Future: Investment Portfolio Manager &mdash; Last Updated: February 9, 2026</EffectiveDate>

          <h2>Introduction</h2>
          <p>Future ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application Future - Investment Portfolio Manager (the "App"). Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the App.</p>

          <h2>Information We Collect</h2>

          <h3>Personal Data You Provide</h3>
          <p>When you use the App, you may provide us with certain personally identifiable information, including but not limited to:</p>
          <ul>
            <li><strong>Investment Information:</strong> Asset names, types, purchase dates, investment amounts, current values, quantities, ticker symbols, maturity dates, interest rates, and personal notes related to your investments</li>
            <li><strong>Financial Goals:</strong> Goal names, target amounts, deadlines, and progress tracking data</li>
            <li><strong>User Preferences:</strong> Currency preferences, theme selections, and notification settings</li>
            <li><strong>Account Information:</strong> Information related to your in-app purchase subscriptions and transaction history</li>
          </ul>

          <h3>Automatically Collected Information</h3>
          <p>When you use the App, we may automatically collect certain information about your device, including:</p>
          <ul>
            <li><strong>Device Information:</strong> Device type, operating system version, unique device identifiers</li>
            <li><strong>Usage Data:</strong> App features used, interaction patterns, and crash reports</li>
            <li><strong>Analytics Data:</strong> Anonymous usage statistics to improve app functionality and user experience</li>
          </ul>

          <h3>Third-Party Data</h3>
          <ul>
            <li><strong>Market Data:</strong> We retrieve real-time financial market data (stock prices, cryptocurrency prices, commodity prices, currency exchange rates) from third-party APIs to update your portfolio values. This data retrieval does not require sharing your personal information with these services.</li>
            <li><strong>News Data:</strong> We fetch financial news articles from third-party news services to display relevant market information. Your reading preferences are not shared with these services.</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li><strong>Provide Core Functionality:</strong> Store and manage your investment portfolio data, calculate returns, track goals, and display financial analytics</li>
            <li><strong>Send Notifications:</strong> Deliver important alerts about your investments, goal progress, and market updates (only if you grant notification permissions)</li>
            <li><strong>Process Transactions:</strong> Handle in-app purchase subscriptions for premium features through RevenueCat</li>
            <li><strong>Improve Our Services:</strong> Analyze app usage to enhance features, fix bugs, and optimize performance</li>
            <li><strong>Customer Support:</strong> Respond to your inquiries and provide technical assistance</li>
            <li><strong>Legal Compliance:</strong> Comply with applicable laws, regulations, and legal processes</li>
          </ul>

          <h2>Data Storage and Security</h2>

          <h3>Local Data Storage</h3>
          <ul>
            <li>All your investment data is stored <strong>locally on your device</strong> using Apple's SwiftData framework</li>
            <li>Your financial information is <strong>not transmitted to our servers</strong> or any third-party servers</li>
            <li>Data remains under your complete control and can be deleted at any time through the App settings</li>
          </ul>

          <h3>Data Security Measures</h3>
          <p>We implement industry-standard security measures to protect your information:</p>
          <ul>
            <li><strong>Encryption:</strong> All data stored on your device is encrypted using iOS native encryption</li>
            <li><strong>Secure Connections:</strong> All network communications use HTTPS/TLS encryption</li>
            <li><strong>No Cloud Backup:</strong> Your investment data is not automatically backed up to cloud services unless you explicitly enable iCloud backup through your device settings</li>
            <li><strong>Access Controls:</strong> Your data is protected by your device's security features (passcode, Face ID, Touch ID)</li>
          </ul>

          <h2>Third-Party Services</h2>

          <h3>RevenueCat</h3>
          <p>We use RevenueCat to manage in-app purchases and subscriptions. RevenueCat may collect:</p>
          <ul>
            <li>Purchase transaction data</li>
            <li>Subscription status and history</li>
            <li>Anonymous device identifiers</li>
          </ul>
          <p>For more information, please review <a href="https://www.revenuecat.com/privacy" target="_blank" rel="noopener noreferrer">RevenueCat's Privacy Policy</a>.</p>

          <h3>Market Data Providers</h3>
          <p>We retrieve financial data from third-party APIs including:</p>
          <ul>
            <li>Stock and ETF prices</li>
            <li>Cryptocurrency prices</li>
            <li>Precious metals prices</li>
            <li>Currency exchange rates</li>
            <li>Financial news articles</li>
          </ul>
          <p>These services do not receive any of your personal investment data. We only request publicly available market information.</p>

          <h3>Apple Services</h3>
          <p>The App uses Apple's native frameworks and services:</p>
          <ul>
            <li><strong>StoreKit:</strong> For processing in-app purchases</li>
            <li><strong>Push Notifications:</strong> For delivering alerts (requires user permission)</li>
            <li><strong>App Store:</strong> For app distribution and updates</li>
          </ul>
          <p>Your use of Apple services is governed by <a href="https://www.apple.com/legal/privacy/" target="_blank" rel="noopener noreferrer">Apple's Privacy Policy</a>.</p>

          <h2>Push Notifications</h2>
          <p>If you grant notification permissions, we may send you:</p>
          <ul>
            <li>Portfolio performance updates</li>
            <li>Goal achievement notifications</li>
            <li>Market alerts and news</li>
            <li>Subscription and feature updates</li>
          </ul>
          <p>You can disable notifications at any time through your device settings or within the App.</p>

          <h2>Children's Privacy</h2>
          <p>The App is not intended for children under the age of 13. We do not knowingly collect personally identifiable information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us so we can delete such information.</p>

          <h2>Your Privacy Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li><strong>Access Your Data:</strong> View all investment data stored in the App</li>
            <li><strong>Export Your Data:</strong> Export your portfolio data as a PDF document</li>
            <li><strong>Delete Your Data:</strong> Permanently delete all your data through the App's settings</li>
            <li><strong>Opt-Out of Notifications:</strong> Disable push notifications at any time</li>
            <li><strong>Cancel Subscriptions:</strong> Manage or cancel premium subscriptions through your App Store account</li>
          </ul>

          <h3>California Residents (CCPA)</h3>
          <p>If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):</p>
          <ul>
            <li>Right to know what personal information is collected</li>
            <li>Right to delete personal information</li>
            <li>Right to opt-out of the sale of personal information (we do not sell your data)</li>
            <li>Right to non-discrimination for exercising your privacy rights</li>
          </ul>

          <h3>European Users (GDPR)</h3>
          <p>If you are located in the European Economic Area, you have rights under the General Data Protection Regulation (GDPR):</p>
          <ul>
            <li>Right to access, rectify, or erase your personal data</li>
            <li>Right to restrict or object to processing</li>
            <li>Right to data portability</li>
            <li>Right to withdraw consent</li>
            <li>Right to lodge a complaint with a supervisory authority</li>
          </ul>

          <h2>Data Retention</h2>
          <ul>
            <li><strong>Investment Data:</strong> Stored locally on your device until you delete it</li>
            <li><strong>Subscription Data:</strong> Retained by RevenueCat according to their data retention policies</li>
            <li><strong>Analytics Data:</strong> Anonymous usage data is retained for up to 24 months</li>
          </ul>

          <h2>International Data Transfers</h2>
          <p>As your data is stored locally on your device, international data transfers are minimal. However, RevenueCat (for subscriptions) and market data APIs may process data internationally. These services employ appropriate safeguards to protect your information.</p>

          <h2>Changes to This Privacy Policy</h2>
          <p>We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons. We will notify you of any material changes by:</p>
          <ul>
            <li>Updating the "Last Updated" date at the top of this policy</li>
            <li>Displaying a notice within the App</li>
            <li>Sending a push notification (if you have enabled notifications)</li>
          </ul>
          <p>Your continued use of the App after such changes constitutes your acceptance of the updated Privacy Policy.</p>

          <h2>Data Breach Notification</h2>
          <p>In the unlikely event of a data breach that affects your personal information, we will:</p>
          <ul>
            <li>Notify you within 72 hours of discovering the breach</li>
            <li>Provide details about the nature of the breach</li>
            <li>Outline steps we are taking to address the breach</li>
            <li>Recommend actions you can take to protect yourself</li>
          </ul>

          <h2>Third-Party Links</h2>
          <p>The App may contain links to third-party websites or services (such as news articles or financial resources). We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies before providing any personal information.</p>

          <h2>Contact Us</h2>
          <p>If you have questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us at:</p>
          <p>Email: rishiselarka.dev@gmail.com</p>
          <p>For data deletion requests, subscription inquiries, or privacy concerns, please include "Privacy Request" in the subject line.</p>

          <h2>Consent</h2>
          <p>By using the App, you consent to this Privacy Policy and agree to its terms. If you do not agree with this policy, please discontinue use of the App and delete it from your device.</p>
        </Content>
      </ContentWrapper>
    </PageContainer>
  )
}

export default FuturePrivacyPolicy
