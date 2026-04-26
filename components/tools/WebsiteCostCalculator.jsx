"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import '../../styles/tools/WebsiteCostCalculator.css';

const t = (key, fallback) => fallback ?? key;

const WebsiteCostCalculator = () => {
    const { theme } = useTheme();
    
    const [projectDetails, setProjectDetails] = useState({
        name: '',
        type: 'corporate',
        description: ''
    });
    
    const [features, setFeatures] = useState({
        responsive: true,
        cms: false,
        blog: false,
        contact: true,
        social: false,
        multilingual: false,
        userAccounts: false,
        payment: false,
        inventory: false,
        booking: false,
        api: false,
        analytics: false
    });
    
    const [design, setDesign] = useState({
        type: 'custom',
        pages: 5,
        revisions: 3,
        branding: false
    });
    
    const [development, setDevelopment] = useState({
        platform: 'react',
        complexity: 'medium',
        integrations: 0
    });
    
    const [content, setContent] = useState({
        strategy: 'basic',
        pages: 5,
        blogPosts: 0,
        seo: false
    });
    
    const [timeline, setTimeline] = useState({
        duration: 'standard',
        rushFee: 0
    });
    
    const [teamRates, setTeamRates] = useState({
        projectManager: 75,
        designer: 65,
        frontend: 70,
        backend: 80,
        content: 45,
        seo: 60
    });
    
    const [additionalCosts, setAdditionalCosts] = useState({
        hosting: 50,
        domain: 15,
        ssl: 0,
        thirdParty: 0,
        maintenance: 100
    });

    // Cost calculation logic
    const calculateCosts = useCallback(() => {
        const costs = {
            design: 0,
            development: 0,
            content: 0,
            projectManagement: 0,
            seo: 0,
            hosting: 0,
            thirdParty: 0
        };

        // Design Costs
        const designMultipliers = { template: 1, custom: 2, premium: 3, branding: 1.5 };
        costs.design = design.pages * 8 * teamRates.designer * designMultipliers[design.type];
        if (design.branding) costs.design += 2000;

        // Development Costs
        const platformMultipliers = { wordpress: 1, shopify: 1.2, react: 1.5, vue: 1.4, angular: 1.6, customStack: 2 };
        const complexityMultipliers = { low: 0.8, medium: 1, high: 1.5, enterprise: 2 };
        
        const baseDevCost = design.pages * 12 * teamRates.frontend;
        costs.development = baseDevCost * platformMultipliers[development.platform] * complexityMultipliers[development.complexity];
        
        // Feature-based additional costs
        if (features.cms) costs.development += 2000;
        if (features.userAccounts) costs.development += 1500;
        if (features.payment) costs.development += 2500;
        if (features.booking) costs.development += 3000;
        if (features.api) costs.development += 2000;

        // Content Costs
        const contentMultipliers = { client: 0, basic: 1, professional: 1.8, seo: 2.2 };
        costs.content = content.pages * 3 * teamRates.content * contentMultipliers[content.strategy];
        if (content.blogPosts > 0) costs.content += content.blogPosts * 2 * teamRates.content;

        // Project Management (15% of total dev/design)
        costs.projectManagement = (costs.design + costs.development) * 0.15;

        // SEO Costs
        if (content.seo) costs.seo = 1200;
        if (features.analytics) costs.seo += 800;

        // Hosting & Maintenance
        costs.hosting = additionalCosts.hosting * 12; // Annual
        costs.hosting += additionalCosts.domain * 12;
        costs.hosting += additionalCosts.ssl;
        costs.hosting += additionalCosts.maintenance * 12;

        // Third-party services
        costs.thirdParty = additionalCosts.thirdParty;

        // Timeline adjustments
        const timelineMultipliers = { rush: 1.3, standard: 1, extended: 0.9, complex: 1.1 };
        const multiplier = timelineMultipliers[timeline.duration];
        
        Object.keys(costs).forEach(key => {
            if (key !== 'hosting' && key !== 'thirdParty') {
                costs[key] *= multiplier;
            }
        });

        return costs;
    }, [projectDetails, features, design, development, content, timeline, teamRates, additionalCosts]);

    const costs = useMemo(() => calculateCosts(), [calculateCosts]);
    
    const totalCost = useMemo(() => {
        return Object.values(costs).reduce((sum, cost) => sum + cost, 0);
    }, [costs]);

    const projectTypes = [
        { id: 'landing', name: "Landing Page", baseCost: 1500 },
        { id: 'brochure', name: "Brochure Website", baseCost: 3000 },
        { id: 'corporate', name: "Corporate Website", baseCost: 8000 },
        { id: 'ecommerce', name: "E-commerce Store", baseCost: 12000 },
        { id: 'webapp', name: "Web Application", baseCost: 20000 },
        { id: 'custom', name: "Custom Platform", baseCost: 35000 }
    ];

    const designOptions = [
        { id: 'template', name: "Template-Based", multiplier: 1 },
        { id: 'custom', name: "Custom Design", multiplier: 2 },
        { id: 'premium', name: "Premium Custom", multiplier: 3 },
        { id: 'branding', name: "Branding Package", multiplier: 1.5 }
    ];

    const developmentPlatforms = [
        { id: 'wordpress', name: "WordPress", multiplier: 1 },
        { id: 'shopify', name: "Shopify", multiplier: 1.2 },
        { id: 'react', name: "React/Next.js", multiplier: 1.5 },
        { id: 'vue', name: "Vue/Nuxt.js", multiplier: 1.4 },
        { id: 'angular', name: "Angular", multiplier: 1.6 },
        { id: 'customStack', name: "Custom Stack", multiplier: 2 }
    ];

    const handleFeatureToggle = useCallback((feature) => {
        setFeatures(prev => ({
            ...prev,
            [feature]: !prev[feature]
        }));
    }, []);

    const handleTeamRateChange = useCallback((role, value) => {
        setTeamRates(prev => ({
            ...prev,
            [role]: Math.max(0, parseInt(value) || 0)
        }));
    }, []);

    const handleAdditionalCostChange = useCallback((item, value) => {
        setAdditionalCosts(prev => ({
            ...prev,
            [item]: Math.max(0, parseInt(value) || 0)
        }));
    }, []);

    const exportToPDF = useCallback(() => {
        // PDF export functionality would go here
        alert('PDF export functionality would be implemented here');
    }, [projectDetails, costs, totalCost]);

    const resetCalculator = useCallback(() => {
        setProjectDetails({ name: '', type: 'corporate', description: '' });
        setFeatures({
            responsive: true, cms: false, blog: false, contact: true,
            social: false, multilingual: false, userAccounts: false,
            payment: false, inventory: false, booking: false, api: false, analytics: false
        });
        setDesign({ type: 'custom', pages: 5, revisions: 3, branding: false });
        setDevelopment({ platform: 'react', complexity: 'medium', integrations: 0 });
        setContent({ strategy: 'basic', pages: 5, blogPosts: 0, seo: false });
        setTimeline({ duration: 'standard', rushFee: 0 });
        setTeamRates({
            projectManager: 75, designer: 65, frontend: 70,
            backend: 80, content: 45, seo: 60
        });
        setAdditionalCosts({
            hosting: 50, domain: 15, ssl: 0,
            thirdParty: 0, maintenance: 100
        });
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    return (
        <div className={`website-cost-calculator ${theme}`}>
            <div className="calculator-header">
                <h1>{"Website Cost Calculator"}</h1>
                <p>{"Professional website development cost estimator for agencies and freelancers"}</p>
            </div>

            <div className="calculator-container">
                {/* Left Panel - Inputs */}
                <div className="input-panel">
                    {/* Project Details */}
                    <section className="input-section">
                        <h3>{"Project Details"}</h3>
                        <div className="input-group">
                            <label>{"Project Name"}</label>
                            <input
                                type="text"
                                value={projectDetails.name}
                                onChange={(e) => setProjectDetails(prev => ({
                                    ...prev,
                                    name: e.target.value
                                }))}
                                placeholder={"Enter project name..."}
                            />
                        </div>
                        <div className="input-group">
                            <label>{"Project Type"}</label>
                            <select
                                value={projectDetails.type}
                                onChange={(e) => setProjectDetails(prev => ({
                                    ...prev,
                                    type: e.target.value
                                }))}
                            >
                                {projectTypes.map(type => (
                                    <option key={type.id} value={type.id}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </section>

                    {/* Features */}
                    <section className="input-section">
                        <h3>{"Features & Functionality"}</h3>
                        <div className="features-grid">
                            {Object.entries(features).map(([key, value]) => (
                                <label key={key} className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={value}
                                        onChange={() => handleFeatureToggle(key)}
                                    />
                                    <span>{t(`featuresList.${key}`)}</span>
                                </label>
                            ))}
                        </div>
                    </section>

                    {/* Design */}
                    <section className="input-section">
                        <h3>{"Design & UX"}</h3>
                        <div className="input-group">
                            <label>Design Approach</label>
                            <select
                                value={design.type}
                                onChange={(e) => setDesign(prev => ({
                                    ...prev,
                                    type: e.target.value
                                }))}
                            >
                                {designOptions.map(option => (
                                    <option key={option.id} value={option.id}>
                                        {option.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Number of Pages</label>
                            <input
                                type="number"
                                min="1"
                                max="50"
                                value={design.pages}
                                onChange={(e) => setDesign(prev => ({
                                    ...prev,
                                    pages: parseInt(e.target.value) || 1
                                }))}
                            />
                        </div>
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={design.branding}
                                onChange={(e) => setDesign(prev => ({
                                    ...prev,
                                    branding: e.target.checked
                                }))}
                            />
                            <span>Include Branding Package</span>
                        </label>
                    </section>

                    {/* Development */}
                    <section className="input-section">
                        <h3>{"Development"}</h3>
                        <div className="input-group">
                            <label>Development Platform</label>
                            <select
                                value={development.platform}
                                onChange={(e) => setDevelopment(prev => ({
                                    ...prev,
                                    platform: e.target.value
                                }))}
                            >
                                {developmentPlatforms.map(platform => (
                                    <option key={platform.id} value={platform.id}>
                                        {platform.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Complexity Level</label>
                            <select
                                value={development.complexity}
                                onChange={(e) => setDevelopment(prev => ({
                                    ...prev,
                                    complexity: e.target.value
                                }))}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="enterprise">Enterprise</option>
                            </select>
                        </div>
                    </section>

                    {/* Team Rates */}
                    <section className="input-section">
                        <h3>{"Team & Rates"}</h3>
                        {Object.entries(teamRates).map(([role, rate]) => (
                            <div key={role} className="input-group">
                                <label>{t(`teamRoles.${role}`)} ($/hr)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={rate}
                                    onChange={(e) => handleTeamRateChange(role, e.target.value)}
                                />
                            </div>
                        ))}
                    </section>

                    {/* Additional Costs */}
                    <section className="input-section">
                        <h3>Additional Costs</h3>
                        {Object.entries(additionalCosts).map(([item, cost]) => (
                            <div key={item} className="input-group">
                                <label>
                                    {item === 'hosting' ? 'Monthly Hosting' :
                                     item === 'domain' ? 'Domain (annual)' :
                                     item === 'ssl' ? 'SSL Certificate' :
                                     item === 'maintenance' ? 'Monthly Maintenance' :
                                     'Third-Party Services'} ($)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={cost}
                                    onChange={(e) => handleAdditionalCostChange(item, e.target.value)}
                                />
                            </div>
                        ))}
                    </section>
                </div>

                {/* Right Panel - Results */}
                <div className="results-panel">
                    <div className="cost-summary">
                        <h3>{"Cost Summary"}</h3>
                        <div className="total-cost">
                            <span className="label">{"Total Estimated Cost"}:</span>
                            <span className="amount">{formatCurrency(totalCost)}</span>
                        </div>

                        <div className="cost-breakdown">
                            <h4>{"Cost Breakdown"}</h4>
                            {Object.entries(costs).map(([category, cost]) => (
                                <div key={category} className="breakdown-item">
                                    <span className="category">
                                        {t(`costElements.${category}`)}:
                                    </span>
                                    <span className="cost">{formatCurrency(cost)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="action-buttons">
                            <button onClick={exportToPDF} className="primary-btn">
                                {"Export PDF Proposal"}
                            </button>
                            <button onClick={resetCalculator} className="secondary-btn">
                                {"Reset"}
                            </button>
                        </div>
                    </div>

                    {/* Project Assumptions */}
                    <div className="assumptions-section">
                        <h4>{"Assumptions"}</h4>
                        <ul>
                            <li>Project management included (15% of development cost)</li>
                            <li>Timeline: {timeline.duration}</li>
                            <li>Design revisions: {design.revisions} included</li>
                            <li>Hosting and maintenance for first year included</li>
                            <li>All prices in USD</li>
                        </ul>
                    </div>

                    {/* Feature Impact */}
                    <div className="feature-impact">
                        <h4>Feature Impact on Cost</h4>
                        <div className="impact-list">
                            {Object.entries(features).map(([feature, enabled]) => {
                                if (!enabled) return null;
                                const impact = getFeatureImpact(feature);
                                return (
                                    <div key={feature} className="impact-item">
                                        <span>✓ {t(`featuresList.${feature}`)}</span>
                                        <span>+{formatCurrency(impact)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper function to calculate feature impact
const getFeatureImpact = (feature) => {
    const impacts = {
        cms: 2000,
        userAccounts: 1500,
        payment: 2500,
        booking: 3000,
        api: 2000,
        analytics: 800,
        multilingual: 1200,
        inventory: 1800
    };
    return impacts[feature] || 0;
};

export default WebsiteCostCalculator;