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

const FutureTermsOfService: React.FC = () => {
  return (
    <PageContainer>
      <ContentWrapper>
        <BackLink to="/">&larr; Back to Home</BackLink>
        <Content>
          <h1>Terms of Service</h1>
          <EffectiveDate>Future: Investment Portfolio Manager &mdash; Last Updated: February 9, 2026</EffectiveDate>

          <h2>1. Acceptance of Terms</h2>
          <p>By downloading, installing, or using Future - Investment Portfolio Manager (the "App"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the App.</p>

          <h2>2. Description of Service</h2>
          <p>Future is an investment portfolio tracking and management application that allows users to:</p>
          <ul>
            <li>Track and manage investment portfolios across multiple asset classes</li>
            <li>Monitor real-time market prices and portfolio performance</li>
            <li>Set and track financial goals</li>
            <li>Receive financial news and market updates</li>
            <li>Access AI-powered investment insights (premium feature)</li>
            <li>Export portfolio data as PDF reports (premium feature)</li>
            <li>Customize app themes (premium feature)</li>
          </ul>

          <h2>3. User Responsibilities</h2>

          <h3>3.1 Accurate Information</h3>
          <p>You are responsible for ensuring the accuracy of all investment data you enter into the App. We are not liable for any losses or damages resulting from incorrect data entry.</p>

          <h3>3.2 Investment Decisions</h3>
          <p>The App is a portfolio tracking tool only. It does not provide investment advice, recommendations, or financial planning services. All investment decisions are your sole responsibility.</p>

          <h3>3.3 Account Security</h3>
          <p>You are responsible for maintaining the security of your device and protecting access to the App. Use your device's security features (passcode, Face ID, Touch ID) to prevent unauthorized access.</p>

          <h3>3.4 Prohibited Uses</h3>
          <p>You agree not to:</p>
          <ul>
            <li>Use the App for any illegal purposes</li>
            <li>Attempt to reverse engineer, decompile, or disassemble the App</li>
            <li>Remove, obscure, or alter any proprietary notices in the App</li>
            <li>Use automated systems or software to extract data from the App</li>
            <li>Interfere with or disrupt the App's functionality</li>
            <li>Violate any applicable laws or regulations while using the App</li>
          </ul>

          <h2>4. Disclaimer of Investment Advice</h2>
          <p><strong>IMPORTANT:</strong> Future is NOT a financial advisor, broker, or investment advisor. The App:</p>
          <ul>
            <li>Does not provide personalized investment advice</li>
            <li>Does not recommend specific securities or investment strategies</li>
            <li>Does not guarantee any investment returns or outcomes</li>
            <li>Should not be used as the sole basis for investment decisions</li>
          </ul>
          <p>All market data, news, and AI-generated insights are for informational purposes only. Consult with a licensed financial advisor before making investment decisions.</p>

          <h2>5. Data Accuracy and Market Information</h2>

          <h3>5.1 Market Data</h3>
          <p>We strive to provide accurate real-time market data, but we do not guarantee:</p>
          <ul>
            <li>The accuracy, completeness, or timeliness of market prices</li>
            <li>Uninterrupted access to market data feeds</li>
            <li>The absence of errors or omissions in third-party data</li>
          </ul>

          <h3>5.2 No Liability</h3>
          <p>We are not liable for any investment losses resulting from:</p>
          <ul>
            <li>Delayed or inaccurate market data</li>
            <li>Service interruptions or outages</li>
            <li>Errors in portfolio calculations</li>
            <li>Technical malfunctions</li>
          </ul>

          <h2>6. Premium Features and Subscriptions</h2>

          <h3>6.1 Premium Subscription</h3>
          <p>Certain features require a paid subscription, including:</p>
          <ul>
            <li>AI-powered chatbot for investment insights</li>
            <li>PDF export functionality</li>
            <li>Access to all premium themes</li>
            <li>Priority customer support</li>
            <li>Future premium features</li>
          </ul>

          <h3>6.2 Billing and Payment</h3>
          <ul>
            <li>Subscriptions are billed through Apple's App Store</li>
            <li>Prices are displayed in the App and may vary by region</li>
            <li>Payment is charged to your Apple ID account at confirmation of purchase</li>
            <li>Subscriptions automatically renew unless canceled at least 24 hours before the end of the current period</li>
            <li>Your account will be charged for renewal within 24 hours prior to the end of the current period</li>
          </ul>

          <h3>6.3 Free Trial</h3>
          <p>If a free trial is offered:</p>
          <ul>
            <li>You will be charged the subscription fee after the trial period ends</li>
            <li>You can cancel anytime during the trial period without charge</li>
            <li>Cancellation must occur at least 24 hours before the trial ends to avoid charges</li>
          </ul>

          <h3>6.4 Cancellation</h3>
          <ul>
            <li>You can cancel your subscription anytime through your App Store account settings</li>
            <li>Cancellation takes effect at the end of the current billing period</li>
            <li>No refunds are provided for partial subscription periods</li>
            <li>You retain access to premium features until the end of your paid period</li>
          </ul>

          <h3>6.5 Price Changes</h3>
          <p>We reserve the right to change subscription prices with 30 days' notice. Price changes do not affect existing subscriptions during their current billing period.</p>

          <h2>7. Intellectual Property</h2>

          <h3>7.1 Ownership</h3>
          <p>The App, including all content, features, functionality, design, graphics, and software, is owned by Future and protected by international copyright, trademark, and intellectual property laws.</p>

          <h3>7.2 Limited License</h3>
          <p>We grant you a limited, non-exclusive, non-transferable, revocable license to use the App for personal, non-commercial purposes, subject to these Terms.</p>

          <h3>7.3 Your Data</h3>
          <p>You retain all ownership rights to your investment data entered into the App. By using the App, you grant us a license to store and process your data solely to provide App functionality.</p>

          <h2>8. Privacy and Data Protection</h2>
          <p>Your use of the App is also governed by our Privacy Policy, which is incorporated into these Terms by reference. Please review our Privacy Policy to understand how we collect, use, and protect your information.</p>

          <h2>9. Limitation of Liability</h2>
          <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</p>

          <h3>9.1 No Warranties</h3>
          <p>The App is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.</p>

          <h3>9.2 Limitation of Damages</h3>
          <p>In no event shall Future, its officers, directors, employees, or agents be liable for:</p>
          <ul>
            <li>Any indirect, incidental, special, consequential, or punitive damages</li>
            <li>Loss of profits, revenue, data, or use</li>
            <li>Investment losses or financial damages</li>
            <li>Damages exceeding the amount you paid for the App in the past 12 months</li>
          </ul>

          <h3>9.3 User Responsibility</h3>
          <p>You acknowledge that:</p>
          <ul>
            <li>Investment involves risk of loss</li>
            <li>Past performance does not guarantee future results</li>
            <li>You are solely responsible for your investment decisions</li>
            <li>You should consult professional financial advisors</li>
          </ul>

          <h2>10. Indemnification</h2>
          <p>You agree to indemnify, defend, and hold harmless Future, its officers, directors, employees, and agents from any claims, liabilities, damages, losses, or expenses (including attorney's fees) arising from:</p>
          <ul>
            <li>Your use or misuse of the App</li>
            <li>Your violation of these Terms</li>
            <li>Your violation of any rights of another party</li>
            <li>Your investment decisions or losses</li>
          </ul>

          <h2>11. Third-Party Services</h2>
          <p>The App integrates with third-party services for:</p>
          <ul>
            <li>Market data (stocks, cryptocurrencies, precious metals, currencies)</li>
            <li>Financial news</li>
            <li>In-app purchase processing (RevenueCat/Apple)</li>
            <li>AI services (for chatbot functionality)</li>
          </ul>
          <p>We are not responsible for the availability, accuracy, or content of these third-party services. Your use of third-party services is subject to their respective terms and policies.</p>

          <h2>12. App Updates and Modifications</h2>

          <h3>12.1 Updates</h3>
          <p>We may release updates to improve functionality, fix bugs, or add features. Some updates may be required to continue using the App.</p>

          <h3>12.2 Service Changes</h3>
          <p>We reserve the right to:</p>
          <ul>
            <li>Modify or discontinue any feature at any time</li>
            <li>Change these Terms with notice</li>
            <li>Suspend or terminate the App with 30 days' notice</li>
          </ul>

          <h3>12.3 Continued Use</h3>
          <p>Your continued use of the App after updates or changes constitutes acceptance of the modifications.</p>

          <h2>13. Termination</h2>

          <h3>13.1 By You</h3>
          <p>You may stop using the App at any time by deleting it from your device.</p>

          <h3>13.2 By Us</h3>
          <p>We may suspend or terminate your access to the App if you:</p>
          <ul>
            <li>Violate these Terms</li>
            <li>Engage in fraudulent or illegal activities</li>
            <li>Abuse or misuse the App</li>
          </ul>

          <h3>13.3 Effect of Termination</h3>
          <p>Upon termination:</p>
          <ul>
            <li>Your license to use the App ends immediately</li>
            <li>You must delete the App from all devices</li>
            <li>Subscription charges may continue until you cancel through App Store</li>
            <li>We are not liable for any damages resulting from termination</li>
          </ul>

          <h2>14. Geographic Restrictions</h2>
          <p>The App is intended for use worldwide but may not be available in all countries. We make no representation that the App is appropriate or available in all locations. Access to the App from territories where its content is illegal is prohibited.</p>

          <h2>15. Governing Law and Dispute Resolution</h2>

          <h3>15.1 Governing Law</h3>
          <p>These Terms are governed by and construed in accordance with the laws of India, without regard to conflict of law principles.</p>

          <h3>15.2 Dispute Resolution</h3>
          <p>Any disputes arising from these Terms or use of the App shall be resolved through:</p>
          <ol>
            <li>Good faith negotiation between parties</li>
            <li>Binding arbitration (if negotiation fails)</li>
            <li>Courts of India (as a last resort)</li>
          </ol>

          <h3>15.3 Class Action Waiver</h3>
          <p>You agree to resolve disputes on an individual basis and waive the right to participate in class action lawsuits.</p>

          <h2>16. Severability</h2>
          <p>If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.</p>

          <h2>17. Entire Agreement</h2>
          <p>These Terms, together with our Privacy Policy, constitute the entire agreement between you and Future regarding the App and supersede all prior agreements and understandings.</p>

          <h2>18. No Waiver</h2>
          <p>Our failure to enforce any right or provision of these Terms shall not constitute a waiver of that right or provision.</p>

          <h2>19. Contact Information</h2>
          <p>For questions, concerns, or notices regarding these Terms, please contact us at:</p>
          <p>Email: rishiselarka.dev@gmail.com</p>

          <h2>20. Acknowledgment</h2>
          <p>BY USING THE APP, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS OF SERVICE.</p>
        </Content>
      </ContentWrapper>
    </PageContainer>
  )
}

export default FutureTermsOfService
