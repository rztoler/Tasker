import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FiPlus, FiEdit, FiTrash2, FiClock, FiAlertTriangle } from 'react-icons/fi';
import StatsCard from '../components/Dashboard/StatsCard';
import ClientList from '../components/Dashboard/ClientList';
import AddClientModal from '../components/Modals/AddClientModal';
import AddProjectModal from '../components/Modals/AddProjectModal';
import AddTaskModal from '../components/Modals/AddTaskModal';

const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
`;

const TopSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 24px;
  }
`;

const ChartSection = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-bottom: 32px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 24px;
  }
`;

const ChartCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);

  h3 {
    font-size: 20px;
    font-weight: 600;
    color: #333333;
    margin-bottom: 24px;
  }

  @media (max-width: 768px) {
    padding: 20px;
    border-radius: 16px;
  }
`;

const TimelineControls = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
`;

const TimelineButton = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: ${props => props.isActive ? '#ffffff' : '#666666'};
  background: ${props => props.isActive ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f8f9fa'};
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.isActive ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e9ecef'};
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    margin-bottom: 24px;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: #333333;
  font-weight: 500;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;

  &:hover {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }

  svg {
    font-size: 16px;
  }

  @media (max-width: 768px) {
    padding: 12px 20px;
    justify-content: center;
  }
`;

const AlertsSection = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);

  h3 {
    font-size: 18px;
    font-weight: 600;
    color: #333333;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  @media (max-width: 768px) {
    padding: 20px;
    border-radius: 16px;
  }
`;

const AlertItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: ${props => props.type === 'error' ? '#fee2e2' : '#fef3c7'};
  border-radius: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  color: ${props => props.type === 'error' ? '#dc2626' : '#d97706'};

  svg {
    font-size: 16px;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const Dashboard = () => {
  const [activeTimeline, setActiveTimeline] = useState('week');
  const [showClientModal, setShowClientModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalClients: 3,
      totalProjects: 13,
      totalTasks: 32,
      completedTasks: 18
    },
    alerts: [
      { type: 'error', message: '3 tasks are overdue and need immediate attention' },
      { type: 'warning', message: '5 tasks due within 48 hours' }
    ],
    timeline: [
      { name: 'Mon', clients: 2, projects: 4, tasks: 8 },
      { name: 'Tue', clients: 1, projects: 3, tasks: 6 },
      { name: 'Wed', clients: 3, projects: 5, tasks: 12 },
      { name: 'Thu', clients: 2, projects: 3, tasks: 7 },
      { name: 'Fri', clients: 1, projects: 2, tasks: 4 },
      { name: 'Sat', clients: 0, projects: 1, tasks: 2 },
      { name: 'Sun', clients: 0, projects: 0, tasks: 1 }
    ]
  });

  const timelineOptions = [
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'quarter', label: 'Quarter' },
    { value: 'year', label: 'Year' }
  ];

  return (
    <DashboardContainer className="animate-fade-in">
      <TopSection>
        <StatsCard
          number={dashboardData.stats.totalClients}
          label="Clients"
          icon={<span style={{ fontSize: '24px', color: '#667eea' }}>👥</span>}
        />
        <StatsCard
          number={dashboardData.stats.totalProjects}
          label="Projects"
          icon={<span style={{ fontSize: '24px', color: '#667eea' }}>📁</span>}
        />
        <StatsCard
          number={dashboardData.stats.totalTasks}
          label="Tasks"
          icon={<span style={{ fontSize: '24px', color: '#667eea' }}>✅</span>}
        />
      </TopSection>

      <ActionButtons>
        <ActionButton onClick={() => setShowClientModal(true)}>
          <FiPlus />
          Add Client
        </ActionButton>
        <ActionButton onClick={() => setShowProjectModal(true)}>
          <FiPlus />
          Add Project
        </ActionButton>
        <ActionButton onClick={() => setShowTaskModal(true)}>
          <FiPlus />
          Add Task
        </ActionButton>
      </ActionButtons>

      <ChartSection>
        <ChartCard>
          <h3>Timeline</h3>
          <TimelineControls>
            {timelineOptions.map((option) => (
              <TimelineButton
                key={option.value}
                isActive={activeTimeline === option.value}
                onClick={() => setActiveTimeline(option.value)}
              >
                {option.label}
              </TimelineButton>
            ))}
          </TimelineControls>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardData.timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                />
                <Tooltip
                  contentStyle={{
                    background: '#ffffff',
                    border: '1px solid #e1e5e9',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="tasks" 
                  stroke="#667eea" 
                  strokeWidth={3}
                  dot={{ fill: '#667eea', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: '#667eea', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="projects" 
                  stroke="#764ba2" 
                  strokeWidth={2}
                  dot={{ fill: '#764ba2', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <AlertsSection>
          <h3>
            <FiAlertTriangle />
            Alerts & Updates
          </h3>
          {dashboardData.alerts.map((alert, index) => (
            <AlertItem key={index} type={alert.type}>
              {alert.type === 'error' ? <FiAlertTriangle /> : <FiClock />}
              {alert.message}
            </AlertItem>
          ))}
        </AlertsSection>
      </ChartSection>

      <ClientList />

      <AddClientModal 
        isOpen={showClientModal} 
        onClose={() => setShowClientModal(false)} 
      />
      <AddProjectModal 
        isOpen={showProjectModal} 
        onClose={() => setShowProjectModal(false)} 
      />
      <AddTaskModal 
        isOpen={showTaskModal} 
        onClose={() => setShowTaskModal(false)} 
      />
    </DashboardContainer>
  );
};

export default Dashboard;