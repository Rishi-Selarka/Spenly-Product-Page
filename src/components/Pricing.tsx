import React, { useState } from 'react'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'

const PricingSection = styled.section`
  padding: 100px 20px;
  background: #0a0a0a;
  position: relative;
  overflow: hidden;

  .container {
    max-width: 1200px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
  }

  .section-head {
    text-align: center;
    margin-bottom: 60px;

    h2 {
      font-size: 48px;
      font-weight: 700;
      margin-bottom: 16px;
      background: linear-gradient(135deg, #ffffff 0%, #a0aec0 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    p {
      font-size: 18px;
      color: #94a3b8;
      max-width: 600px;
      margin: 0 auto;
    }
  }

  @media (max-width: 768px) {
    padding: 60px 20px;

    .section-head h2 {
      font-size: 32px;
    }

    .section-head p {
      font-size: 16px;
    }
  }
`

const PricingToggle = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: 50px;
`

const ToggleButton = styled.button<{ active: boolean }>`
  padding: 12px 32px;
  border-radius: 50px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.active 
    ? 'rgba(255, 255, 255, 0.15)' 
    : 'rgba(255, 255, 255, 0.05)'};
  color: ${props => props.active ? '#ffffff' : '#94a3b8'};
  box-shadow: none;

  &:hover {
    transform: translateY(-2px);
    background: ${props => props.active 
      ? 'rgba(255, 255, 255, 0.2)' 
      : 'rgba(255, 255, 255, 0.1)'};
  }
`

const PricingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 40px;
  max-width: 1000px;
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 30px;
  }
`

const PricingCard = styled(motion.div)<{ featured?: boolean }>`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 40px;
  border: 2px solid ${props => props.featured ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-8px);
    border-color: ${props => props.featured ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.2)'};
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }

  @media (max-width: 768px) {
    padding: 30px 20px;
  }
`

const PlanName = styled.h3`
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 12px;
`

const PlanDescription = styled.p`
  font-size: 14px;
  color: #94a3b8;
  margin-bottom: 24px;
  line-height: 1.6;
`

const PriceContainer = styled.div`
  margin-bottom: 32px;
`

