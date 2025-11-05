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

  code {
    background: rgba(255, 255, 255, 0.1);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 14px;
  }
`

const EffectiveDate = styled.p`
  color: var(--muted);
  font-size: 14px;
  margin-bottom: 32px;
  opacity: 0.7;
`

const PrivacyPolicy: React.FC = () => {
  return (
    <PageContainer>
      <ContentWrapper>
        <BackLink to="/">← Back to Home</BackLink>
        <Content>
          <h1>Privacy Policy</h1>
          <EffectiveDate>Effective Date: September 6, 2025</EffectiveDate>

          <h2>Introduction</h2>
          <p>Welcome to Spenly. We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.</p>
          <p>Please read this Privacy Policy carefully. By using Spenly, you consent to the practices described in this policy.</p>

          <h2>Information We Collect</h2>
          
          <h3>Personal Data</h3>
          <p>We may collect the following types of information:</p>
          <ul>
            <li><strong>Account Information</strong>: When you create an account, we may collect your name, email address, and other information you provide.</li>
            <li><strong>Financial Information</strong>: Transaction details, including amounts, dates, categories, and notes. This information is stored locally on your device and, if you enable iCloud synchronization, in your personal iCloud account.</li>
            <li><strong>Usage Data</strong>: Information about how you use the app, including features accessed, time spent in the app, and interaction with the interface.</li>
            <li><strong>Device Information</strong>: Information about your mobile device, including device type, operating system, unique device identifiers, IP address, and mobile network information.</li>
          </ul>

          <h3>Tracking Data and Advertising</h3>
          <p>Our app uses Google AdMob to display personalized advertisements to non-Premium subscribers. AdMob may collect and process data about you, including:</p>
          <ul>
            <li>Device identifiers</li>
            <li>IP address</li>
            <li>Location information</li>
            <li>App usage data</li>
            <li>Advertising identifiers (such as Apple's IDFA)</li>
          </ul>
          <p><strong>Important</strong>: Premium subscribers do not see advertisements and are not subject to AdMob data collection for advertising purposes.</p>

          <h2>In-App Purchases and Subscriptions (Spenly Premium)</h2>
          
          <h3>Subscription Data Collection</h3>
          <p>When you purchase Spenly Premium, payment transactions are processed securely through Apple's App Store using Apple's StoreKit framework. We do not collect or store your full payment details, such as credit card numbers.</p>
          <p>We collect and process the following subscription-related data:</p>
          <ul>
            <li><strong>Purchase Confirmation</strong>: Verification that a subscription has been successfully activated</li>
            <li><strong>Subscription Status</strong>: Whether your subscription is active, expired, or canceled</li>
            <li><strong>Product Identifier</strong>: The specific subscription plan you purchased (e.g., com.spenly.monthly.premium)</li>
            <li><strong>Subscription Period</strong>: Duration and renewal dates of your subscription</li>
            <li><strong>Country of Purchase</strong>: Geographic location where the purchase was made (provided by Apple)</li>
          </ul>
          <p>This information is stored locally on your device and, if you enable iCloud synchronization, in your personal iCloud account. We use this information solely to:</p>
          <ul>
            <li>Activate and manage your Premium features</li>
            <li>Ensure proper access control to subscription-only features</li>
            <li>Provide customer support for subscription-related issues</li>
            <li>Comply with legal and financial reporting requirements</li>
          </ul>
          <p>Refunds, billing disputes, and subscription management are handled directly through your Apple ID account settings in accordance with Apple's policies. You can manage your subscription at <a href="https://apps.apple.com/account/subscriptions" target="_blank" rel="noopener noreferrer">https://apps.apple.com/account/subscriptions</a>.</p>

          <h2>How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve our services</li>
            <li>Process and complete transactions</li>
            <li>Send you technical notices and support messages</li>
            <li>Respond to your comments and questions</li>
            <li>Display personalized advertisements through AdMob</li>
            <li>Understand and analyze how you use our app</li>
            <li>Develop new products, services, and features</li>
            <li>Detect, prevent and address technical issues</li>
          </ul>

          <h2>App Tracking Transparency</h2>
          <p>In accordance with Apple's App Tracking Transparency (ATT) framework, we will request your permission before tracking your activity across other companies' apps and websites for the purpose of advertising or sharing with data brokers.</p>
          <p><strong>What This Means</strong>:</p>
          <ul>
            <li>The ATT permission request appears after you sign in to the app</li>
            <li>If you grant permission, AdMob can provide personalized advertisements based on your activity</li>
            <li>If you deny permission, you will still see advertisements, but they will not be personalized</li>
            <li>Premium subscribers do not see advertisements regardless of their ATT choice</li>
          </ul>
          <p><strong>Your Control</strong>: You can change your ATT choice at any time through your device settings:</p>
          <ol>
            <li>Open Settings on your iPhone</li>
            <li>Scroll down and tap "Spenly"</li>
            <li>Toggle "Allow Apps to Request to Track"</li>
            <li>Or go to Settings &gt; Privacy & Security &gt; Tracking to manage all app tracking preferences</li>
          </ol>

          <h2>Data Sharing and Disclosure</h2>
          <p>We may share your information with:</p>
          <ul>
            <li><strong>Service Providers</strong>: Companies that perform services on our behalf, including cloud services, data analysis, email delivery, and hosting services.</li>
            <li><strong>Advertising Partners</strong>: We work with Google AdMob to show advertisements. AdMob may use your information to provide personalized advertisements. You can learn more about how Google uses your information by visiting their Privacy Policy at <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">https://policies.google.com/privacy</a>.</li>
            <li><strong>Legal Requirements</strong>: We may disclose your information if required by law, legal process, or governmental request.</li>
          </ul>

          <h2>Data Security</h2>
          <p>We implement appropriate technical and organizational measures to protect your personal information from unauthorized access, loss, or alteration. However, no method of electronic transmission or storage is 100% secure, and we cannot guarantee absolute security.</p>

          <h2>Your Rights</h2>
          <p>You have the following rights regarding your personal information:</p>
          <ul>
            <li>Access to your personal data</li>
            <li>Correction of inaccurate data</li>
            <li>Deletion of your data</li>
            <li>Restriction or objection to our processing of your data</li>
            <li>Data portability</li>
            <li>Withdrawal of consent</li>
          </ul>
          <p>To exercise these rights, please contact us using the details provided below.</p>

          <h2>Children's Privacy</h2>
          <p>Our app is not directed to children under 13, and we do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe we have collected information from your child, please contact us.</p>

          <h2>Changes to This Privacy Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Effective Date" at the top.</p>

          <h2>Contact Us</h2>
          <p>If you have questions or concerns about this Privacy Policy, please contact us at:</p>
          <p>Email: teamspenlyapp@gmail.com</p>

          <h2>Our Location</h2>
          <p>Spenly is operated from India. If you are located outside of India, please note that your information may be transferred to and processed in India.</p>

          <h2>Legal Compliance</h2>
          <p>We process your information in accordance with applicable data protection laws. We rely on the following legal bases for processing:</p>
          <ul>
            <li>Performance of our contract with you</li>
            <li>Compliance with legal obligations</li>
            <li>Legitimate interests</li>
            <li>Your consent</li>
          </ul>
          <p>You have the right to lodge a complaint with a relevant supervisory authority if you believe our processing of your personal data violates applicable law.</p>

          <h2>Data Retention</h2>
          <p>We will retain your personal information only for as long as necessary to fulfill the purposes for which we collected it, including to satisfy legal requirements.</p>

          <h2>Third-Party Links and Services</h2>
          <p>Our app may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties, and we encourage you to read their privacy policies.</p>
        </Content>
      </ContentWrapper>
    </PageContainer>
  )
}

export default PrivacyPolicy
