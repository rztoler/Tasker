import React, { useState } from 'react';
import styled from 'styled-components';
import Modal from 'react-modal';
import DatePicker from 'react-datepicker';
import { FiX, FiCheckSquare, FiFolderPlus, FiCalendar, FiClock, FiFlag } from 'react-icons/fi';
import toast from 'react-hot-toast';
import "react-datepicker/dist/react-datepicker.css";

const modalStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
    overflow: 'visible',
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
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
    color: #667eea;
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
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
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
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
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
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #999999;
  }
`;

const PriorityContainer = styled.div`
  display: flex;
  gap: 8px;
`;

const PriorityButton = styled.button`
  flex: 1;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  border: 2px solid ${props => props.isSelected ? getPriorityColor(props.priority) : '#e1e5e9'};
  background: ${props => props.isSelected ? getPriorityColor(props.priority) : 'white'};
  color: ${props => props.isSelected ? 'white' : '#666666'};
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => getPriorityColor(props.priority)};
    background: ${props => props.isSelected ? getPriorityColor(props.priority) : 'rgba(102, 126, 234, 0.05)'};
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
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
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
  
  ${props => props.variant === 'primary' ? `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
    }
  ` : `
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

const AddTaskModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    projectId: '',
    description: '',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 7 days from now
    duration: 1,
    priority: 3
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock projects data - in real app, this would come from API
  const projects = [
    { id: '1', name: 'Website Redesign', client: 'The Candy Store' },
    { id: '2', name: 'Marketing Campaign', client: 'The Estate Plan' },
    { id: '3', name: 'Database Migration', client: 'Tech Solutions Inc' },
    { id: '4', name: 'Brand Identity', client: 'Creative Agency' },
    { id: '5', name: 'SEO Optimization', client: 'Digital Marketing Co' }
  ];

  const durationOptions = [
    { value: 0.25, label: '15 minutes' },
    { value: 0.5, label: '30 minutes' },
    { value: 1, label: '1 hour' },
    { value: 1.5, label: '1.5 hours' },
    { value: 2, label: '2 hours' },
    { value: 3, label: '3 hours' },
    { value: 4, label: '4 hours' },
    { value: 6, label: '6 hours' },
    { value: 8, label: '8 hours' }
  ];

  const handleInputChange = (e) => {
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

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      dueDate: date
    }));
  };

  const handlePrioritySelect = (priority) => {
    setFormData(prev => ({
      ...prev,
      priority
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Task name is required';
    }

    if (!formData.projectId) {
      newErrors.projectId = 'Please select a project';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    } else if (formData.dueDate < new Date()) {
      newErrors.dueDate = 'Due date cannot be in the past';
    }

    if (!formData.duration || formData.duration <= 0) {
      newErrors.duration = 'Duration must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: API call to create task
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast.success('Task created successfully!');
      onClose();
      setFormData({
        name: '',
        projectId: '',
        description: '',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        duration: 1,
        priority: 3
      });
    } catch (error) {
      toast.error('Failed to create task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      projectId: '',
      description: '',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      duration: 1,
      priority: 3
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      style={modalStyles}
      ariaHideApp={false}
    >
      <ModalContent>
        <ModalHeader>
          <h2>Add New Task</h2>
          <CloseButton onClick={handleClose}>
            <FiX />
          </CloseButton>
        </ModalHeader>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>
              <FiCheckSquare />
              Task Name *
            </Label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter task name"
            />
            {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label>
              <FiFolderPlus />
              Project *
            </Label>
            <Select
              name="projectId"
              value={formData.projectId}
              onChange={handleInputChange}
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} ({project.client})
                </option>
              ))}
            </Select>
            {errors.projectId && <ErrorMessage>{errors.projectId}</ErrorMessage>}
          </FormGroup>

          <FormRow>
            <FormGroup>
              <Label>
                <FiCalendar />
                Due Date *
              </Label>
              <DatePickerWrapper>
                <DatePicker
                  selected={formData.dueDate}
                  onChange={handleDateChange}
                  dateFormat="MMMM d, yyyy"
                  minDate={new Date()}
                  placeholderText="Select due date"
                />
              </DatePickerWrapper>
              {errors.dueDate && <ErrorMessage>{errors.dueDate}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label>
                <FiClock />
                Duration *
              </Label>
              <Select
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
              >
                {durationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              {errors.duration && <ErrorMessage>{errors.duration}</ErrorMessage>}
            </FormGroup>
          </FormRow>

          <FormGroup>
            <Label>
              <FiFlag />
              Priority
            </Label>
            <PriorityContainer>
              {[1, 2, 3, 4, 5].map((priority) => (
                <PriorityButton
                  key={priority}
                  type="button"
                  priority={priority}
                  isSelected={formData.priority === priority}
                  onClick={() => handlePrioritySelect(priority)}
                >
                  {priority}
                </PriorityButton>
              ))}
            </PriorityContainer>
          </FormGroup>

          <FormGroup>
            <Label>
              Description (Optional)
            </Label>
            <TextArea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter task description"
            />
          </FormGroup>

          <ButtonGroup>
            <Button type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </Button>
          </ButtonGroup>
        </Form>
      </ModalContent>
    </Modal>
  );
};

export default AddTaskModal;