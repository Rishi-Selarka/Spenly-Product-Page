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

const TermsOfService: React.FC = () => {
  return (
    <PageContainer>
      <ContentWrapper>
        <BackLink to="/">← Back to Home</BackLink>
        <Content>
          <h1>Terms of Service</h1>
          <EffectiveDate>Effective Date: September 6, 2025</EffectiveDate>

          <h2>Introduction</h2>
          <p>Welcome to Spenly. These Terms of Service ("Terms") govern your use of the Spenly mobile application ("App") operated by Spenly ("we," "us," or "our"). By downloading, installing, or using our App, you agree to be bound by these Terms. If you disagree with any part of these Terms, you may not access or use our App.</p>

          <h2>Use of the App</h2>
          
          <h3>License</h3>
          <p>Subject to these Terms, we grant you a limited, non-exclusive, non-transferable, revocable license to use the App for your personal, non-commercial purposes.</p>

          <h3>User Accounts</h3>
          <p>When you create an account with us, you must provide accurate, complete, and current information. You are responsible for safeguarding your account credentials and for all activities that occur under your account.</p>

          <h3>Prohibited Uses</h3>
          <p>You agree not to:</p>
          <ul>
            <li>Use the App in any way that violates applicable laws or regulations</li>
            <li>Use the App to transmit any material that is defamatory, offensive, or otherwise objectionable</li>
            <li>Attempt to gain unauthorized access to any portion of the App or any systems or networks connected to the App</li>
            <li>Use the App to develop a competing product</li>
            <li>Reverse engineer, decompile, or attempt to extract the source code of the App</li>
            <li>Remove, alter, or obscure any proprietary notices on the App</li>
          </ul>

          <h2>User Content</h2>
          <p>You retain all rights to any information or data you submit, post, or display on or through the App ("User Content"). By providing User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, copy, modify, and display your User Content in connection with the operation of the App.</p>
          <p>You are solely responsible for your User Content and represent that you have all necessary rights to grant us the license above.</p>

          <h2>Intellectual Property</h2>
          <p>The App and its original content, features, and functionality are and will remain the exclusive property of Spenly and its licensors. The App is protected by copyright, trademark, and other laws of both the United States and foreign countries.</p>
          <p>Our trademarks and trade dress may not be used in connection with any product or service without our prior written consent.</p>

          <h2>Advertisements</h2>
          <p>The App may display advertisements provided by third parties, including Google AdMob. These advertisements may collect and use information about you to provide you with targeted advertising. This is subject to the privacy policies of the respective advertising providers.</p>

          <h2>Subscription and Payments</h2>
          <p>If we offer any paid services or subscriptions:</p>
          <ul>
            <li>You agree to pay all fees or charges to your account based on the fees, charges, and billing terms in effect at the time a fee or charge is due and payable.</li>
            <li>The provision of the paid service is conditioned upon your payment of the applicable fees.</li>
            <li>Payment must be made by the methods specified within the App.</li>
            <li>You are responsible for all charges incurred under your account, including applicable taxes.</li>
          </ul>

          <h2>Spenly Premium Subscription Terms</h2>
          
          <h3>Overview</h3>
          <p>Spenly Premium is an optional auto-renewable subscription that provides users with enhanced features, including:</p>
          <ul>
            <li>Ad-free experience (no banner or interstitial advertisements)</li>
            <li>Premium themes (25+ exclusive color schemes)</li>
            <li>Custom fonts (40+ typography options)</li>
            <li>Export functionality (PDF and CSV exports)</li>
            <li>Unlimited accounts and categories</li>
            <li>Priority customer support</li>
          </ul>

          <h3>Subscription Details</h3>
          <p><strong>Product Name</strong>: Spenly Premium Monthly<br />
          <strong>Product ID</strong>: com.spenly.monthly.premium<br />
          <strong>Duration</strong>: 1 month (auto-renewing)<br />
          <strong>Price</strong>: The subscription price is displayed in the App Store and varies by region. Prices include applicable local taxes.</p>

          <h3>Payment & Billing</h3>
          <p>Payment for Spenly Premium is processed through Apple's App Store using your Apple ID at the time of purchase confirmation. By purchasing a subscription, you agree that:</p>
          <ul>
            <li>All fees, including applicable taxes, will be charged to your Apple account</li>
            <li>Payment is charged immediately upon confirmation of purchase</li>
            <li>Your subscription will continue indefinitely until canceled</li>
          </ul>

          <h3>Auto-Renewal</h3>
          <p><strong>Important</strong>: Spenly Premium is an auto-renewable subscription. This means:</p>
          <ul>
            <li>Your subscription automatically renews at the end of each billing cycle (monthly)</li>
            <li>Your Apple account will be charged for renewal within 24 hours prior to the end of the current subscription period</li>
            <li>The renewal charge will be at the same price as the initial subscription, unless you are notified of a price change in advance</li>
            <li>You will continue to have access to Premium features as long as your subscription remains active</li>
          </ul>

          <h3>Cancellation</h3>
          <p>You can cancel your subscription at any time to stop future charges. To cancel:</p>
          <ol>
            <li>Open the Settings app on your iPhone</li>
            <li>Tap your name at the top</li>
            <li>Tap "Subscriptions"</li>
            <li>Select "Spenly Premium"</li>
            <li>Tap "Cancel Subscription"</li>
          </ol>
          <p><strong>Or visit</strong>: <a href="https://apps.apple.com/account/subscriptions" target="_blank" rel="noopener noreferrer">https://apps.apple.com/account/subscriptions</a></p>
          <p><strong>Important Cancellation Terms</strong>:</p>
          <ul>
            <li>You must cancel at least 24 hours before the end of your current billing period to avoid being charged for the next period</li>
            <li>Cancellation takes effect at the end of your current billing cycle</li>
            <li>You will retain Premium access until the end of the paid period</li>
            <li>No partial refunds are provided for the current subscription period</li>
          </ul>

          <h3>Refunds</h3>
          <p>All subscription purchases are final and non-refundable, except as required by applicable law or as provided under Apple's refund policies.</p>
          <p>To request a refund:</p>
          <ul>
            <li>Contact Apple Support directly through the App Store</li>
            <li>Refund requests are evaluated by Apple on a case-by-case basis</li>
            <li>We do not process refunds directly; all refund decisions are made by Apple</li>
          </ul>

          <h3>Free Trial (If Applicable)</h3>
          <p>If we offer a free trial period:</p>
          <ul>
            <li>You will have access to all Premium features during the trial</li>
            <li>You will not be charged during the trial period</li>
            <li>Your subscription will automatically begin, and payment will be charged, when the trial ends unless you cancel before the trial period expires</li>
            <li>You can cancel anytime during the trial without being charged</li>
          </ul>

          <h3>Changes to Pricing or Features</h3>
          <p>We reserve the right to modify subscription pricing, features, or available tiers at any time. If we make material changes:</p>
          <ul>
            <li>Existing subscribers will be notified via the App or email at least 30 days before changes take effect</li>
            <li>Price increases will not affect your current subscription period; changes apply at the next renewal</li>
            <li>If you do not agree to the new pricing or terms, you may cancel your subscription</li>
            <li>Continued use of the subscription after changes take effect constitutes acceptance of the updated terms</li>
          </ul>

          <h3>Subscription Management</h3>
          <p>You can view, modify, or cancel your subscription at any time through:</p>
          <ul>
            <li>Your iPhone Settings &gt; [Your Name] &gt; Subscriptions</li>
            <li>App Store &gt; Account &gt; Subscriptions</li>
            <li><a href="https://apps.apple.com/account/subscriptions" target="_blank" rel="noopener noreferrer">https://apps.apple.com/account/subscriptions</a></li>
          </ul>

          <h2>Termination</h2>
          <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including without limitation if you breach these Terms.</p>
          <p>Upon termination, your right to use the App will immediately cease. If you wish to terminate your account, you may simply discontinue using the App or delete your account through the App's settings.</p>

          <h2>Disclaimer of Warranties</h2>
          <p>THE APP IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.</p>
          <p>We do not warrant that:</p>
          <ul>
            <li>The App will function uninterrupted, secure, or available at any particular time or location</li>
            <li>Any errors or defects will be corrected</li>
            <li>The App is free of viruses or other harmful components</li>
            <li>The results of using the App will meet your requirements</li>
          </ul>

          <h2>Limitation of Liability</h2>
          <p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL SPENLY, ITS AFFILIATES, DIRECTORS, EMPLOYEES, AGENTS, OR LICENSORS BE LIABLE FOR ANY INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES, INCLUDING WITHOUT LIMITATION DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR RELATING TO YOUR USE OF, OR INABILITY TO USE, THE APP.</p>
          <p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, SPENLY ASSUMES NO LIABILITY OR RESPONSIBILITY FOR ANY:</p>
          <ul>
            <li>Errors, mistakes, or inaccuracies of content</li>
            <li>Personal injury or property damage resulting from your access to or use of the App</li>
            <li>Unauthorized access to or use of our secure servers and/or any personal information stored therein</li>
            <li>Interruption or cessation of transmission to or from the App</li>
            <li>Bugs, viruses, Trojan horses, or the like that may be transmitted by third parties</li>
          </ul>

          <h2>Indemnification</h2>
          <p>You agree to defend, indemnify, and hold harmless Spenly, its affiliates, licensors, and service providers, and its and their respective officers, directors, employees, contractors, agents, licensors, suppliers, successors, and assigns from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to your violation of these Terms or your use of the App.</p>

          <h2>Financial Advice Disclaimer</h2>
          <p>The content provided in the App is for informational purposes only and should not be considered financial advice. We are not licensed financial advisors, and the App is not intended to provide investment, tax, or legal advice. You should consult with qualified professionals regarding your specific financial situation.</p>

          <h2>Governing Law</h2>
          <p>These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.</p>

          <h2>Changes to Terms</h2>
          <p>We reserve the right to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
          <p>By continuing to access or use our App after those revisions become effective, you agree to be bound by the revised Terms.</p>

          <h2>Third-Party Services</h2>
          <p>The App may contain links to third-party websites or services that are not owned or controlled by Spenly. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services.</p>

          <h2>Severability</h2>
          <p>If any provision of these Terms is held to be unenforceable or invalid, such provision will be changed and interpreted to accomplish the objectives of such provision to the greatest extent possible under applicable law, and the remaining provisions will continue in full force and effect.</p>

          <h2>Waiver</h2>
          <p>Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.</p>

          <h2>Entire Agreement</h2>
          <p>These Terms constitute the entire agreement between us regarding our App and supersede and replace any prior agreements we might have had between us regarding the App.</p>

          <h2>Contact Us</h2>
          <p>If you have any questions about these Terms, please contact us at:</p>
          <p>Email: teamspenlyapp@gmail.com</p>
        </Content>
      </ContentWrapper>
    </PageContainer>
  )
}

export default TermsOfService
