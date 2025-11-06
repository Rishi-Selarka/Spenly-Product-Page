import React from 'react'
import styled, { keyframes } from 'styled-components'

interface Review {
  id: number
  name: string
  rating: number
  title: string
  comment: string
  date: string
}

const TestimonialsSection = styled.section`
  padding: 80px 0;
  position: relative;
  z-index: 1;
  background: #000000;
  overflow-x: hidden;
  overflow-y: visible;

  @media (max-width: 768px) {
    padding: 60px 0;
  }
`

const SectionHead = styled.div`
  text-align: center;
  margin-bottom: 60px;

  h2 {
    font-size: 48px;
    font-weight: 700;
    margin-bottom: 16px;
    color: var(--text);

    @media (max-width: 768px) {
      font-size: 36px;
    }
  }

  @media (max-width: 768px) {
    margin-bottom: 40px;
  }
`

const scroll = keyframes`
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
`

const CarouselWrapper = styled.div`
  width: 100%;
  overflow: visible;
  position: relative;
  padding: 20px 0;
  
  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 0;
    width: 150px;
    height: 100%;
    z-index: 2;
    pointer-events: none;
  }

  &::before {
    left: 0;
    background: linear-gradient(to right, #000000 0%, transparent 100%);
  }

  &::after {
    right: 0;
    background: linear-gradient(to left, #000000 0%, transparent 100%);
  }
`

const CarouselTrack = styled.div`
  display: flex;
  gap: 24px;
  animation: ${scroll} 60s linear infinite;
  width: fit-content;

  &:hover {
    animation-play-state: paused;
  }
`

const ReviewCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 20px;
  padding: 24px;
  width: 340px;
  flex-shrink: 0;
  transition: transform 0.3s ease;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
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
    background: rgba(255, 255, 255, 0.06);
    transform: translateY(-4px);
  }
    border-color: rgba(255, 255, 255, 0.25);
    transform: translateY(-6px);
    box-shadow: 
      0 12px 40px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  @media (max-width: 768px) {
    width: 300px;
    padding: 20px;
  }
`

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`

const ReviewerInfo = styled.div`
  flex: 1;
`

const ReviewerName = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  margin: 0;
`

const StarRating = styled.div`
  display: flex;
  gap: 2px;
  font-size: 16px;
  color: #FFD700;
`

const ReviewTitle = styled.h5`
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 8px;
`

const ReviewComment = styled.p`
  font-size: 14px;
  line-height: 1.6;
  color: var(--muted);
  margin: 0;
`

const Testimonials: React.FC = () => {
  const reviews: Review[] = [
    {
      id: 1,
      name: 'Akashdeep Yadav',
      rating: 5,
      title: 'Best expense tracker ever!',
      comment: 'Spenly has completely transformed how I manage my finances. The AI insights are incredibly helpful and the interface is beautiful.',
      date: ''
    },
    {
      id: 2,
      name: 'Bhumi Hotkar',
      rating: 5,
      title: 'Perfect for travelers',
      comment: 'The multi-currency support is a game changer. I travel frequently and this app makes tracking expenses across countries so easy.',
      date: ''
    },
    {
      id: 3,
      name: 'Rishi Selarka',
      rating: 5,
      title: 'Simple yet powerful',
      comment: 'Love the clean design and how easy it is to add expenses. The budgeting features help me stay on track every month.',
      date: ''
    },
    {
      id: 4,
      name: 'Sanky',
      rating: 5,
      title: 'Finally, financial clarity!',
      comment: 'The analytics dashboard shows me exactly where my money goes. Made me realize I was spending way too much on dining out.',
      date: ''
    },
    {
      id: 5,
      name: 'BoddyHolly',
      rating: 5,
      title: 'Privacy first approach',
      comment: 'I appreciate that my data stays on my device. The iCloud sync works flawlessly across all my Apple devices.',
      date: ''
    },
    {
      id: 6,
      name: 'Sarah Anderson',
      rating: 5,
      title: 'Worth every penny',
      comment: 'The premium features are incredible. AI chat answers all my financial questions and the export options are professional grade.',
      date: ''
    },
    {
      id: 7,
      name: 'Priya Sharma',
      rating: 5,
      title: 'Great app for students',
      comment: 'As a college student, this helps me manage my limited budget perfectly. The receipt scanner is super convenient!',
      date: ''
    },
    {
      id: 8,
      name: 'Alex Martinez',
      rating: 5,
      title: 'Intuitive and fast',
      comment: 'Adding expenses takes literally seconds. The smart categories learn my spending patterns. Highly recommend!',
      date: ''
    }
  ]

  // Duplicate reviews for seamless infinite scroll
  const duplicatedReviews = [...reviews, ...reviews]

  return (
    <TestimonialsSection id="testimonials">
      <div className="container">
        <SectionHead>
          <h2>What users said about Spenly?</h2>
        </SectionHead>
      </div>
      <CarouselWrapper>
        <CarouselTrack>
          {duplicatedReviews.map((review, index) => (
            <ReviewCard key={`${review.id}-${index}`}>
              <ReviewHeader>
                <ReviewerInfo>
                  <ReviewerName>{review.name}</ReviewerName>
                </ReviewerInfo>
                <StarRating>
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </StarRating>
              </ReviewHeader>
              <ReviewTitle>{review.title}</ReviewTitle>
              <ReviewComment>{review.comment}</ReviewComment>
            </ReviewCard>
          ))}
        </CarouselTrack>
      </CarouselWrapper>
    </TestimonialsSection>
  )
}

export default Testimonials
