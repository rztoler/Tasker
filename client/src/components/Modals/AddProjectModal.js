import React, { useState } from 'react';
import styled from 'styled-components';
import Modal from 'react-modal';
import { FiX, FiFolderPlus, FiUser, FiFileText } from 'react-icons/fi';
import toast from 'react-hot-toast';

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
    maxWidth: '500px',
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
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
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

const AddProjectModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    clientId: '',
    description: '',
    status: 'active'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock clients data - in real app, this would come from API
  const clients = [
    { id: '1', companyName: 'The Candy Store' },
    { id: '2', companyName: 'The Estate Plan' },
    { id: '3', companyName: 'Tech Solutions Inc' },
    { id: '4', companyName: 'Creative Agency' },
    { id: '5', companyName: 'Digital Marketing Co' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'on-hold', label: 'On Hold' },
    { value: 'completed', label: 'Completed' }
  ];

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }

    if (!formData.clientId) {
      newErrors.clientId = 'Please select a client';
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
      // TODO: API call to create project
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      toast.success('Project created successfully!');
      onClose();
      setFormData({
        name: '',
        clientId: '',
        description: '',
        status: 'active'
      });
    } catch (error) {
      toast.error('Failed to create project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      clientId: '',
      description: '',
      status: 'active'
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={handleClose} style={modalStyles} ariaHideApp={false}>
      <ModalContent>
        <ModalHeader>
          <h2>Add New Project</h2>
          <CloseButton onClick={handleClose}>
            <FiX />
          </CloseButton>
        </ModalHeader>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>
              <FiFolderPlus />
              Project Name *
            </Label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter project name"
            />
            {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label>
              <FiUser />
              Client *
            </Label>
            <Select name="clientId" value={formData.clientId} onChange={handleInputChange}>
              <option value="">Select a client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.companyName}
                </option>
              ))}
            </Select>
            {errors.clientId && <ErrorMessage>{errors.clientId}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label>Status</Label>
            <Select name="status" value={formData.status} onChange={handleInputChange}>
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
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
              placeholder="Enter project description"
            />
          </FormGroup>

          <ButtonGroup>
            <Button type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </Button>
          </ButtonGroup>
        </Form>
      </ModalContent>
    </Modal>
  );
};

export default AddProjectModal;
