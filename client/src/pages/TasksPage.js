import React, { useState } from 'react';
import styled from 'styled-components';
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiClock, FiCalendar, FiFlag, FiCheckCircle } from 'react-icons/fi';
import AddTaskModal from '../components/Modals/AddTaskModal';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
    padding: 24px;
    margin-bottom: 24px;
  }
`;

const PageTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #333333;
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 768px) {
    font-size: 28px;
    text-align: center;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const SearchInput = styled.input`
  background: white;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  padding: 12px 16px 12px 44px;
  color: #333333;
  font-size: 14px;
  width: 280px;
  transition: all 0.2s ease;

  &::placeholder {
    color: #999999;
  }

  &:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const SearchIcon = styled(FiSearch)`
  position: absolute;
  left: 16px;
  color: #999999;
  font-size: 16px;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 12px;

  @media (max-width: 768px) {
    width: 100%;
    flex-direction: column;
  }
`;

const FilterSelect = styled.select`
  background: white;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  padding: 12px 16px;
  color: #333333;
  font-size: 14px;
  min-width: 120px;
  transition: all 0.2s ease;

  &:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
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

const TasksContainer = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);

  @media (max-width: 768px) {
    padding: 20px;
    border-radius: 16px;
  }
`;

const TaskList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const TaskItem = styled.div`
  display: flex;
  align-items: center;
  padding: 20px 24px;
  background: white;
  border-radius: 16px;
  border-left: 4px solid ${props => getPriorityColor(props.priority)};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border-color: #e0e6ed;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    padding: 16px 20px;
  }
`;

const TaskCheckbox = styled.button`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid ${props => props.completed ? '#2ecc71' : '#e1e5e9'};
  background: ${props => props.completed ? '#2ecc71' : 'white'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    border-color: #2ecc71;
    background: ${props => props.completed ? '#27ae60' : '#f8fff9'};
  }

  svg {
    color: white;
    font-size: 14px;
  }

  @media (max-width: 768px) {
    margin-right: 0;
    align-self: flex-start;
  }
`;

const TaskContent = styled.div`
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
`;

const TaskInfo = styled.div`
  flex: 1;

  h4 {
    font-size: 16px;
    font-weight: 600;
    color: #333333;
    margin: 0 0 8px 0;
    text-decoration: ${props => props.completed ? 'line-through' : 'none'};
    opacity: ${props => props.completed ? 0.7 : 1};
  }

  .project {
    font-size: 13px;
    color: #667eea;
    margin: 0 0 4px 0;
    font-weight: 500;
  }

  .client {
    font-size: 12px;
    color: #999999;
    margin: 0;
  }
`;

const TaskMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-left: 20px;

  @media (max-width: 768px) {
    margin-left: 0;
    flex-wrap: wrap;
    gap: 12px;
  }
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666666;

  svg {
    font-size: 14px;
    color: #999999;
  }

  &.priority svg {
    color: ${props => getPriorityColor(props.priority)};
  }

  &.overdue {
    color: #e74c3c;
    
    svg {
      color: #e74c3c;
    }
  }
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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

const TaskActions = styled.div`
  display: flex;
  gap: 8px;
  margin-left: 20px;

  @media (max-width: 768px) {
    margin-left: 0;
    justify-content: flex-end;
  }
`;

