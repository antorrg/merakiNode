import { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';

interface PatientSearchBarProps {
  onSearch: (searchTerm: string) => void;
  initialValue?: string;
}

const PatientSearchBar = ({ onSearch, initialValue = '' }: PatientSearchBarProps) => {
  const [input, setInput] = useState(initialValue);

  useEffect(() => {
    setInput(initialValue);
  }, [initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(input.trim());
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);
    if (val === '') {
      onSearch('');
    }
  };

  return (
    <Form className="d-flex align-items-center mb-0" onSubmit={handleSubmit}>
      <Form.Control
        size="sm"
        type="search"
        placeholder="Nombre o número documento"
        className="me-2"
        aria-label="Buscar"
        value={input}
        onChange={handleChange}
      />
      <Button 
        size="sm"
        type="submit"
        variant="outline-success"
      >
        Buscar
      </Button>
    </Form>
  );
};

export default PatientSearchBar;
