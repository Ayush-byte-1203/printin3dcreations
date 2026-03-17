import React, { useState } from 'react';
import './CSS/Process.css';

const processData = [
    { id: '01', title: 'Consultation', desc: 'During the initial consultation, we will discuss your business goals and objectives, target audience, and current marketing efforts. This will allow us to understand your needs and tailor our services to best fit your requirements.' },
    { id: '02', title: 'Research and Strategy Development', desc: 'Detailed research and strategy planning tailored to your market.' },
    { id: '03', title: 'Implementation', desc: 'Executing the strategy with our expert team.' },
    { id: '04', title: 'Monitoring and Optimization', desc: 'Continuous tracking and tweaking for best performance.' },
    { id: '05', title: 'Reporting and Communication', desc: 'Regular updates and transparent reporting.' },
    { id: '06', title: 'Continual Improvement', desc: 'Ongoing refinement to ensure long-term success.' },
];

const Process = () => {
    const [openIndex, setOpenIndex] = useState(0);

    const toggleAccordion = (index) => {
        setOpenIndex(openIndex === index ? -1 : index);
    };

    return (
        <section className="process container section-padding">
            <div className="section-header">
                <h2 className="section-title">Our Process</h2>
                <h3 className="heading-secondary">Step-by-Step Guide to Success</h3>
                <p className="section-desc">Our proven methodology ensures we deliver consistent results for every client.</p>
            </div>

            <div className="accordion">
                {processData.map((item, index) => (
                    <div
                        key={index}
                        className={`glass-panel accordion-item ${openIndex === index ? 'open' : ''}`}
                    >
                        <div className="accordion-header" onClick={() => toggleAccordion(index)}>
                            <div className="accordion-title">
                                <span className="process-number text-gradient">{item.id}</span>
                                <h3>{item.title}</h3>
                            </div>
                            <div className="accordion-toggle">
                                <span className={`toggle-icon ${openIndex === index ? 'rotated' : ''}`}>+</span>
                            </div>
                        </div>
                        <div className={`accordion-collapse ${openIndex === index ? 'show' : ''}`}>
                            <div className="accordion-body">
                                <p>{item.desc}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Process;
