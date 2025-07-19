import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FiEdit, FiTrash2, FiEye } from 'react-icons/fi';

const ListContainer = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);

  @media (max-width: 768px) {
    padding: 20px;
    border-radius: 16px;
  }
`;

const ListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  h3 {
    font-size: 20px;
    font-weight: 600;
    color: #333333;
    margin: 0;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid #e1e5e9;

  @media (max-width: 768px) {
    border-radius: 8px;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
`;

const TableHeader = styled.thead`
  background: #f8f9fa;
`;

const HeaderRow = styled.tr`
  border-bottom: 1px solid #e1e5e9;
`;

const HeaderCell = styled.th`
  padding: 16px 20px;
  text-align: left;
  font-weight: 600;
  font-size: 13px;
  color: #666666;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (max-width: 768px) {
    padding: 12px 16px;
    font-size: 12px;
  }
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.2s ease;

  &:hover {
    background: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.td`
  padding: 20px;
  font-size: 14px;
  color: #333333;
  vertical-align: middle;

  @media (max-width: 768px) {
    padding: 16px;
    font-size: 13px;
  }
`;

const ClientColorDot = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: ${props => props.color};
  margin-right: 12px;
  flex-shrink: 0;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ClientInfo = styled.div`
  display: flex;
  align-items: center;
`;

const ClientDetails = styled.div`
  h4 {
    font-weight: 600;
    font-size: 14px;
    color: #333333;
    margin: 0 0 4px 0;
  }

  p {
    font-size: 12px;
    color: #666666;
    margin: 0;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ActionButton = styled.button`
  padding: 8px;
  border-radius: 8px;
  background: ${props => {
    if (props.variant === 'view') return '#3498db';
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

const StyledLink = styled(Link)`
  color: inherit;
  text-decoration: none;
`;

const Badge = styled.span`
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  background: #e3f2fd;
  color: #1976d2;
`;

const ClientList = () => {
  const [clients] = useState([
    {
      id: '1',
      companyName: 'The Candy Store',
      contactName: 'Paul Johnson',
      color: '#3498db',
      projectCount: 3,
      taskCount: 12,
      timeZone: 'EST'
    },
    {
      id: '2',
      companyName: 'The Estate Plan',
      contactName: 'Justin Smith',
      color: '#e74c3c',
      projectCount: 2,
      taskCount: 8,
      timeZone: 'PST'
    },
    {
      id: '3',
      companyName: 'Tech Solutions Inc',
      contactName: 'Sarah Wilson',
      color: '#2ecc71',
      projectCount: 4,
      taskCount: 15,
      timeZone: 'MST'
    },
    {
      id: '4',
      companyName: 'Creative Agency',
      contactName: 'Mike Brown',
      color: '#f39c12',
      projectCount: 2,
      taskCount: 6,
      timeZone: 'EST'
    },
    {
      id: '5',
      companyName: 'Digital Marketing Co',
      contactName: 'Lisa Davis',
      color: '#9b59b6',
      projectCount: 3,
      taskCount: 11,
      timeZone: 'PST'
    },
    {
      id: '6',
      companyName: 'Consulting Group',
      contactName: 'David Lee',
      color: '#1abc9c',
      projectCount: 1,
      taskCount: 4,
      timeZone: 'EST'
    },
    {
      id: '7',
      companyName: 'Manufacturing LLC',
      contactName: 'Emily Clark',
      color: '#34495e',
      projectCount: 2,
      taskCount: 9,
      timeZone: 'CST'
    },
    {
      id: '8',
      companyName: 'Retail Chain',
      contactName: 'Robert Taylor',
      color: '#e67e22',
      projectCount: 1,
      taskCount: 3,
      timeZone: 'MST'
    }
  ]);

  const handleEdit = clientId => {
    console.log('Edit client:', clientId);
  };

  const handleDelete = clientId => {
    console.log('Delete client:', clientId);
  };

  return (
    <ListContainer className="animate-fade-in">
      <ListHeader>
        <h3>Client Overview</h3>
      </ListHeader>

      <TableContainer>
        <Table>
          <TableHeader>
            <HeaderRow>
              <HeaderCell style={{ width: '30%' }}>Client Company Name</HeaderCell>
              <HeaderCell>Client Name</HeaderCell>
              <HeaderCell># of Projects</HeaderCell>
              <HeaderCell># of Tasks</HeaderCell>
              <HeaderCell>Time Zone</HeaderCell>
              <HeaderCell style={{ width: '120px', textAlign: 'center' }}>Actions</HeaderCell>
            </HeaderRow>
          </TableHeader>
          <TableBody>
            {clients.map(client => (
              <TableRow key={client.id}>
                <TableCell>
                  <ClientInfo>
                    <ClientColorDot color={client.color} />
                    <ClientDetails>
                      <h4>{client.companyName}</h4>
                    </ClientDetails>
                  </ClientInfo>
                </TableCell>
                <TableCell>{client.contactName}</TableCell>
                <TableCell>
                  <Badge>{client.projectCount}</Badge>
                </TableCell>
                <TableCell>
                  <Badge>{client.taskCount}</Badge>
                </TableCell>
                <TableCell>{client.timeZone}</TableCell>
                <TableCell>
                  <ActionButtons>
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
                  </ActionButtons>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </ListContainer>
  );
};

export default ClientList;