const Price = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 8px;

  .currency {
    font-size: 24px;
    font-weight: 600;
    color: #ffffff;
  }

  .amount {
    font-size: 48px;
    font-weight: 700;
    background: linear-gradient(135deg, #ffffff 0%, #2563eb 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .period {
    font-size: 16px;
    color: #94a3b8;
  }
`

const PriceNote = styled.p`
  font-size: 13px;
  color: #64748b;
  font-style: italic;
`

const FeatureList = styled.div`
  margin: 0 0 32px 0;
  flex: 1;
`

const FeaturePillsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
`

const FeaturePill = styled.button<{ active: boolean }>`
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid ${props => props.active ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)'};
  background: ${props => props.active ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)'};
  color: ${props => props.active ? '#ffffff' : '#94a3b8'};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    border-color: rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
  }

  @media (max-width: 768px) {
    font-size: 12px;
    padding: 6px 12px;
  }
`

const FeatureDetails = styled(motion.div)`
  padding: 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);

  .detail-title {
    font-size: 15px;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .detail-description {
    font-size: 14px;
    color: #94a3b8;
    line-height: 1.6;
  }

  @media (max-width: 768px) {
    .detail-title {
      font-size: 14px;
    }

    .detail-description {
      font-size: 13px;
    }
  }
`

const AllFeaturesNote = styled.p`
  font-size: 14px;
  color: #94a3b8;
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  text-align: center;

  strong {
    color: #ffffff;
  }

  @media (max-width: 768px) {
    font-size: 13px;
    padding: 10px;
  }
`

const CTAButton = styled.a<{ primary?: boolean }>`
  width: 100%;
  padding: 16px 32px;
  border-radius: 12px;
  border: 1px solid rgba(37, 99, 235, 0.3);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(
    135deg,
    rgba(37, 99, 235, 0.15) 0%,
    rgba(59, 130, 246, 0.1) 50%,
    rgba(37, 99, 235, 0.15) 100%
  );
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  color: #ffffff;
  box-shadow: 
    0 8px 32px rgba(37, 99, 235, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  text-decoration: none;
  display: block;
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, 
      transparent, 
      rgba(255, 255, 255, 0.3), 
      transparent
    );
  }

  &:hover {
    transform: translateY(-2px);
    background: linear-gradient(
      135deg,
      rgba(37, 99, 235, 0.25) 0%,
      rgba(59, 130, 246, 0.2) 50%,
      rgba(37, 99, 235, 0.25) 100%
    );
    border-color: rgba(37, 99, 235, 0.5);
    box-shadow: 
      0 12px 40px rgba(37, 99, 235, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`

const Pricing: React.FC = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'lifetime'>('lifetime')
  const [selectedFreeFeature, setSelectedFreeFeature] = useState<number | null>(null)
  const [selectedPremiumFeature, setSelectedPremiumFeature] = useState<number | null>(null)

  const freeFeatures = [
    { 
      title: 'Real-time tracking', 
      icon: '⚡',
      description: 'Add expenses and income instantly with smart categorization. Track your spending in seconds.' 
    },
    { 
      title: 'Smart budgeting', 
      icon: '🎯',
      description: 'Set budgets and get helpful alerts to stay on track with your financial goals.' 
    },
    { 
      title: 'Analytics', 
      icon: '📊',
      description: 'View spending patterns, top categories, and monthly insights at a glance.' 
    },
    { 
      title: 'Multi-currency', 
      icon: '💱',
      description: 'Support for 150+ currencies with live exchange rates for global finance management.' 
    },
    { 
      title: 'iCloud sync', 
      icon: '☁️',
      description: 'Keep your data synced across all your Apple devices automatically.' 
    },
    { 
      title: 'Receipt photos', 
      icon: '📸',
      description: 'Attach receipt images to any transaction for better record keeping.' 
    },
    { 
      title: 'Privacy first', 
      icon: '🔒',
      description: 'Your data stays on your device with optional encrypted iCloud backup.' 
    },
    { 
      title: 'AI insights', 
      icon: '🤖',
      description: 'Get basic intelligent insights about your spending patterns.' 
    },
  ]

  const premiumFeatures = [
    { 
      title: 'Ad-free', 
      icon: '✋',
      description: 'Enjoy a completely ad-free experience with no banners or interstitials disrupting your workflow.' 
    },
    { 
      title: 'Premium themes', 
      icon: '🎨',
      description: 'Choose from 25+ beautiful color schemes to personalize your Spenly experience.' 
    },
    { 
      title: 'Custom fonts', 
      icon: 'Aa',
      description: 'Select from 40+ typography options to match your style and improve readability.' 
    },
    { 
      title: 'Export data', 
      icon: '📤',
      description: 'Export your financial data as CSV or PDF files with custom date ranges and advanced filtering options.' 
    },
    { 
      title: 'Templates', 
      icon: '📋',
      description: 'Create quick transaction templates for recurring expenses and save time on data entry.' 
    },
    { 
      title: 'Spenly AI Pro', 
      icon: '🤖',
      description: 'Unlock advanced AI-powered insights, chat assistance, and personalized financial recommendations.' 
    },
  ]

  return (
    <PricingSection id="pricing">
      <div className="container">
        <div className="section-head">
          <h2>Choose Your Plan</h2>
          <p>Start free with all essential features, or unlock premium for the ultimate experience</p>
        </div>

        <PricingToggle>
          <ToggleButton 
            active={billingPeriod === 'monthly'} 
            onClick={() => setBillingPeriod('monthly')}
          >
            Monthly
          </ToggleButton>
          <ToggleButton 
            active={billingPeriod === 'lifetime'} 
            onClick={() => setBillingPeriod('lifetime')}
          >
            Lifetime <span style={{ marginLeft: '8px', color: '#10b981' }}>💎</span>
          </ToggleButton>
        </PricingToggle>

        <PricingGrid>
          {/* Free Plan */}
          <PricingCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <PlanName>Free</PlanName>
            <PlanDescription>
              Everything you need to start managing your finances better
            </PlanDescription>

            <PriceContainer>
              <Price>
                <span className="currency">$</span>
                <span className="amount">0</span>
                <span className="period">/forever</span>
              </Price>
              <PriceNote>No credit card required</PriceNote>
            </PriceContainer>

            <FeatureList>
              <FeaturePillsContainer>
                {freeFeatures.map((feature, index) => (
                  <FeaturePill
                    key={index}
                    active={selectedFreeFeature === index}
                    onClick={() => setSelectedFreeFeature(selectedFreeFeature === index ? null : index)}
                  >
                    {feature.icon} {feature.title}
                  </FeaturePill>
                ))}
              </FeaturePillsContainer>

              <AnimatePresence mode="wait">
                {selectedFreeFeature !== null && (
                  <FeatureDetails
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="detail-title">
                      {freeFeatures[selectedFreeFeature].icon} {freeFeatures[selectedFreeFeature].title}
                    </div>
                    <div className="detail-description">
                      {freeFeatures[selectedFreeFeature].description}
                    </div>
                  </FeatureDetails>
                )}
              </AnimatePresence>
            </FeatureList>

            <CTAButton primary href="https://apps.apple.com/in/app/spenly/id6747989825" target="_blank" rel="noopener noreferrer">Download Now</CTAButton>
          </PricingCard>

          {/* Premium Plan */}
          <PricingCard
            featured
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <PlanName>Premium</PlanName>
            <PlanDescription>
              Unlock the full power of Spenly with exclusive features
            </PlanDescription>

            <PriceContainer>
              {billingPeriod === 'monthly' ? (
                <>
                  <Price>
                    <span className="currency">$</span>
                    <span className="amount">1</span>
                    <span className="period">/month</span>
                  </Price>
                  <PriceNote>Billed monthly, cancel anytime</PriceNote>
                </>
              ) : (
                <>
                  <Price>
                    <span className="currency">$</span>
                    <span className="amount">100</span>
                    <span className="period">/lifetime</span>
                  </Price>
                  <PriceNote>₹1000 • One-time payment, lifetime access</PriceNote>
                </>
              )}
            </PriceContainer>

            <FeatureList>
              <AllFeaturesNote>
                ✓ <strong>All Free features</strong> plus:
              </AllFeaturesNote>

              <FeaturePillsContainer>
                {premiumFeatures.map((feature, index) => (
                  <FeaturePill
                    key={index}
                    active={selectedPremiumFeature === index}
                    onClick={() => setSelectedPremiumFeature(selectedPremiumFeature === index ? null : index)}
                  >
                    {feature.icon} {feature.title}
                  </FeaturePill>
                ))}
              </FeaturePillsContainer>

              <AnimatePresence mode="wait">
                {selectedPremiumFeature !== null && (
                  <FeatureDetails
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="detail-title">
                      {premiumFeatures[selectedPremiumFeature].icon} {premiumFeatures[selectedPremiumFeature].title}
                    </div>
                    <div className="detail-description">
                      {premiumFeatures[selectedPremiumFeature].description}
                    </div>
                  </FeatureDetails>
                )}
              </AnimatePresence>
            </FeatureList>

            <CTAButton primary href="https://apps.apple.com/in/app/spenly/id6747989825" target="_blank" rel="noopener noreferrer">Download Now</CTAButton>
          </PricingCard>
        </PricingGrid>
      </div>
    </PricingSection>
  )
}

export default Pricing
