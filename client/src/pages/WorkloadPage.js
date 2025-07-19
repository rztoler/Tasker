import React, { useState } from 'react';
import styled from 'styled-components';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  FiClock,
  FiTrendingUp,
  FiAlertTriangle,
  FiCheckCircle
} from 'react-icons/fi';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 24px;
    margin-bottom: 24px;
  }
`;

const PageTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #333333;
  margin: 0 0 16px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 768px) {
    font-size: 28px;
    text-align: center;
  }
`;

const PageSubtitle = styled.p`
  font-size: 16px;
  color: #666666;
  margin: 0;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const TimeRangeSelector = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;
`;

const TimeButton = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: ${props => (props.isActive ? '#ffffff' : '#666666')};
  background: ${props =>
    props.isActive ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f8f9fa'};
  border: 2px solid ${props => (props.isActive ? '#667eea' : '#e1e5e9')};
  transition: all 0.2s ease;

  &:hover {
    background: ${props =>
      props.isActive ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e9ecef'};
    border-color: #667eea;
  }
`;

const StatsGrid = styled.div`
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

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  }

  .icon {
    font-size: 32px;
    margin-bottom: 16px;
    color: #667eea;
  }

  .number {
    font-size: 36px;
    font-weight: 700;
    color: #333333;
    margin-bottom: 8px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .label {
    font-size: 14px;
    color: #666666;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }

  .sublabel {
    font-size: 12px;
    color: #999999;
  }

  @media (max-width: 768px) {
    padding: 20px;

    .number {
      font-size: 32px;
    }
  }
`;

const ChartsSection = styled.div`
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
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);

  h3 {
    font-size: 20px;
    font-weight: 600;
    color: #333333;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;

    svg {
      color: #667eea;
    }
  }

  @media (max-width: 768px) {
    padding: 20px;
    border-radius: 16px;
  }
`;

const UtilizationBar = styled.div`
  width: 100%;
  height: 12px;
  background: #e9ecef;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 16px;
`;

const UtilizationFill = styled.div`
  height: 100%;
  background: ${props => {
    if (props.percentage > 100) return 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)';
    if (props.percentage > 80) return 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)';
    return 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)';
  }};
  width: ${props => Math.min(props.percentage, 100)}%;
  transition: width 0.3s ease;
`;

const UtilizationText = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #666666;

  .percentage {
    font-weight: 600;
    color: ${props => {
      if (props.percentage > 100) return '#e74c3c';
      if (props.percentage > 80) return '#f39c12';
      return '#2ecc71';
    }};
  }
`;

const ClientBreakdown = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 24px;
  }
`;

const ClientCard = styled.div`
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
  }

  @media (max-width: 768px) {
    padding: 20px;
    border-radius: 16px;
  }
`;

const ClientItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 12px;
  margin-bottom: 12px;
  border-left: 4px solid ${props => props.color};

  &:last-child {
    margin-bottom: 0;
  }
`;

const ClientInfo = styled.div`
  flex: 1;

  h4 {
    font-size: 14px;
    font-weight: 600;
    color: #333333;
    margin: 0 0 4px 0;
  }

  .tasks {
    font-size: 12px;
    color: #666666;
    margin: 0;
  }
`;

const ClientHours = styled.div`
  text-align: right;

  .total {
    font-size: 16px;
    font-weight: 700;
    color: #333333;
    margin-bottom: 2px;
  }

  .breakdown {
    font-size: 11px;
    color: #999999;
  }
`;

const RecommendationCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-left: 4px solid
    ${props =>
      props.type === 'warning' ? '#f39c12' : props.type === 'error' ? '#e74c3c' : '#2ecc71'};

  .header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;

    svg {
      font-size: 24px;
      color: ${props =>
        props.type === 'warning' ? '#f39c12' : props.type === 'error' ? '#e74c3c' : '#2ecc71'};
    }

    h3 {
      font-size: 18px;
      font-weight: 600;
      color: #333333;
      margin: 0;
    }
  }

  p {
    font-size: 14px;
    color: #666666;
    line-height: 1.6;
    margin: 0;
  }

  @media (max-width: 768px) {
    padding: 20px;
    border-radius: 16px;
  }
