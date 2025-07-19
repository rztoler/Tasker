import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const CardContainer = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 768px) {
    padding: 24px;
    border-radius: 16px;
  }
`;

const IconContainer = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  font-size: 28px;

  @media (max-width: 768px) {
    width: 56px;
    height: 56px;
    font-size: 24px;
    margin-bottom: 16px;
  }
`;

const Number = styled.h2`
  font-size: 48px;
  font-weight: 700;
  color: #333333;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;

  @media (max-width: 768px) {
    font-size: 36px;
  }
`;

const Label = styled.p`
  font-size: 16px;
  font-weight: 500;
  color: #666666;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const StatsCard = ({ number, label, icon, delay = 0 }) => {
  return (
    <CardContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: delay,
        ease: "easeOut"
      }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className="hover-lift"
    >
      <IconContainer>
        {icon}
      </IconContainer>
      <Number>{number}</Number>
      <Label>{label}</Label>
    </CardContainer>
  );
};

export default StatsCard;