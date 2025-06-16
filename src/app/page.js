"use client";
import "bootstrap/dist/css/bootstrap.min.css";
import './app.css';
import { useState, useEffect } from 'react';

function Sidebar({ questions, selectedOptions, onSelect, onClear }) {
  const [visibleTips, setVisibleTips] = useState({});

  const toggleTip = (id) => {
    setVisibleTips(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="p-3 border-end bg-light" style={{ minWidth: "300px" }}>
      <button className="btn btn-outline-danger mb-3" onClick={onClear}>Clear All</button>
      {questions.map(q => (
        <div key={q.id} className="mb-4">
          <div className="d-flex align-items-center justify-content-between mb-1">
            <h5 className="mb-0">{q.label}</h5>
            <button
              className="btn btn-sm btn-outline-secondary ms-2"
              onClick={() => toggleTip(q.id)}
            >
              ?
            </button>
          </div>
          {visibleTips[q.id] && <div className="alert alert-info mt-2">{q.helpTip}</div>}
          <div className="d-flex flex-wrap gap-2 mt-2">
            {q.options.map(opt => {
              const isSelected = q.multi
                ? selectedOptions[q.id]?.includes(opt.slug)
                : selectedOptions[q.id] === opt.slug;

              return (
                <button
                  key={opt.slug}
                  className={`option-button ${isSelected ? "selected" : ""}`}
                  onClick={() => onSelect(q.id, opt.slug, q.multi)}
                >
                  {opt.text}
                </button>
              );
            })}
          </div>
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
    <div className="row g-3">
      {services.map(service => {
        const compatible = isCompatible(service);
        return (
          <div key={service.name} className="col-12 col-md-6 col-lg-4">
            <div className={`card h-100 ${selected.includes(service.name) ? "border-primary" : ""} ${!compatible ? "opacity-25" : "cursor-pointer"}`}
                 style={{ cursor: compatible ? "pointer" : "not-allowed" }}
                 onClick={() => compatible && toggleSelect(service.name)}>
              <div className="card-body">
                <h5 className="card-title">{service.name}</h5>
                <p className="card-text">{service.description}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ComparisonTable({ selectedServices }) {
  if (selectedServices.length === 0) return null;

  const attributes = [
    { key: 'description', label: 'Description' },
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
    <div className="mt-5">
      <h2 className="mb-3">Service Comparison</h2>
      <div className="table-responsive">
        <table className="table table-bordered align-middle">
          <thead className="table-light">
            <tr>
              <th>Attribute</th>
              {selectedServices.map((service) => (
                <th key={service.name}>{service.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {attributes.map(attr => (
              <tr key={attr.key}>
                <th scope="row">{attr.label}</th>
                {selectedServices.map(service => (
                  <td key={service.name} dangerouslySetInnerHTML={{ __html: service.details[attr.key] }}></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="loading-screen d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="text-center">
        <div className="spinner-border text-primary mb-3" role="status" />
        <h4>Loading…</h4>
        <p className="text-muted">Please wait...</p>
      </div>
    </div>
  );
}

function App() {
  const [selectedOptions, setSelectedOptions] = useState({});
  const [selected, setSelected] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [templatedHeaderHtml, setTemplatedHeaderHtml] = useState('');
  const [questions, setQuestions] = useState([]);
  const [services, setServices] = useState([]);


  const handleOptionSelect = (questionId, optionSlug, isMulti) => {
    setSelectedOptions(prev => {
      if (!isMulti) {
        return { ...prev, [questionId]: prev[questionId] === optionSlug ? null : optionSlug };
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

  useEffect(() => {
    // Load templates
    fetch('/templates/header.tpl').then(resp => {
      if (!resp.ok) return;

      return resp.text();
    })
    .then(setTemplatedHeaderHtml)
    .catch(() => {
      setTemplatedHeaderHtml('');
    });

    // Load questions
    fetch('/questions.json').then(resp => {
      if (!resp.ok) throw new Error("Unable to load questions!");

      return resp.json();
    })
    .then(setQuestions)
    .catch(error => {
      console.error('Error loading questions JSON:', error);
    });

    // Load services
    fetch('/services.json').then(resp => {
      if (!resp.ok) throw new Error("Unable to load services!");

      return resp.json();
    })
    .then(setServices)
    .catch(error => {
      console.error('Error loading services JSON:', error);
    })

    setIsLoading(false);
  },[isLoading]);

  return (
    <div>
      {
        isLoading ? (<LoadingScreen />) : (
          <>
            <div dangerouslySetInnerHTML={ { __html: templatedHeaderHtml }}></div>

            <div className="d-flex flex-column flex-md-row min-vh-100">
              <Sidebar
                questions={questions}
                selectedOptions={selectedOptions}
                onSelect={handleOptionSelect}
                onClear={handleClear}
              />
              <main className="flex-grow-1 p-4 overflow-auto">
                <ServiceList
                  services={services}
                  selectedOptions={selectedOptions}
                  selected={selected}
                  toggleSelect={toggleSelect}
                />
                <ComparisonTable selectedServices={selectedServices} />
              </main>
            </div>
          </>
        )            
      }
    </div>
  );
}

export default App;