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
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (max-width: 768px) {
    margin: 0 20px;
  }
`

const FAQItem = styled(motion.div)`
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  box-shadow: 0 1px 1px hsl(0deg 0% 0% / 0.075), 0 2px 2px hsl(0deg 0% 0% / 0.075), 0 4px 4px hsl(0deg 0% 0% / 0.075);
`

const FAQQuestion = styled.button`
  width: 100%;
  padding: 20px 24px;
  background: transparent;
  border: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  text-align: left;
  color: var(--text);
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  font-weight: 500;
  transition: background-color 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  @media (max-width: 768px) {
    font-size: 15px;
    padding: 16px 20px;
  }
`

const PlusIcon = styled(motion.span)`
  font-size: 24px;
  color: var(--brand);
  font-weight: 300;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  margin-left: 16px;
`

const FAQAnswer = styled(motion.div)`
  color: var(--muted);
  font-size: 15px;
  line-height: 1.7;
  font-family: 'Inter', sans-serif;
  padding: 0 24px 20px;
  overflow: hidden;

  @media (max-width: 768px) {
    font-size: 14px;
    padding: 0 20px 16px;
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
  const [openId, setOpenId] = useState<string | null>(null)

  const toggleFAQ = (id: string) => {
    setOpenId(openId === id ? null : id)
  }

  return (
    <FAQSection id="faq">
      <div className="container">
        <div className="section-head">
          <h2>Frequently asked</h2>
        </div>
        <FAQContainer>
          {faqs.map((faq) => (
            <FAQItem
              key={faq.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <FAQQuestion onClick={() => toggleFAQ(faq.id)}>
                {faq.question}
                <PlusIcon
                  animate={{ rotate: openId === faq.id ? 45 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  +
                </PlusIcon>
              </FAQQuestion>
              <AnimatePresence>
                {openId === faq.id && (
                  <FAQAnswer
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    {faq.answer}
                  </FAQAnswer>
                )}
              </AnimatePresence>
            </FAQItem>
          ))}
        </FAQContainer>
      </div>
    </FAQSection>
  )
}

export default FAQ
