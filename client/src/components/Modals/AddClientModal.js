import React, { useState } from 'react';
import styled from 'styled-components';
import Modal from 'react-modal';
import { FiX, FiUser, FiMail, FiPhone, FiGlobe } from 'react-icons/fi';
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

const InputContainer = styled.div`
  position: relative;
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

const colorOptions = [
  '#3498db',
  '#e74c3c',
  '#2ecc71',
  '#f39c12',
  '#9b59b6',
  '#1abc9c',
  '#34495e',
  '#e67e22',
  '#95a5a6',
  '#16a085'
];

const timeZones = ['EST', 'CST', 'MST', 'PST', 'UTC', 'GMT', 'CET', 'JST', 'AEST', 'IST'];

const AddClientModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    color: '#3498db',
    timeZone: 'EST'
  });
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

  const handleColorSelect = color => {
    setFormData(prev => ({
      ...prev,
      color
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!formData.contactName.trim()) {
      newErrors.contactName = 'Contact name is required';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
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
      // TODO: API call to create client
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      toast.success('Client created successfully!');
      onClose();
      setFormData({
        companyName: '',
        contactName: '',
        email: '',
        phone: '',
        color: '#3498db',
        timeZone: 'EST'
      });
    } catch (error) {
      toast.error('Failed to create client. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      companyName: '',
      contactName: '',
      email: '',
      phone: '',
      color: '#3498db',
      timeZone: 'EST'
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={handleClose} style={modalStyles} ariaHideApp={false}>
      <ModalContent>
        <ModalHeader>
          <h2>Add New Client</h2>
          <CloseButton onClick={handleClose}>
            <FiX />
          </CloseButton>
        </ModalHeader>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>
              <FiUser />
              Company Name *
            </Label>
            <InputContainer>
              <Input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="Enter company name"
              />
              {errors.companyName && <ErrorMessage>{errors.companyName}</ErrorMessage>}
            </InputContainer>
          </FormGroup>

          <FormGroup>
            <Label>
              <FiUser />
              Contact Name *
            </Label>
            <InputContainer>
              <Input
                type="text"
                name="contactName"
                value={formData.contactName}
                onChange={handleInputChange}
                placeholder="Enter contact person name"
              />
              {errors.contactName && <ErrorMessage>{errors.contactName}</ErrorMessage>}
            </InputContainer>
          </FormGroup>

          <FormGroup>
            <Label>
              <FiMail />
              Email (Optional)
            </Label>
            <InputContainer>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
              />
              {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
            </InputContainer>
          </FormGroup>

          <FormGroup>
            <Label>
              <FiPhone />
              Phone (Optional)
            </Label>
            <InputContainer>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter phone number"
              />
            </InputContainer>
          </FormGroup>

          <FormGroup>
            <Label>Client Color</Label>
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
              <FiGlobe />
              Time Zone
            </Label>
            <Select name="timeZone" value={formData.timeZone} onChange={handleInputChange}>
              {timeZones.map(tz => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </Select>
          </FormGroup>

          <ButtonGroup>
            <Button type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Client'}
            </Button>
          </ButtonGroup>
        </Form>
      </ModalContent>
    </Modal>
  );
};

export default AddClientModal;
