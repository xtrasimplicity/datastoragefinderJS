"use client";
import './app.css';
import { useState } from 'react';
import questions from './questions.json';
import services from './services.json';

function Sidebar({ questions, selectedOptions, onSelect, onClear }) {
  const [visibleTips, setVisibleTips] = useState({});

  const toggleTip = (id) => {
    setVisibleTips(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="sidebar">
      <button className="clear-button" onClick={onClear}>Clear All</button>
      {questions.map(q => (
        <div key={q.id} className="question-block">
          <div className="question-header">
            <h4>{q.label}</h4>
            <button className="help-icon" onClick={() => toggleTip(q.id)}>?</button>
          </div>
          {visibleTips[q.id] && <div className="help-tip">{q.helpTip}</div>}
          {q.options.map(opt => {
            const isSelected = q.multi
              ? selectedOptions[q.id]?.includes(opt.slug)
              : selectedOptions[q.id] === opt.slug;

            return (
              <button
                key={opt.slug}
                className={`option-button ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelect(q.id, opt.slug, q.multi)}
              >
                {opt.text}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function ServiceList({ services, selectedOptions, selected, toggleSelect }) {
  const isCompatible = (service) => {
    return Object.entries(selectedOptions).every(([key, value]) => {
      if (!value) return true;
      const criteria = service.criteria[key];
      if (!criteria) return false;
      if (Array.isArray(value)) {
        return value.some(v => criteria.includes(v));
      }
      return criteria.includes(value);
    });
  };

  return (
    <div className="service-list">
      {services.map(service => {
        const compatible = isCompatible(service);
        return (
          <div
            key={service.name}
            className={`service-card ${selected.includes(service.name) ? 'selected' : ''} ${compatible ? '' : 'disabled'}`}
            onClick={() => compatible && toggleSelect(service.name)}
          >
            <h3>{service.name}</h3>
            <p>{service.description}</p>
          </div>
        );
      })}
    </div>
  );
}

function ComparisonTable({ selectedServices }) {
  if (selectedServices.length === 0) return null;

  const attributes = [
    { key: 'exampleUse', label: 'Example Use' },
    { key: 'cost', label: 'Cost' },
    { key: 'capacity', label: 'Capacity' },
    { key: 'access', label: 'Access & Collaboration' },
    { key: 'classifications', label: 'Data Classifications Allowed' },
    { key: 'durability', label: 'Durability' },
    { key: 'availability', label: 'Availability' },
    { key: 'complexity', label: 'Technical Complexity' },
    { key: 'support', label: 'Support Contact' },
    { key: 'howToAccess', label: 'How to Access' }
  ];

  return (
    <div className="comparison-table">
      <h2>Service Comparison</h2>
      <table>
        <thead>
          <tr>
            <th>Attribute</th>
            {selectedServices.map(service => (
              <th key={service.name}>{service.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {attributes.map(attr => (
            <tr key={attr.key}>
              <td>{attr.label}</td>
              {selectedServices.map(service => (
                <td key={service.name} dangerouslySetInnerHTML={ { __html: service.details[attr.key] }}></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function App() {
  const [selectedOptions, setSelectedOptions] = useState({});
  const [selected, setSelected] = useState([]);

  const handleOptionSelect = (questionId, optionSlug, isMulti) => {
    setSelectedOptions(prev => {
      if (!isMulti) {
        return { ...prev, [questionId]: optionSlug };
      }
      const current = prev[questionId] || [];
      const updated = current.includes(optionSlug)
        ? current.filter(o => o !== optionSlug)
        : [...current, optionSlug];
      return { ...prev, [questionId]: updated };
    });
  };

  const toggleSelect = (name) => {
    setSelected(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const handleClear = () => {
    setSelectedOptions({});
    setSelected([]);
  };

  const selectedServices = services.filter(s => selected.includes(s.name));

  return (
    <div className="app-container">
      <Sidebar
        questions={questions}
        selectedOptions={selectedOptions}
        onSelect={handleOptionSelect}
        onClear={handleClear}
      />
      <div className="main-content">
        <ServiceList
          services={services}
          selectedOptions={selectedOptions}
          selected={selected}
          toggleSelect={toggleSelect}
        />
        <ComparisonTable selectedServices={selectedServices} />
      </div>
    </div>
  );
}

export default App;