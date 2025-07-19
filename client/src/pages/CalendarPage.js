import React, { useState } from 'react';
import styled from 'styled-components';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { FiPlus, FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import AddTaskModal from '../components/Modals/AddTaskModal';
import AddEventModal from '../components/Modals/AddEventModal';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

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

const ViewSelector = styled.div`
  display: flex;
  background: white;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  padding: 4px;
`;

const ViewButton = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: ${props => props.isActive ? '#ffffff' : '#666666'};
  background: ${props => props.isActive ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent'};
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.isActive ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f8f9fa'};
  }
`;

const AddButtonGroup = styled.div`
  display: flex;
  gap: 8px;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: ${props => props.variant === 'task' ? 
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 
    'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)'
  };
  color: white;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px ${props => props.variant === 'task' ? 
      'rgba(102, 126, 234, 0.3)' : 
      'rgba(46, 204, 113, 0.3)'
    };
  }

  svg {
    font-size: 16px;
  }

  @media (max-width: 768px) {
    flex: 1;
    justify-content: center;
  }
`;

const CalendarContainer = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 32px;

  .rbc-calendar {
    background: transparent;
    font-family: 'Inter', sans-serif;
  }

  .rbc-toolbar {
    margin-bottom: 20px;
    padding: 16px 0;
    border-bottom: 1px solid #e1e5e9;
  }

  .rbc-toolbar-label {
    font-size: 24px;
    font-weight: 700;
    color: #333333;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .rbc-btn-group button {
    background: white;
    border: 2px solid #e1e5e9;
    color: #666666;
    font-weight: 500;
    padding: 8px 16px;
    border-radius: 8px;
    margin: 0 2px;
    transition: all 0.2s ease;

    &:hover {
      background: #f8f9fa;
      border-color: #667eea;
      color: #667eea;
    }

    &.rbc-active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-color: #667eea;
      color: white;
    }
  }

  .rbc-header {
    background: #f8f9fa;
    color: #333333;
    font-weight: 600;
    font-size: 14px;
    padding: 12px 8px;
    border-bottom: 1px solid #e1e5e9;
  }

  .rbc-date-cell {
    padding: 8px;
    text-align: right;
    
    &.rbc-off-range-bg {
      background: #f8f9fa;
    }
  }

  .rbc-today {
    background: rgba(102, 126, 234, 0.1);
  }

  .rbc-event {
    border-radius: 8px;
    border: none;
    padding: 4px 8px;
    font-size: 12px;
    font-weight: 500;
    margin: 1px 0;
    
    &.task-event {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    &.event-event {
      background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
    }
    
    &.priority-5 {
      background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
    }
    
    &.priority-4 {
      background: linear-gradient(135deg, #e67e22 0%, #d35400 100%);
    }
  }

  .rbc-slot-selection {
    background: rgba(102, 126, 234, 0.2);
  }

  @media (max-width: 768px) {
    padding: 20px;
    border-radius: 16px;
    margin-bottom: 24px;

    .rbc-toolbar {
      flex-direction: column;
      gap: 16px;
      align-items: stretch;
    }

    .rbc-toolbar-label {
      text-align: center;
      font-size: 20px;
    }

    .rbc-btn-group {
      display: flex;
      justify-content: center;
    }
  }
`;

const SidePanel = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const PanelCard = styled.div`
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

    svg {
      color: #667eea;
    }
  }

  @media (max-width: 768px) {
    padding: 20px;
    border-radius: 16px;
  }
`;

const UpcomingList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const UpcomingItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid ${props => props.color || '#667eea'};
  transition: all 0.2s ease;

  &:hover {
    background: #e9ecef;
    transform: translateX(4px);
  }
`;

const ItemInfo = styled.div`
  flex: 1;

  h4 {
    font-size: 14px;
    font-weight: 600;
    color: #333333;
    margin: 0 0 4px 0;
  }

  .meta {
    font-size: 12px;
    color: #666666;
    margin: 0;
  }
