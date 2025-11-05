import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styled from 'styled-components'

interface FAQItem {
  id: string
  question: string
  answer: string
}

const FAQSection = styled.section`
  padding: 80px 0 100px;
  position: relative;
  z-index: 1;
  background: #000000;

  @media (max-width: 768px) {
    padding: 60px 0 80px;
  }
`

const FAQContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  box-shadow: 0 1px 1px hsl(0deg 0% 0% / 0.075), 0 2px 2px hsl(0deg 0% 0% / 0.075), 0 4px 4px hsl(0deg 0% 0% / 0.075), 0 8px 8px hsl(0deg 0% 0% / 0.075), 0 16px 16px hsl(0deg 0% 0% / 0.075);
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    margin: 0 20px;
  }
`

const FAQNav = styled.nav`
  background: rgba(0, 0, 0, 0.8);
  padding: 5px 5px 0;
  border-radius: 10px;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  min-height: 44px;
`

const FAQTabsContainer = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  font-weight: 500;
  font-size: 14px;
  display: flex;
  width: 100%;
  flex-wrap: wrap;
`

const FAQTab = styled(motion.li)`
  list-style: none;
  padding: 10px 15px;
  position: relative;
  background: transparent;
  cursor: pointer;
  min-height: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1;
  min-width: 0;
  user-select: none;
  color: var(--text);
  font-family: 'Poppins', sans-serif;
  transition: background-color 0.2s ease;

  @media (max-width: 768px) {
    font-size: 13px;
    padding: 8px 12px;
  }
`

const FAQUnderline = styled(motion.div)`
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--brand);
`

const FAQContentContainer = styled.main`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  padding: 40px;
  min-height: 200px;

  @media (max-width: 768px) {
    padding: 30px 20px;
    min-height: 150px;
  }
`

const FAQAnswer = styled(motion.div)`
  color: var(--muted);
  font-size: 15px;
  line-height: 1.7;
  font-family: 'Inter', sans-serif;
  text-align: left;
  width: 100%;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`

const faqs: FAQItem[] = [
  {
    id: 'premium',
    question: 'What is Spenly Premium?',
    answer: 'Spenly Premium is a one-time purchase (no subscriptions!) that includes Spenly AI for smart insights and chat assistance, transaction templates for instant creation, premium themes & custom fonts for a personalized look, ad-free experience, and unlocked PDF/CSV export. Lifetime access with all future updates included.'
  },
  {
    id: 'privacy',
    question: 'How does Spenly protect my financial data?',
    answer: 'Your data stays yours. Spenly uses local Core Data storage on your device with optional iCloud sync encrypted by Apple. We use Sign in with Apple for secure authentication and we never sell your personal data. Privacy and security are built into our design.'
  },
  {
    id: 'currency',
    question: 'Does Spenly support multiple currencies?',
    answer: 'Yes! Spenly supports 150+ currencies with live exchange rates, making it perfect for travelers, expats, and anyone managing finances across different countries. All conversions happen in real-time.'
  },
  {
    id: 'sync',
    question: 'Can I sync Spenly across my Apple devices?',
    answer: 'Absolutely. Spenly uses iCloud sync to keep your data up to date across all your Apple devices (iPhone, iPad, Mac). Your expenses, budgets, and receipts are always accessible wherever you are.'
  },
  {
    id: 'perfect',
    question: 'Who is Spenly perfect for?',
    answer: 'Spenly is perfect for personal expense management and budgeting, students and professionals tracking daily spending, multi-currency travelers and expats, and anyone who wants clarity and control over their money.'
  },
  {
    id: 'export',
    question: 'Can I export my financial data?',
    answer: 'Yes! Spenly allows you to generate professional PDF or CSV reports anytime. Export is available in the free version, and Premium users get enhanced export options with additional formatting and customization.'
  }
]

const FAQ: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<FAQItem>(faqs[0])

  return (
    <FAQSection id="faq">
      <div className="container">
        <div className="section-head">
          <h2>Frequently asked</h2>
        </div>
        <FAQContainer>
          <FAQNav>
            <FAQTabsContainer>
              {faqs.map((faq) => (
                <FAQTab
                  key={faq.id}
                  initial={false}
                  animate={{
                    backgroundColor: faq === selectedTab ? "rgba(255, 255, 255, 0.05)" : "transparent",
                  }}
                  onClick={() => setSelectedTab(faq)}
                >
                  {faq.question}
                  {faq === selectedTab ? (
                    <FAQUnderline
                      layoutId="underline"
                      id="underline"
                    />
                  ) : null}
                </FAQTab>
              ))}
            </FAQTabsContainer>
          </FAQNav>
          <FAQContentContainer>
            <AnimatePresence mode="wait">
              <FAQAnswer
                key={selectedTab ? selectedTab.id : "empty"}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {selectedTab ? selectedTab.answer : ""}
              </FAQAnswer>
            </AnimatePresence>
          </FAQContentContainer>
        </FAQContainer>
      </div>
    </FAQSection>
  )
}

export default FAQ
