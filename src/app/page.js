"use client";
import "bootstrap/dist/css/bootstrap.min.css";
import './app.css';
import { useState, useEffect } from 'react';

function GetCaveats(service, selectedOptions) {
  const matches = [];
  if (!service.caveats) return matches;

  for (const [questionId, caveatInfo] of Object.entries(service.caveats)) {
    const selectedValue = selectedOptions[questionId];

    if (!selectedValue) continue;

    const selectedValues = Array.isArray(selectedValue) ? selectedValue : [selectedValue];

    const intersection = selectedValues.filter(val => caveatInfo.criteria.includes(val));

    if (intersection.length > 0) {
      matches.push(caveatInfo.caveat);
    }
  }

  return matches;
}


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
          {visibleTips[q.id] && <div className="alert alert-info mt-2" dangerouslySetInnerHTML={{ __html: q.helpTip }}></div>}
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
      if (!value || (Array.isArray(value) && value.length === 0)) return true;
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
        const caveats = compatible ? GetCaveats(service, selectedOptions) : [];

        return (
          <div key={service.name} className="col-12 col-md-6 col-lg-4 service">
            <div className={`card h-100 ${selected.includes(service.name) ? "border-primary" : ""} ${!compatible ? "opacity-25" : "cursor-pointer"}`}
                 style={{ cursor: compatible ? "pointer" : "not-allowed" }}
                 onClick={() => compatible && toggleSelect(service.name)}>
              <div className="card-body">
                <h5 className="card-title">
                  {service.name}
                  { caveats.length > 0 && <span className="caveat-asterisk">*</span>}
                </h5>
                <p className="card-text">{service.description}</p>
                { caveats.length > 0 && 
                    <div className="card-text">
                      <span className="caveat-warning">Note: The following caveats exist when using this service:</span>
                      <ul className="caveat-warning-list">
                        { caveats.map((caveat) => {
                            return <li key={ "service_" + service.name + "_caveat_" + caveat.title }>{caveat.title}</li>
                        })}
                      </ul>
                    </div> 
                  }
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ComparisonTable({ selectedServices, selectedOptions, dataClassifications }) {
  if (selectedServices.length === 0) return null;

  const fetchClassificationsValue = (service) => {
    // Get selected classification slug
    const selectedClassificationSlugs = selectedOptions['classification'];
    var classificationsString = "<ul>";

    if (!service.criteria) return "";
    if (!service.criteria.classification) return;

    service.criteria.classification.forEach((classificationSlug) => {
      const classificationName = dataClassifications[classificationSlug];
      classificationsString = classificationsString + "<li>" + classificationName + "</li>";
    });

    classificationsString = classificationsString + "</ul><br /><strong class='caveat-warning'>Note: Caveats may exist for some of these classifications. Before using this service, please select the classification of your data using this tool and review the caveats listed.";
    
    return classificationsString;
  };

  const fetchCaveatsValue = (service) => {
    const caveats = GetCaveats(service, selectedOptions);

    if (caveats.length == 0) return "None";

    var caveatString = "Based on the answers you've selected, the following caveats/conditions apply to the use of this service with your data.<ul class='caveat-warning-list'>";
    
    caveats.forEach((caveat) => {
      caveatString = caveatString + "<li>" + caveat.description + "</li>";
    })

    caveatString = caveatString + "</ul>";

    return "<span class='caveat-warning'>" + caveatString + "</span>";
  };

  const attributes = [
    { key: 'description', label: 'Description' },
    { key: 'exampleUse', label: 'Example Use' },
    { key: 'cost', label: 'Cost' },
    { key: 'capacity', label: 'Capacity' },
    { key: 'access', label: 'Access & Collaboration' },
    { key: 'classifications', label: 'Data Classifications Allowed', valueGetterFn: fetchClassificationsValue },
    { key: 'caveats', label: 'Caveats (based on selections)', valueGetterFn: fetchCaveatsValue },
    { key: 'durability', label: 'Durability' },
    { key: 'availability', label: 'Availability' },
    { key: 'complexity', label: 'Technical Complexity' },
    { key: 'support', label: 'Support Contact' },
    { key: 'howToAccess', label: 'How to Access' }
  ];

  return (
    <div className="mt-5">
      <h2 className="mb-3">Service Comparison</h2>
      <div className="table-responsive comparison-table">
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
                {selectedServices.map(service => {
                  const value =  attr.valueGetterFn ? attr.valueGetterFn(service) :  service.details[attr.key];

                  return (<td key={service.name} dangerouslySetInnerHTML={{ __html: value }}></td>);   
                })}
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
  const [templatedFooterHtml, setTemplatedFooterHtml] = useState('');
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

    fetch('/templates/footer.tpl').then(resp => {
      if (!resp.ok) return;

      return resp.text();
    })
    .then(setTemplatedFooterHtml)
    .catch(() => {
      setTemplatedFooterHtml('');
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


  const dataClassifications = (() => {
    var classificationQuestion = null;
    const classificationQuestionArr = questions.filter(q => q.id == "classification");
    
    if (!classificationQuestionArr || classificationQuestionArr.length == 0) return {};
    
    classificationQuestion = classificationQuestionArr[0];

    if (!classificationQuestion.options || classificationQuestion.options.length == 0) return {};

    var classifications = {};

    classificationQuestion.options.forEach((option) => {
      classifications[option.slug] = option.text;
    });

    return classifications;    
  })();

  return (
    <div>
      {
        isLoading ? (<LoadingScreen />) : (
          <>
            <div dangerouslySetInnerHTML={ { __html: templatedHeaderHtml }}></div>
            <div className="d-flex flex-column flex-md-row min-vh-100 pb-5">
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
                <ComparisonTable selectedServices={selectedServices} selectedOptions={selectedOptions} dataClassifications={dataClassifications} />
              </main>
            </div>
            <div dangerouslySetInnerHTML={ { __html: templatedFooterHtml }}></div>
          </>
        )            
      }
    </div>
  );
}

export default App;