`;

const WorkloadPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const periods = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' }
  ];

  const workloadStats = {
    totalAvailable: 40,
    totalCommitted: 34,
    scheduledHours: 28,
    unscheduledHours: 6,
    utilizationRate: 85
  };

  const weeklyData = [
    { name: 'Mon', scheduled: 6, unscheduled: 1, available: 1 },
    { name: 'Tue', scheduled: 7, unscheduled: 1, available: 0 },
    { name: 'Wed', scheduled: 5, unscheduled: 2, available: 1 },
    { name: 'Thu', scheduled: 6, unscheduled: 1, available: 1 },
    { name: 'Fri', scheduled: 4, unscheduled: 1, available: 3 }
  ];

  const capacityData = [
    { name: 'Scheduled', value: 28, color: '#667eea' },
    { name: 'Unscheduled', value: 6, color: '#f39c12' },
    { name: 'Available', value: 6, color: '#2ecc71' }
  ];

  const clientBreakdown = [
    {
      name: 'The Candy Store',
      color: '#3498db',
      scheduledHours: 12,
      unscheduledHours: 3,
      taskCount: 8
    },
    {
      name: 'The Estate Plan',
      color: '#e74c3c',
      scheduledHours: 8,
      unscheduledHours: 2,
      taskCount: 5
    },
    {
      name: 'Tech Solutions Inc',
      color: '#2ecc71',
      scheduledHours: 6,
      unscheduledHours: 1,
      taskCount: 4
    },
    {
      name: 'Creative Agency',
      color: '#f39c12',
      scheduledHours: 2,
      unscheduledHours: 0,
      taskCount: 2
    }
  ];

  const getRecommendation = () => {
    const { utilizationRate, unscheduledHours } = workloadStats;

    if (utilizationRate > 100) {
      return {
        type: 'error',
        title: 'Overcommitted',
        message:
          'You are overcommitted this week. Consider rescheduling some tasks or delegating work to meet all deadlines.'
      };
    } else if (utilizationRate > 90) {
      return {
        type: 'warning',
        title: 'Near Capacity',
        message:
          'You are near full capacity. Avoid taking on additional work this week and focus on completing scheduled tasks.'
      };
    } else if (unscheduledHours > 0) {
      return {
        type: 'warning',
        title: 'Unscheduled Work',
        message: `You have ${unscheduledHours} hours of unscheduled work that needs to be planned. Schedule these tasks to better manage your time.`
      };
    } else {
      return {
        type: 'success',
        title: 'Good Balance',
        message:
          'Your workload is well balanced. You have good capacity management and can consider taking on additional work.'
      };
    }
  };

  const recommendation = getRecommendation();

  return (
    <PageContainer className="animate-fade-in">
      <PageHeader>
        <PageTitle>Workload Analysis</PageTitle>
        <PageSubtitle>
          Understand your capacity, availability, and optimize your time management
        </PageSubtitle>
        <TimeRangeSelector>
          {periods.map(period => (
            <TimeButton
              key={period.value}
              isActive={selectedPeriod === period.value}
              onClick={() => setSelectedPeriod(period.value)}
            >
              {period.label}
            </TimeButton>
          ))}
        </TimeRangeSelector>
      </PageHeader>

      <StatsGrid>
        <StatCard>
          <div className="icon">⏰</div>
          <div className="number">{workloadStats.totalAvailable}h</div>
          <div className="label">Available Hours</div>
          <div className="sublabel">This Week</div>
        </StatCard>
        <StatCard>
          <div className="icon">📋</div>
          <div className="number">{workloadStats.scheduledHours}h</div>
          <div className="label">Scheduled Work</div>
          <div className="sublabel">{workloadStats.unscheduledHours}h unscheduled</div>
        </StatCard>
        <StatCard>
          <div className="icon">📊</div>
          <div className="number">{workloadStats.utilizationRate}%</div>
          <div className="label">Utilization Rate</div>
          <div className="sublabel">
            {workloadStats.utilizationRate > 80 ? 'High' : 'Moderate'} capacity
          </div>
        </StatCard>
        <StatCard>
          <div className="icon">✅</div>
          <div className="number">
            {workloadStats.totalAvailable - workloadStats.totalCommitted}h
          </div>
          <div className="label">Free Time</div>
          <div className="sublabel">Available for new work</div>
        </StatCard>
      </StatsGrid>

      <ChartsSection>
        <ChartCard>
          <h3>
            <FiTrendingUp />
            Weekly Workload Distribution
          </h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="scheduled" stackId="a" fill="#667eea" name="Scheduled" />
                <Bar dataKey="unscheduled" stackId="a" fill="#f39c12" name="Unscheduled" />
                <Bar dataKey="available" stackId="a" fill="#2ecc71" name="Available" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard>
          <h3>
            <FiClock />
            Capacity Overview
          </h3>
          <div style={{ marginBottom: '20px' }}>
            <UtilizationText percentage={workloadStats.utilizationRate}>
              <span>Utilization Rate</span>
              <span className="percentage">{workloadStats.utilizationRate}%</span>
            </UtilizationText>
            <UtilizationBar>
              <UtilizationFill percentage={workloadStats.utilizationRate} />
            </UtilizationBar>
          </div>
          <div style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={capacityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {capacityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </ChartsSection>

      <ClientBreakdown>
        <ClientCard>
          <h3>Client Workload Breakdown</h3>
          {clientBreakdown.map(client => (
            <ClientItem key={client.name} color={client.color}>
              <ClientInfo>
                <h4>{client.name}</h4>
                <p className="tasks">{client.taskCount} tasks</p>
              </ClientInfo>
              <ClientHours>
                <div className="total">{client.scheduledHours + client.unscheduledHours}h</div>
                <div className="breakdown">
                  {client.scheduledHours}h scheduled, {client.unscheduledHours}h pending
                </div>
              </ClientHours>
            </ClientItem>
          ))}
        </ClientCard>

        <RecommendationCard type={recommendation.type}>
          <div className="header">
            {recommendation.type === 'error' && <FiAlertTriangle />}
            {recommendation.type === 'warning' && <FiClock />}
            {recommendation.type === 'success' && <FiCheckCircle />}
            <h3>{recommendation.title}</h3>
          </div>
          <p>{recommendation.message}</p>
        </RecommendationCard>
      </ClientBreakdown>
    </PageContainer>
  );
};

export default WorkloadPage;
