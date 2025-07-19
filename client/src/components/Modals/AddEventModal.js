import React, { useState } from 'react';
import styled from 'styled-components';
import Modal from 'react-modal';
import DatePicker from 'react-datepicker';
import { FiX, FiCalendar, FiClock, FiMapPin, FiFileText, FiUsers } from 'react-icons/fi';
import toast from 'react-hot-toast';
import 'react-datepicker/dist/react-datepicker.css';

const modalStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  content: {
    position: 'relative',
    background: 'none',
    border: 'none',
    padding: 0,
    inset: 'auto',
    borderRadius: 0,
    maxWidth: '600px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'visible'
  }
};

const ModalContent = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  max-height: 90vh;
  overflow-y: auto;

  @media (max-width: 768px) {
    padding: 24px;
    border-radius: 16px;
    margin: 16px;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e1e5e9;

  h2 {
    font-size: 24px;
    font-weight: 700;
    color: #333333;
    margin: 0;
    background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  @media (max-width: 768px) {
    margin-bottom: 24px;
    padding-bottom: 16px;

    h2 {
      font-size: 20px;
    }
  }
`;

const CloseButton = styled.button`
  padding: 8px;
  border-radius: 8px;
  background: #f1f3f4;
  color: #666666;
  font-size: 20px;
  transition: all 0.2s ease;

  &:hover {
    background: #e8eaed;
    color: #333333;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #333333;
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    font-size: 16px;
    color: #2ecc71;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 16px 20px;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  font-size: 14px;
  color: #333333;
  background: white;
  transition: all 0.2s ease;

  &:focus {
    border-color: #2ecc71;
    box-shadow: 0 0 0 3px rgba(46, 204, 113, 0.1);
  }

  &::placeholder {
    color: #999999;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 16px 20px;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  font-size: 14px;
  color: #333333;
  background: white;
  transition: all 0.2s ease;

  &:focus {
    border-color: #2ecc71;
    box-shadow: 0 0 0 3px rgba(46, 204, 113, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 16px 20px;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  font-size: 14px;
  color: #333333;
  background: white;
  transition: all 0.2s ease;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;

  &:focus {
    border-color: #2ecc71;
    box-shadow: 0 0 0 3px rgba(46, 204, 113, 0.1);
  }

  &::placeholder {
    color: #999999;
  }
`;

const DatePickerWrapper = styled.div`
  .react-datepicker-wrapper {
    width: 100%;
  }

  .react-datepicker__input-container input {
    width: 100%;
    padding: 16px 20px;
    border: 2px solid #e1e5e9;
    border-radius: 12px;
    font-size: 14px;
    color: #333333;
    background: white;
    transition: all 0.2s ease;

    &:focus {
      border-color: #2ecc71;
      box-shadow: 0 0 0 3px rgba(46, 204, 113, 0.1);
    }
  }
`;

const ColorPickerContainer = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const ColorOption = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${props => props.color};
  border: 3px solid ${props => (props.isSelected ? '#333333' : 'transparent')};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 8px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Button = styled.button`
  flex: 1;
  padding: 16px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;

  ${props =>
    props.variant === 'primary'
      ? `
    background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(46, 204, 113, 0.3);
    }
  `
      : `
    background: #f1f3f4;
    color: #666666;
    
    &:hover {
      background: #e8eaed;
      color: #333333;
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 12px;
  margin-top: 4px;
`;

const AttendeeInput = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;

  input {
    flex: 1;
  }
`;

const AddAttendeeButton = styled.button`
  padding: 8px 12px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: #bbdefb;
  }
`;

const AttendeeList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const AttendeeTag = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #e8f5e8;
  color: #2e7d32;
  border-radius: 20px;
  font-size: 12px;

  button {
    color: #2e7d32;
    font-size: 14px;

    &:hover {
      color: #1b5e20;
    }
  }
`;

const colorOptions = [
  '#2ecc71',
  '#3498db',
  '#e74c3c',
  '#f39c12',
  '#9b59b6',
  '#1abc9c',
  '#34495e',
  '#e67e22',
  '#95a5a6',
  '#16a085'
];

const eventTypes = [
  { value: 'meeting', label: 'Meeting' },
  { value: 'appointment', label: 'Appointment' },
  { value: 'personal', label: 'Personal' },
  { value: 'break', label: 'Break' },
  { value: 'travel', label: 'Travel' },
  { value: 'deadline', label: 'Deadline' }
];

const AddEventModal = ({ isOpen, onClose, selectedDate }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDateTime: selectedDate?.start || new Date(),
    endDateTime: selectedDate?.end || new Date(Date.now() + 60 * 60 * 1000), // 1 hour later
    type: 'meeting',
    location: '',
    color: '#2ecc71',
    attendees: []
  });
  const [newAttendeeEmail, setNewAttendeeEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleDateTimeChange = (name, date) => {
    setFormData(prev => ({
      ...prev,
      [name]: date
    }));
  };

  const handleColorSelect = color => {
    setFormData(prev => ({
      ...prev,
      color
    }));
  };

  const addAttendee = () => {
    if (newAttendeeEmail && !formData.attendees.some(a => a.email === newAttendeeEmail)) {
      setFormData(prev => ({
        ...prev,
        attendees: [...prev.attendees, { email: newAttendeeEmail, status: 'pending' }]
      }));
      setNewAttendeeEmail('');
    }
  };

  const removeAttendee = emailToRemove => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.filter(a => a.email !== emailToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Event name is required';
    }

    if (!formData.startDateTime) {
      newErrors.startDateTime = 'Start date and time is required';
    }

    if (!formData.endDateTime) {
      newErrors.endDateTime = 'End date and time is required';
    } else if (formData.endDateTime <= formData.startDateTime) {
      newErrors.endDateTime = 'End time must be after start time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: API call to create event
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      toast.success('Event created successfully!');
      onClose();
      setFormData({
        name: '',
        description: '',
        startDateTime: new Date(),
        endDateTime: new Date(Date.now() + 60 * 60 * 1000),
        type: 'meeting',
        location: '',
        color: '#2ecc71',
        attendees: []
      });
    } catch (error) {
      toast.error('Failed to create event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      startDateTime: new Date(),
      endDateTime: new Date(Date.now() + 60 * 60 * 1000),
      type: 'meeting',
      location: '',
      color: '#2ecc71',
      attendees: []
    });
    setNewAttendeeEmail('');
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={handleClose} style={modalStyles} ariaHideApp={false}>
      <ModalContent>
        <ModalHeader>
          <h2>Add New Event</h2>
          <CloseButton onClick={handleClose}>
            <FiX />
          </CloseButton>
        </ModalHeader>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>
              <FiCalendar />
              Event Name *
            </Label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter event name"
            />
            {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
          </FormGroup>

          <FormRow>
            <FormGroup>
              <Label>
                <FiCalendar />
                Start Date & Time *
              </Label>
              <DatePickerWrapper>
                <DatePicker
                  selected={formData.startDateTime}
                  onChange={date => handleDateTimeChange('startDateTime', date)}
                  showTimeSelect
                  dateFormat="MMMM d, yyyy h:mm aa"
                  placeholderText="Select start date and time"
                />
              </DatePickerWrapper>
              {errors.startDateTime && <ErrorMessage>{errors.startDateTime}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label>
                <FiClock />
                End Date & Time *
              </Label>
              <DatePickerWrapper>
                <DatePicker
                  selected={formData.endDateTime}
                  onChange={date => handleDateTimeChange('endDateTime', date)}
                  showTimeSelect
                  dateFormat="MMMM d, yyyy h:mm aa"
                  placeholderText="Select end date and time"
                />
              </DatePickerWrapper>
              {errors.endDateTime && <ErrorMessage>{errors.endDateTime}</ErrorMessage>}
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <Label>Event Type</Label>
              <Select name="type" value={formData.type} onChange={handleInputChange}>
                {eventTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>
                <FiMapPin />
                Location (Optional)
              </Label>
              <Input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Enter location"
              />
            </FormGroup>
          </FormRow>

          <FormGroup>
            <Label>Event Color</Label>
            <ColorPickerContainer>
              {colorOptions.map(color => (
                <ColorOption
                  key={color}
                  type="button"
                  color={color}
                  isSelected={formData.color === color}
                  onClick={() => handleColorSelect(color)}
                />
              ))}
            </ColorPickerContainer>
          </FormGroup>

          <FormGroup>
            <Label>
              <FiUsers />
              Attendees (Optional)
            </Label>
            <AttendeeInput>
              <Input
                type="email"
                value={newAttendeeEmail}
                onChange={e => setNewAttendeeEmail(e.target.value)}
                placeholder="Enter attendee email"
              />
              <AddAttendeeButton type="button" onClick={addAttendee}>
                Add
              </AddAttendeeButton>
            </AttendeeInput>
            <AttendeeList>
              {formData.attendees.map(attendee => (
                <AttendeeTag key={attendee.email}>
                  {attendee.email}
                  <button type="button" onClick={() => removeAttendee(attendee.email)}>
                    <FiX />
                  </button>
                </AttendeeTag>
              ))}
            </AttendeeList>
          </FormGroup>

          <FormGroup>
            <Label>
              <FiFileText />
              Description (Optional)
            </Label>
            <TextArea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter event description"
            />
          </FormGroup>

          <ButtonGroup>
            <Button type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Event'}
            </Button>
          </ButtonGroup>
        </Form>
      </ModalContent>
    </Modal>
  );
};

export default AddEventModal;
