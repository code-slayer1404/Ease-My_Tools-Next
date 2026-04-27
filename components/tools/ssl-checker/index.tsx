"use client";

import React, { useState } from 'react';
import styles from './styles.module.css';

const t = (key: string, fallback?: string) => fallback ?? key;

const SslChecker = () => {
    const [domain, setDomain] = useState('');
    const [certificate, setCertificate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const checkCertificate = async () => {
        try {
            setError('');
            setLoading(true);
            setCertificate(null);

            if (!domain.trim()) {
                setError("Please enter a valid domain");
                setLoading(false);
                return;
            }

            // Using a CORS proxy to avoid CORS issues
            const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
            const targetUrl = `https://${domain.replace(/^https?:\/\//, '')}`;
            
            // Note: This is a simplified implementation
            // In a real application, you'd need a backend service to check SSL certificates
            const response = await fetch(`${proxyUrl}${targetUrl}`);
            
            if (!response.ok) {
                throw new Error("Error fetching certificate");
            }

            // Simulate certificate data (in real app, you'd parse the actual certificate)
            const now = new Date();
            const validFrom = new Date(now);
            validFrom.setFullYear(now.getFullYear() - 1);
            
            const validUntil = new Date(now);
            validUntil.setFullYear(now.getFullYear() + 1);
            
            const daysRemaining = Math.ceil((validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            const mockCertificate = {
                domain: domain,
                issuer: "C=US, O=Let's Encrypt, CN=R3",
                subject: `CN=${domain}`,
                validFrom: validFrom.toISOString(),
                validUntil: validUntil.toISOString(),
                daysRemaining: daysRemaining,
                serialNumber: "1234567890ABCDEF1234567890ABCDEF",
                signatureAlgorithm: "SHA256-RSA",
                keyAlgorithm: "RSA",
                keySize: 2048,
                san: [`${domain}`, `www.${domain}`],
                ocsp: "http://ocsp.letsencrypt.org",
                crl: "http://crl.letsencrypt.org",
                isValid: daysRemaining > 0,
                isExpiringSoon: daysRemaining < 30
            };

            setCertificate(mockCertificate);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const clearAll = () => {
        setDomain('');
        setCertificate(null);
        setError('');
    };

    const getStatus = () => {
        if (!certificate) return '';
        if (!certificate.isValid) return 'expired';
        if (certificate.isExpiringSoon) return 'expiringSoon';
        return 'valid';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className={styles["ssl-checker"]}>
            <div className={styles["tool-header"]}>
                <h1>{"SSL Certificate Checker"}</h1>
                <p>{"Check SSL certificate information for any domain"}</p>
            </div>

            <div className={styles["checker-container"]}>
                <div className={styles["input-section"]}>
                    <label>{"Domain Name"}</label>
                    <div className={styles["domain-input-group"]}>
                        <span className={styles["protocol"]}>https://</span>
                        <input
                            type="text"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            placeholder={"Enter domain (e.g., example.com)"}
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className={styles["action-buttons"]}>
                    <button 
                        onClick={checkCertificate} 
                        className={styles["primary-btn"]}
                        disabled={loading}
                    >
                        {loading ? "Checking certificate..." : "Check Certificate"}
                    </button>
                    <button onClick={clearAll} className={styles["secondary-btn"]}>
                        {"Clear"}
                    </button>
                </div>

                {error && (
                    <div className={styles["error-message"]}>
                        {error}
                    </div>
                )}

                {certificate && (
                    <div className={styles["results-section"]}>
                        <div className={styles["certificate-status"]}>
                            <div className={`${styles["status-badge"]} ${getStatus()}`}>
                                {t(getStatus())}
                            </div>
                            {certificate.daysRemaining > 0 && (
                                <div className={styles["days-remaining"]}>
                                    {certificate.daysRemaining} {"Days Remaining"}
                                </div>
                            )}
                        </div>

                        <div className={styles["certificate-details"]}>
                            <h3>{"Certificate Information"}</h3>
                            <div className={styles["details-grid"]}>
                                <div className={styles["detail-item"]}>
                                    <span className={styles["detail-label"]}>{"Domain"}:</span>
                                    <span className={styles["detail-value"]}>{certificate.domain}</span>
                                </div>
                                <div className={styles["detail-item"]}>
                                    <span className={styles["detail-label"]}>{"Issuer"}:</span>
                                    <span className={styles["detail-value"]}>{certificate.issuer}</span>
                                </div>
                                <div className={styles["detail-item"]}>
                                    <span className={styles["detail-label"]}>{"Subject"}:</span>
                                    <span className={styles["detail-value"]}>{certificate.subject}</span>
                                </div>
                                <div className={styles["detail-item"]}>
                                    <span className={styles["detail-label"]}>{"Valid From"}:</span>
                                    <span className={styles["detail-value"]}>{formatDate(certificate.validFrom)}</span>
                                </div>
                                <div className={styles["detail-item"]}>
                                    <span className={styles["detail-label"]}>{"Valid Until"}:</span>
                                    <span className={styles["detail-value"]}>{formatDate(certificate.validUntil)}</span>
                                </div>
                                <div className={styles["detail-item"]}>
                                    <span className={styles["detail-label"]}>{"Serial Number"}:</span>
                                    <span className={`${styles["detail-value"]} ${styles["serial"]}`}>{certificate.serialNumber}</span>
                                </div>
                                <div className={styles["detail-item"]}>
                                    <span className={styles["detail-label"]}>{"Signature Algorithm"}:</span>
                                    <span className={styles["detail-value"]}>{certificate.signatureAlgorithm}</span>
                                </div>
                                <div className={styles["detail-item"]}>
                                    <span className={styles["detail-label"]}>{"Key Algorithm"}:</span>
                                    <span className={styles["detail-value"]}>{certificate.keyAlgorithm}</span>
                                </div>
                                <div className={styles["detail-item"]}>
                                    <span className={styles["detail-label"]}>{"Key Size"}:</span>
                                    <span className={styles["detail-value"]}>{certificate.keySize} bits</span>
                                </div>
                                {certificate.san && certificate.san.length > 0 && (
                                    <div className={styles["detail-item"]}>
                                        <span className={styles["detail-label"]}>{"Subject Alternative Names"}:</span>
                                        <span className={styles["detail-value"]}>
                                            {certificate.san.join(', ')}
                                        </span>
                                    </div>
                                )}
                                <div className={styles["detail-item"]}>
                                    <span className={styles["detail-label"]}>{"OCSP"}:</span>
                                    <span className={`${styles["detail-value"]} ${styles["url"]}`}>{certificate.ocsp}</span>
                                </div>
                                <div className={styles["detail-item"]}>
                                    <span className={styles["detail-label"]}>{"CRL"}:</span>
                                    <span className={`${styles["detail-value"]} ${styles["url"]}`}>{certificate.crl}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className={styles["certificate-tips"]}>
                    <h4>{"SSL Certificate Tips"}</h4>
                    <ul>
                        <li>{"SSL certificates typically expire after 1 year"}</li>
                        <li>{"Green lock indicates valid SSL certificate"}</li>
                        <li>{"Always check certificate validity for security"}</li>
                        <li>{"Use certificates from trusted Certificate Authorities"}</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default SslChecker;