const ActionButton = styled.button`
  padding: 8px;
  border-radius: 8px;
  background: ${props => {
    if (props.variant === 'edit') return '#f39c12';
    if (props.variant === 'delete') return '#e74c3c';
    return '#95a5a6';
  }};
  color: white;
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.8;
    transform: scale(1.05);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;

  h3 {
    font-size: 24px;
    font-weight: 600;
    color: #333333;
    margin-bottom: 12px;
  }

  p {
    font-size: 16px;
    color: #666666;
    margin-bottom: 24px;
  }
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

const TasksPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const [tasks, setTasks] = useState([
    {
      id: '1',
      name: 'Update product catalog',
      project: 'Website Redesign',
      client: 'The Candy Store',
      dueDate: '2024-01-25',
      duration: 3,
      priority: 4,
      status: 'pending',
      isCompleted: false,
      isOverdue: false
    },
    {
      id: '2',
      name: 'Review payment gateway integration',
      project: 'E-commerce Setup',
      client: 'The Candy Store',
      dueDate: '2024-01-26',
      duration: 2,
      priority: 5,
      status: 'in-progress',
      isCompleted: false,
      isOverdue: false
    },
    {
      id: '3',
      name: 'Content creation for landing page',
      project: 'Marketing Campaign',
      client: 'The Estate Plan',
      dueDate: '2024-01-28',
      duration: 4,
      priority: 3,
      status: 'pending',
      isCompleted: false,
      isOverdue: false
    },
    {
      id: '4',
      name: 'Database schema design',
      project: 'Database Migration',
      client: 'Tech Solutions Inc',
      dueDate: '2024-01-20',
      duration: 6,
      priority: 5,
      status: 'completed',
      isCompleted: true,
      isOverdue: false
    },
    {
      id: '5',
      name: 'Fix responsive navigation',
      project: 'Website Redesign',
      client: 'The Candy Store',
      dueDate: '2024-01-22',
      duration: 1.5,
      priority: 2,
      status: 'pending',
      isCompleted: false,
      isOverdue: true
    },
    {
      id: '6',
      name: 'Logo design variations',
      project: 'Brand Identity',
      client: 'Creative Agency',
      dueDate: '2024-01-30',
      duration: 5,
      priority: 3,
      status: 'in-progress',
      isCompleted: false,
      isOverdue: false
    }
  ]);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.client.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority.toString() === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const toggleTaskComplete = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            isCompleted: !task.isCompleted,
            status: !task.isCompleted ? 'completed' : 'pending'
          }
        : task
    ));
  };

  const handleEdit = (taskId) => {
    console.log('Edit task:', taskId);
  };

  const handleDelete = (taskId) => {
    console.log('Delete task:', taskId);
  };

  const formatDuration = (hours) => {
    if (hours < 1) return `${hours * 60}min`;
    return `${hours}h`;
  };

  const formatDueDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const isOverdue = (dueDate, isCompleted) => {
    if (isCompleted) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <PageContainer className="animate-fade-in">
      <PageHeader>
        <PageTitle>Tasks</PageTitle>
        <HeaderActions>
          <SearchContainer>
            <SearchIcon />
            <SearchInput
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchContainer>
          <FilterContainer>
            <FilterSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </FilterSelect>
            <FilterSelect
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">All Priority</option>
              <option value="1">Priority 1</option>
              <option value="2">Priority 2</option>
              <option value="3">Priority 3</option>
              <option value="4">Priority 4</option>
              <option value="5">Priority 5</option>
            </FilterSelect>
          </FilterContainer>
          <AddButton onClick={() => setShowAddModal(true)}>
            <FiPlus />
            Add Task
          </AddButton>
        </HeaderActions>
      </PageHeader>

      <TasksContainer>
        {filteredTasks.length === 0 ? (
          <EmptyState>
            <h3>No tasks found</h3>
            <p>
              {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' ? 
                'No tasks match your search criteria. Try adjusting your filters.' :
                'Get started by creating your first task.'
              }
            </p>
            {!searchQuery && statusFilter === 'all' && priorityFilter === 'all' && (
              <AddButton onClick={() => setShowAddModal(true)}>
                <FiPlus />
                Create Your First Task
              </AddButton>
            )}
          </EmptyState>
        ) : (
          <TaskList>
            {filteredTasks.map((task) => (
              <TaskItem key={task.id} priority={task.priority}>
                <TaskCheckbox
                  completed={task.isCompleted}
                  onClick={() => toggleTaskComplete(task.id)}
                >
                  {task.isCompleted && <FiCheckCircle />}
                </TaskCheckbox>
                
                <TaskContent>
                  <TaskInfo completed={task.isCompleted}>
                    <h4>{task.name}</h4>
                    <p className="project">{task.project}</p>
                    <p className="client">{task.client}</p>
                  </TaskInfo>
                  
                  <TaskMeta>
                    <MetaItem 
                      className={isOverdue(task.dueDate, task.isCompleted) ? 'overdue' : ''}
                    >
                      <FiCalendar />
                      Due {formatDueDate(task.dueDate)}
                    </MetaItem>
                    <MetaItem>
                      <FiClock />
                      {formatDuration(task.duration)}
                    </MetaItem>
                    <MetaItem className="priority" priority={task.priority}>
                      <FiFlag />
                      P{task.priority}
                    </MetaItem>
                    <StatusBadge status={task.status}>
                      {task.status.replace('-', ' ')}
                    </StatusBadge>
                  </TaskMeta>
                  
                  <TaskActions>
                    <ActionButton 
                      variant="edit" 
                      title="Edit Task"
                      onClick={() => handleEdit(task.id)}
                    >
                      <FiEdit />
                    </ActionButton>
                    <ActionButton 
                      variant="delete" 
                      title="Delete Task"
                      onClick={() => handleDelete(task.id)}
                    >
                      <FiTrash2 />
                    </ActionButton>
                  </TaskActions>
                </TaskContent>
              </TaskItem>
            ))}
          </TaskList>
        )}
      </TasksContainer>

      <AddTaskModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
      />
    </PageContainer>
  );
};

export default TasksPage;