import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { FiArrowLeft, FiPlus, FiClock, FiCalendar, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AddTaskModal from '../components/Modals/AddTaskModal';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const BackButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 24px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    transform: translateX(-4px);
  }

  svg {
    font-size: 16px;
  }
`;

const ClientHeader = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
    padding: 24px;
    margin-bottom: 24px;
  }
`;

const ClientInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
`;

const ClientColorDot = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: ${props => props.color};
  border: 4px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
  }
`;

const ClientDetails = styled.div`
  h1 {
    font-size: 32px;
    font-weight: 700;
    color: #333333;
    margin: 0 0 8px 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  p {
    font-size: 16px;
    color: #666666;
    margin: 0 0 4px 0;
  }

  .timezone {
    font-size: 14px;
    color: #999999;
    margin: 0;
  }

  @media (max-width: 768px) {
    h1 {
      font-size: 28px;
    }
  }
`;

const AddTaskButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
  }

  svg {
    font-size: 16px;
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
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
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);

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
  grid-template-columns: 1fr 1fr;
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

const TasksSection = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 24px;
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

const TaskList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TaskItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid ${props => getPriorityColor(props.priority)};
  transition: all 0.2s ease;

  &:hover {
    background: #e9ecef;
    transform: translateX(4px);
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
`;

const TaskInfo = styled.div`
  flex: 1;

  h4 {
    font-size: 14px;
    font-weight: 600;
    color: #333333;
    margin: 0 0 4px 0;
  }

  .project {
    font-size: 12px;
    color: #666666;
    margin: 0 0 4px 0;
  }

  .due-date {
    font-size: 12px;
    color: #999999;
    margin: 0;
  }
`;

const TaskMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #666666;

  @media (max-width: 768px) {
    justify-content: space-between;
  }
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  background: ${props => {
    switch (props.status) {
      case 'completed': return '#d4edda';
      case 'in-progress': return '#d1ecf1';
      case 'pending': return '#fff3cd';
      default: return '#f8d7da';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'completed': return '#155724';
      case 'in-progress': return '#0c5460';
      case 'pending': return '#856404';
      default: return '#721c24';
    }
  }};
`;

const getPriorityColor = (priority) => {
  const colors = {
    1: '#95a5a6',
    2: '#3498db',
    3: '#f39c12',
    4: '#e67e22',
    5: '#e74c3c'
  };
  return colors[priority] || '#95a5a6';
};

const ClientDashboard = () => {
  const { id } = useParams();
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  // Mock client data - in real app, this would come from API
  const client = {
    id: id,
    companyName: 'The Candy Store',
    contactName: 'Paul Johnson',
    email: 'paul@candystore.com',
    color: '#3498db',
    timeZone: 'EST'
  };

  const stats = {
    totalProjects: 3,
    totalTasks: 12,
    completedTasks: 7,
    overdueTasks: 2
  };

  const taskStatusData = [
    { name: 'Completed', value: 7, color: '#2ecc71' },
    { name: 'In Progress', value: 3, color: '#3498db' },
    { name: 'Pending', value: 2, color: '#f39c12' }
  ];

  const weeklyProgress = [
    { name: 'Mon', completed: 2, pending: 1 },
    { name: 'Tue', completed: 1, pending: 2 },
    { name: 'Wed', completed: 3, pending: 1 },
    { name: 'Thu', completed: 1, pending: 3 },
    { name: 'Fri', completed: 0, pending: 2 },
  ];

  const upcomingTasks = [
    {
      id: '1',
      name: 'Update product catalog',
      project: 'Website Redesign',
      dueDate: '2024-01-25',
      priority: 4,
      status: 'pending'
    },
    {
      id: '2',
      name: 'Review payment gateway',
      project: 'E-commerce Setup',
      dueDate: '2024-01-26',
      priority: 5,
      status: 'in-progress'
    },
    {
      id: '3',
      name: 'Content creation',
      project: 'Marketing Campaign',
      dueDate: '2024-01-28',
      priority: 3,
      status: 'pending'
    }
  ];

  return (
    <PageContainer className="animate-fade-in">
      <BackButton to="/clients">
        <FiArrowLeft />
        Back to Clients
      </BackButton>

      <ClientHeader>
        <ClientInfo>
          <ClientColorDot color={client.color} />
          <ClientDetails>
            <h1>{client.companyName}</h1>
            <p>{client.contactName}</p>
            <p>{client.email}</p>
            <p className="timezone">Time Zone: {client.timeZone}</p>
          </ClientDetails>
        </ClientInfo>
        <AddTaskButton onClick={() => setShowAddTaskModal(true)}>
          <FiPlus />
          Add Task
        </AddTaskButton>
      </ClientHeader>

      <StatsGrid>
        <StatCard>
          <div className="icon">📁</div>
          <div className="number">{stats.totalProjects}</div>
          <div className="label">Projects</div>
        </StatCard>
        <StatCard>
          <div className="icon">✅</div>
          <div className="number">{stats.totalTasks}</div>
          <div className="label">Total Tasks</div>
        </StatCard>
        <StatCard>
          <div className="icon">🎯</div>
          <div className="number">{stats.completedTasks}</div>
          <div className="label">Completed</div>
        </StatCard>
        <StatCard>
          <div className="icon">⚠️</div>
          <div className="number">{stats.overdueTasks}</div>
          <div className="label">Overdue</div>
        </StatCard>
      </StatsGrid>

      <ChartsSection>
        <ChartCard>
          <h3>Task Status Distribution</h3>
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard>
          <h3>Weekly Progress</h3>
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyProgress}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" fill="#2ecc71" />
                <Bar dataKey="pending" fill="#f39c12" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </ChartsSection>

      <TasksSection>
        <h3>Upcoming Tasks</h3>
        <TaskList>
          {upcomingTasks.map((task) => (
            <TaskItem key={task.id} priority={task.priority}>
              <TaskInfo>
                <h4>{task.name}</h4>
                <p className="project">{task.project}</p>
                <p className="due-date">Due: {task.dueDate}</p>
              </TaskInfo>
              <TaskMeta>
                <StatusBadge status={task.status}>
                  {task.status.replace('-', ' ')}
                </StatusBadge>
                <span>Priority: {task.priority}</span>
              </TaskMeta>
            </TaskItem>
          ))}
        </TaskList>
      </TasksSection>

      <AddTaskModal 
        isOpen={showAddTaskModal} 
        onClose={() => setShowAddTaskModal(false)} 
      />
    </PageContainer>
  );
};

export default ClientDashboard;