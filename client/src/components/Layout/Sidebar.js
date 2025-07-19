import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FiHome, 
  FiUsers, 
  FiFolderPlus, 
  FiCheckSquare, 
  FiCalendar, 
  FiBarChart3,
  FiMenu,
  FiX
} from 'react-icons/fi';

const SidebarContainer = styled.aside`
  position: fixed;
  left: 0;
  top: 0;
  width: 280px;
  height: 100vh;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  padding: 24px 0;
  z-index: 1000;
  transform: translateX(${props => props.isOpen ? '0' : '-100%'});
  transition: transform 0.3s ease;

  @media (min-width: 1025px) {
    transform: translateX(0);
  }
`;

const LogoSection = styled.div`
  padding: 0 24px 32px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 32px;
`;

const Logo = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: white;
  text-align: center;
  background: linear-gradient(135deg, #ffffff 0%, #e3f2fd 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Navigation = styled.nav`
  padding: 0 16px;
`;

const NavItem = styled(Link)`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  margin-bottom: 8px;
  border-radius: 12px;
  color: ${props => props.isActive ? '#333333' : 'rgba(255, 255, 255, 0.8)'};
  background: ${props => props.isActive ? 'rgba(255, 255, 255, 0.9)' : 'transparent'};
  font-weight: ${props => props.isActive ? '600' : '400'};
  text-decoration: none;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.isActive ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.1)'};
    color: ${props => props.isActive ? '#333333' : 'white'};
    transform: translateX(4px);
  }

  svg {
    margin-right: 12px;
    font-size: 20px;
  }
`;

const MenuToggle = styled.button`
  position: fixed;
  top: 24px;
  left: 24px;
  z-index: 1001;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 12px;
  color: white;
  font-size: 20px;
  display: none;

  @media (max-width: 1024px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: ${props => props.isOpen ? 'block' : 'none'};

  @media (min-width: 1025px) {
    display: none;
  }
`;

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: FiHome },
    { path: '/clients', label: 'Clients', icon: FiUsers },
    { path: '/projects', label: 'Projects', icon: FiFolderPlus },
    { path: '/tasks', label: 'Tasks', icon: FiCheckSquare },
    { path: '/calendar', label: 'Calendar', icon: FiCalendar },
    { path: '/workload', label: 'Workload', icon: FiBarChart3 },
  ];

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  return (
    <>
      <MenuToggle onClick={toggleSidebar}>
        {isOpen ? <FiX /> : <FiMenu />}
      </MenuToggle>
      
      <Overlay isOpen={isOpen} onClick={closeSidebar} />
      
      <SidebarContainer isOpen={isOpen}>
        <LogoSection>
          <Logo>Tasker</Logo>
        </LogoSection>
        
        <Navigation>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <NavItem
                key={item.path}
                to={item.path}
                isActive={isActive}
                onClick={closeSidebar}
              >
                <Icon />
                {item.label}
              </NavItem>
            );
          })}
        </Navigation>
      </SidebarContainer>
    </>
  );
};

export default Sidebar;