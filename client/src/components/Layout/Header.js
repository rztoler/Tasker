import React, { useState } from 'react';
import styled from 'styled-components';
import { FiBell, FiSearch, FiCalendar, FiClock } from 'react-icons/fi';

const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);

  @media (max-width: 768px) {
    padding: 16px;
    flex-direction: column;
    gap: 16px;
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  @media (max-width: 768px) {
    width: 100%;
    max-width: 300px;
  }
`;

const SearchInput = styled.input`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 12px 16px 12px 44px;
  color: white;
  font-size: 14px;
  width: 320px;
  transition: all 0.2s ease;

  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }

  &:focus {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const SearchIcon = styled(FiSearch)`
  position: absolute;
  left: 16px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 18px;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const ViewToggle = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const ToggleButton = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  color: ${props => (props.isActive ? '#333333' : 'rgba(255, 255, 255, 0.8)')};
  background: ${props => (props.isActive ? 'rgba(255, 255, 255, 0.9)' : 'transparent')};
  font-size: 13px;
  font-weight: ${props => (props.isActive ? '600' : '400')};
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: ${props =>
      props.isActive ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.1)'};
    color: ${props => (props.isActive ? '#333333' : 'white')};
  }
`;

const NotificationButton = styled.button`
  position: relative;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 18px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  background: #e74c3c;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.9);
`;

const DateDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: 500;

  svg {
    font-size: 16px;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState('calendar');

  const today = new Date();
  const formatDate = date => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = date => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <HeaderContainer>
      <LeftSection>
        <SearchContainer>
          <SearchIcon />
          <SearchInput
            type="text"
            placeholder="Search clients, projects, tasks..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </SearchContainer>
      </LeftSection>

      <RightSection>
        <ViewToggle>
          <ToggleButton
            isActive={currentView === 'calendar'}
            onClick={() => setCurrentView('calendar')}
          >
            Calendar View
          </ToggleButton>
          <ToggleButton
            isActive={currentView === 'workload'}
            onClick={() => setCurrentView('workload')}
          >
            Workload View
          </ToggleButton>
        </ViewToggle>

        <DateDisplay>
          <FiCalendar />
          <span>{formatDate(today)}</span>
          <FiClock />
          <span>{formatTime(today)}</span>
        </DateDisplay>

        <NotificationButton>
          <FiBell />
          <NotificationBadge />
        </NotificationButton>
      </RightSection>
    </HeaderContainer>
  );
};

export default Header;
