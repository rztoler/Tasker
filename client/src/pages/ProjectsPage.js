import React, { useState } from 'react';
import styled from 'styled-components';
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiFolder, FiUser, FiCalendar } from 'react-icons/fi';
import AddProjectModal from '../components/Modals/AddProjectModal';

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

const FilterSelect = styled.select`
  background: white;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  padding: 12px 16px;
  color: #333333;
  font-size: 14px;
  min-width: 150px;
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

const ProjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 24px;
  }
`;

const ProjectCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 768px) {
    padding: 20px;
    border-radius: 16px;
  }
`;

const ProjectHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const ProjectInfo = styled.div`
  flex: 1;

  h3 {
    font-size: 20px;
    font-weight: 700;
    color: #333333;
    margin: 0 0 8px 0;
    display: flex;
    align-items: center;
    gap: 8px;

    svg {
      color: #667eea;
    }
  }

  .client {
    font-size: 14px;
    color: #666666;
    margin: 0 0 4px 0;
    display: flex;
    align-items: center;
    gap: 6px;

    svg {
      font-size: 12px;
      color: #999999;
    }
  }

  .created {
    font-size: 12px;
    color: #999999;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 6px;

    svg {
      font-size: 12px;
    }
  }
`;

const StatusBadge = styled.span`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${props => {
    switch (props.status) {
      case 'active': return 'linear-gradient(135deg, #2ecc71, #27ae60)';
      case 'completed': return 'linear-gradient(135deg, #3498db, #2980b9)';
      case 'on-hold': return 'linear-gradient(135deg, #f39c12, #e67e22)';
      default: return 'linear-gradient(135deg, #95a5a6, #7f8c8d)';
    }
  }};
  color: white;
`;

const ProjectDescription = styled.p`
  font-size: 14px;
  color: #666666;
  line-height: 1.5;
  margin: 16px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ProjectStats = styled.div`
  display: flex;
  gap: 16px;
  margin: 16px 0;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
`;

const StatItem = styled.div`
  flex: 1;
  text-align: center;

  .number {
    font-size: 20px;
    font-weight: 700;
    color: #333333;
    margin-bottom: 4px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .label {
    font-size: 11px;
    color: #666666;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 500;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin: 12px 0;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

const ProjectActions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
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
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);

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

const ProjectsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const [projects] = useState([
    {
      id: '1',
      name: 'Website Redesign',
      description: 'Complete overhaul of the company website with modern design and improved user experience.',
      client: 'The Candy Store',
      clientColor: '#3498db',
      status: 'active',
      taskCount: 8,
      completedTasks: 5,
      totalHours: 40,
      completedHours: 25,
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Marketing Campaign',
      description: 'Launch comprehensive marketing campaign for Q1 featuring social media and email marketing.',
      client: 'The Estate Plan',
      clientColor: '#e74c3c',
      status: 'active',
      taskCount: 6,
      completedTasks: 2,
      totalHours: 30,
      completedHours: 10,
      createdAt: '2024-01-10'
    },
    {
      id: '3',
      name: 'Database Migration',
      description: 'Migrate legacy database to cloud infrastructure with improved performance and security.',
      client: 'Tech Solutions Inc',
      clientColor: '#2ecc71',
      status: 'completed',
      taskCount: 12,
      completedTasks: 12,
      totalHours: 60,
      completedHours: 60,
      createdAt: '2024-01-05'
    },
    {
      id: '4',
      name: 'Brand Identity',
      description: 'Develop new brand identity including logo, color palette, and brand guidelines.',
      client: 'Creative Agency',
      clientColor: '#f39c12',
      status: 'on-hold',
      taskCount: 4,
      completedTasks: 1,
      totalHours: 20,
      completedHours: 5,
      createdAt: '2024-01-08'
    }
  ]);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (projectId) => {
    console.log('Edit project:', projectId);
  };

  const handleDelete = (projectId) => {
    console.log('Delete project:', projectId);
  };

  const getProgress = (completed, total) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  return (
    <PageContainer className="animate-fade-in">
      <PageHeader>
        <PageTitle>Projects</PageTitle>
        <HeaderActions>
          <SearchContainer>
            <SearchIcon />
            <SearchInput
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchContainer>
          <FilterSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
          </FilterSelect>
          <AddButton onClick={() => setShowAddModal(true)}>
            <FiPlus />
            Add Project
          </AddButton>
        </HeaderActions>
      </PageHeader>

      {filteredProjects.length === 0 ? (
        <EmptyState>
          <h3>No projects found</h3>
          <p>
            {searchQuery || statusFilter !== 'all' ? 
              'No projects match your search criteria. Try adjusting your filters.' :
              'Get started by creating your first project.'
            }
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <AddButton onClick={() => setShowAddModal(true)}>
              <FiPlus />
              Create Your First Project
            </AddButton>
          )}
        </EmptyState>
      ) : (
        <ProjectsGrid>
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} className="hover-lift">
              <ProjectHeader>
                <ProjectInfo>
                  <h3>
                    <FiFolder />
                    {project.name}
                  </h3>
                  <p className="client">
                    <FiUser />
                    {project.client}
                  </p>
                  <p className="created">
                    <FiCalendar />
                    Created {project.createdAt}
                  </p>
                </ProjectInfo>
                <StatusBadge status={project.status}>
                  {project.status.replace('-', ' ')}
                </StatusBadge>
              </ProjectHeader>

              <ProjectDescription>
                {project.description}
              </ProjectDescription>

              <ProjectStats>
                <StatItem>
                  <div className="number">{project.taskCount}</div>
                  <div className="label">Tasks</div>
                </StatItem>
                <StatItem>
                  <div className="number">{project.completedTasks}</div>
                  <div className="label">Completed</div>
                </StatItem>
                <StatItem>
                  <div className="number">{project.totalHours}h</div>
                  <div className="label">Total Hours</div>
                </StatItem>
              </ProjectStats>

              <div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  fontSize: '12px', 
                  color: '#666666',
                  marginBottom: '4px'
                }}>
                  <span>Progress</span>
                  <span>{getProgress(project.completedTasks, project.taskCount)}%</span>
                </div>
                <ProgressBar>
                  <ProgressFill progress={getProgress(project.completedTasks, project.taskCount)} />
                </ProgressBar>
              </div>

              <ProjectActions>
                <ActionButton 
                  variant="edit" 
                  title="Edit Project"
                  onClick={() => handleEdit(project.id)}
                >
                  <FiEdit />
                </ActionButton>
                <ActionButton 
                  variant="delete" 
                  title="Delete Project"
                  onClick={() => handleDelete(project.id)}
                >
                  <FiTrash2 />
                </ActionButton>
              </ProjectActions>
            </ProjectCard>
          ))}
        </ProjectsGrid>
      )}

      <AddProjectModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
      />
    </PageContainer>
  );
};

export default ProjectsPage;