`;

const ItemTime = styled.div`
  font-size: 12px;
  color: #999999;
  text-align: right;
  
  .time {
    font-weight: 600;
    color: #667eea;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

const StatItem = styled.div`
  text-align: center;
  padding: 16px;
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
    font-size: 11px;
    color: #666666;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 500;
  }
`;

const CalendarPage = () => {
  const [currentView, setCurrentView] = useState('month');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  // Mock data - in real app, this would come from API
  const events = [
    {
      id: 1,
      title: 'Update product catalog',
      start: new Date(2024, 0, 25, 9, 0),
      end: new Date(2024, 0, 25, 12, 0),
      type: 'task',
      priority: 4,
      client: 'The Candy Store',
      className: 'task-event priority-4'
    },
    {
      id: 2,
      title: 'Client meeting',
      start: new Date(2024, 0, 26, 14, 0),
      end: new Date(2024, 0, 26, 15, 0),
      type: 'event',
      client: 'The Estate Plan',
      className: 'event-event'
    },
    {
      id: 3,
      title: 'Content creation',
      start: new Date(2024, 0, 28, 10, 0),
      end: new Date(2024, 0, 28, 14, 0),
      type: 'task',
      priority: 3,
      client: 'The Estate Plan',
      className: 'task-event'
    },
    {
      id: 4,
      title: 'Review payment gateway',
      start: new Date(2024, 0, 29, 9, 0),
      end: new Date(2024, 0, 29, 11, 0),
      type: 'task',
      priority: 5,
      client: 'The Candy Store',
      className: 'task-event priority-5'
    },
    {
      id: 5,
      title: 'Team standup',
      start: new Date(2024, 0, 30, 9, 0),
      end: new Date(2024, 0, 30, 9, 30),
      type: 'event',
      className: 'event-event'
    }
  ];

  const upcomingTasks = [
    {
      id: 1,
      name: 'Update product catalog',
      client: 'The Candy Store',
      time: '9:00 AM',
      date: 'Jan 25',
      color: '#e67e22'
    },
    {
      id: 2,
      name: 'Review payment gateway',
      client: 'The Candy Store',
      time: '9:00 AM',
      date: 'Jan 29',
      color: '#e74c3c'
    },
    {
      id: 3,
      name: 'Content creation',
      client: 'The Estate Plan',
      time: '10:00 AM',
      date: 'Jan 28',
      color: '#f39c12'
    }
  ];

  const upcomingEvents = [
    {
      id: 1,
      name: 'Client meeting',
      client: 'The Estate Plan',
      time: '2:00 PM',
      date: 'Jan 26',
      color: '#2ecc71'
    },
    {
      id: 2,
      name: 'Team standup',
      time: '9:00 AM',
      date: 'Jan 30',
      color: '#2ecc71'
    }
  ];

  const stats = {
    totalTasks: 8,
    completedTasks: 3,
    totalEvents: 5,
    todayItems: 2
  };

  const handleSelectSlot = ({ start, end }) => {
    setSelectedDate({ start, end });
    setShowTaskModal(true);
  };

  const handleSelectEvent = (event) => {
    console.log('Selected event:', event);
  };

  const eventStyleGetter = (event) => {
    return {
      style: {
        fontSize: '12px',
        fontWeight: '500'
      }
    };
  };

  return (
    <PageContainer className="animate-fade-in">
      <PageHeader>
        <PageTitle>Calendar</PageTitle>
        <HeaderActions>
          <ViewSelector>
            <ViewButton 
              isActive={currentView === 'month'}
              onClick={() => setCurrentView('month')}
            >
              Month
            </ViewButton>
            <ViewButton 
              isActive={currentView === 'week'}
              onClick={() => setCurrentView('week')}
            >
              Week
            </ViewButton>
            <ViewButton 
              isActive={currentView === 'day'}
              onClick={() => setCurrentView('day')}
            >
              Day
            </ViewButton>
          </ViewSelector>
          <AddButtonGroup>
            <AddButton variant="task" onClick={() => setShowTaskModal(true)}>
              <FiPlus />
              Add Task
            </AddButton>
            <AddButton variant="event" onClick={() => setShowEventModal(true)}>
              <FiPlus />
              Add Event
            </AddButton>
          </AddButtonGroup>
        </HeaderActions>
      </PageHeader>

      <CalendarContainer>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          view={currentView}
          onView={setCurrentView}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          selectable
          eventPropGetter={eventStyleGetter}
          formats={{
            timeGutterFormat: 'h:mm A',
            eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
              localizer.format(start, 'h:mm A', culture) + ' - ' +
              localizer.format(end, 'h:mm A', culture),
          }}
        />
      </CalendarContainer>

      <SidePanel>
        <PanelCard>
          <h3>
            <FiClock />
            Upcoming Tasks
          </h3>
          <UpcomingList>
            {upcomingTasks.map((task) => (
              <UpcomingItem key={task.id} color={task.color}>
                <ItemInfo>
                  <h4>{task.name}</h4>
                  <p className="meta">{task.client}</p>
                </ItemInfo>
                <ItemTime>
                  <div className="time">{task.time}</div>
                  <div>{task.date}</div>
                </ItemTime>
              </UpcomingItem>
            ))}
          </UpcomingList>
        </PanelCard>

        <PanelCard>
          <h3>
            <FiCalendar />
            Upcoming Events
          </h3>
          <UpcomingList>
            {upcomingEvents.map((event) => (
              <UpcomingItem key={event.id} color={event.color}>
                <ItemInfo>
                  <h4>{event.name}</h4>
                  <p className="meta">{event.client || 'Internal'}</p>
                </ItemInfo>
                <ItemTime>
                  <div className="time">{event.time}</div>
                  <div>{event.date}</div>
                </ItemTime>
              </UpcomingItem>
            ))}
          </UpcomingList>
        </PanelCard>
      </SidePanel>

      <PanelCard style={{ marginTop: '24px' }}>
        <h3>
          <FiUser />
          Calendar Stats
        </h3>
        <StatsGrid>
          <StatItem>
            <div className="number">{stats.totalTasks}</div>
            <div className="label">Total Tasks</div>
          </StatItem>
          <StatItem>
            <div className="number">{stats.completedTasks}</div>
            <div className="label">Completed</div>
          </StatItem>
          <StatItem>
            <div className="number">{stats.totalEvents}</div>
            <div className="label">Events</div>
          </StatItem>
          <StatItem>
            <div className="number">{stats.todayItems}</div>
            <div className="label">Today</div>
          </StatItem>
        </StatsGrid>
      </PanelCard>

      <AddTaskModal 
        isOpen={showTaskModal} 
        onClose={() => setShowTaskModal(false)}
        selectedDate={selectedDate}
      />
      
      <AddEventModal 
        isOpen={showEventModal} 
        onClose={() => setShowEventModal(false)}
        selectedDate={selectedDate}
      />
    </PageContainer>
  );
};

export default CalendarPage;