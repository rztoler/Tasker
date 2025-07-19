import React, { useState } from 'react';
import styled from 'styled-components';
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import AddClientModal from '../components/Modals/AddClientModal';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: between;
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

const ClientsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
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

const ClientHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const ClientColorDot = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${props => props.color};
  margin-right: 16px;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

const ClientInfo = styled.div`
  flex: 1;

  h3 {
    font-size: 18px;
    font-weight: 700;
    color: #333333;
    margin: 0 0 4px 0;
  }

  p {
    font-size: 14px;
    color: #666666;
    margin: 0;
  }
`;

const ClientStats = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
`;

const StatItem = styled.div`
  flex: 1;
  text-align: center;
  padding: 16px 12px;
  background: #f8f9fa;
  border-radius: 12px;

  .number {
    font-size: 24px;
    font-weight: 700;
    color: #333333;
    margin-bottom: 4px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .label {
    font-size: 12px;
    color: #666666;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 500;
  }
`;

const ClientActions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
`;

const ActionButton = styled.button`
  padding: 10px;
  border-radius: 10px;
  background: ${props => {
    if (props.variant === 'view') return '#3498db';
    if (props.variant === 'edit') return '#f39c12';
    if (props.variant === 'delete') return '#e74c3c';
    return '#95a5a6';
  }};
  color: white;
  font-size: 16px;
  transition: all 0.2s ease;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 0.8;
    transform: scale(1.05);
  }
`;

const StyledLink = styled(Link)`
  flex: 1;
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

const ClientsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [clients] = useState([
    {
      id: '1',
      companyName: 'The Candy Store',
      contactName: 'Paul Johnson',
      email: 'paul@candystore.com',
      color: '#3498db',
      projectCount: 3,
      taskCount: 12,
      timeZone: 'EST'
    },
    {
      id: '2',
      companyName: 'The Estate Plan',
      contactName: 'Justin Smith',
      email: 'justin@estateplan.com',
      color: '#e74c3c',
      projectCount: 2,
      taskCount: 8,
      timeZone: 'PST'
    },
    {
      id: '3',
      companyName: 'Tech Solutions Inc',
      contactName: 'Sarah Wilson',
      email: 'sarah@techsolutions.com',
      color: '#2ecc71',
      projectCount: 4,
      taskCount: 15,
      timeZone: 'MST'
    },
    {
      id: '4',
      companyName: 'Creative Agency',
      contactName: 'Mike Brown',
      email: 'mike@creativeagency.com',
      color: '#f39c12',
      projectCount: 2,
      taskCount: 6,
      timeZone: 'EST'
    }
  ]);

  const filteredClients = clients.filter(client =>
    client.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.contactName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (clientId) => {
    console.log('Edit client:', clientId);
  };

  const handleDelete = (clientId) => {
    console.log('Delete client:', clientId);
  };

  return (
    <PageContainer className="animate-fade-in">
      <PageHeader>
        <PageTitle>Clients</PageTitle>
        <HeaderActions>
          <SearchContainer>
            <SearchIcon />
            <SearchInput
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchContainer>
          <AddButton onClick={() => setShowAddModal(true)}>
            <FiPlus />
            Add Client
          </AddButton>
        </HeaderActions>
      </PageHeader>

      {filteredClients.length === 0 ? (
        <EmptyState>
          <h3>No clients found</h3>
          <p>
            {searchQuery ? 
              `No clients match "${searchQuery}". Try adjusting your search.` :
              'Get started by adding your first client.'
            }
          </p>
          {!searchQuery && (
            <AddButton onClick={() => setShowAddModal(true)}>
              <FiPlus />
              Add Your First Client
            </AddButton>
          )}
        </EmptyState>
      ) : (
        <ClientsGrid>
          {filteredClients.map((client) => (
            <ClientCard key={client.id} className="hover-lift">
              <ClientHeader>
                <ClientColorDot color={client.color} />
                <ClientInfo>
                  <h3>{client.companyName}</h3>
                  <p>{client.contactName}</p>
                </ClientInfo>
              </ClientHeader>

              <ClientStats>
                <StatItem>
                  <div className="number">{client.projectCount}</div>
                  <div className="label">Projects</div>
                </StatItem>
                <StatItem>
                  <div className="number">{client.taskCount}</div>
                  <div className="label">Tasks</div>
                </StatItem>
              </ClientStats>

              <ClientActions>
                <StyledLink to={`/clients/${client.id}/dashboard`}>
                  <ActionButton variant="view" title="View Dashboard">
                    <FiEye />
                  </ActionButton>
                </StyledLink>
                <ActionButton 
                  variant="edit" 
                  title="Edit Client"
                  onClick={() => handleEdit(client.id)}
                >
                  <FiEdit />
                </ActionButton>
                <ActionButton 
                  variant="delete" 
                  title="Delete Client"
                  onClick={() => handleDelete(client.id)}
                >
                  <FiTrash2 />
                </ActionButton>
              </ClientActions>
            </ClientCard>
          ))}
        </ClientsGrid>
      )}

      <AddClientModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
      />
    </PageContainer>
  );
};

export default ClientsPage;