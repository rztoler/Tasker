import React from 'react';
import { Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './pages/Dashboard';
import ClientsPage from './pages/ClientsPage';
import ProjectsPage from './pages/ProjectsPage';
import TasksPage from './pages/TasksPage';
import CalendarPage from './pages/CalendarPage';
import WorkloadPage from './pages/WorkloadPage';
import ClientDashboard from './pages/ClientDashboard';

const AppContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 280px;
  transition: margin-left 0.3s ease;

  @media (max-width: 1024px) {
    margin-left: 0;
  }
`;

const ContentArea = styled.main`
  flex: 1;
  padding: 24px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  overflow-y: auto;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

function App() {
  return (
    <AppContainer>
      <Sidebar />
      <MainContent>
        <Header />
        <ContentArea>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/clients/:id/dashboard" element={<ClientDashboard />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/workload" element={<WorkloadPage />} />
          </Routes>
        </ContentArea>
      </MainContent>
    </AppContainer>
  );
}

export default App;