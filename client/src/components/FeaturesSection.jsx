import React, { useState } from "react";

function FeatureCard({ feature, styles }) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = feature.icon;

  return (
    <div
      style={{
        ...styles.card,
        ...(isHovered ? styles.cardHover : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div>
        <div style={styles.iconContainer}>
          <Icon />
        </div>
        <h3 style={styles.cardTitle}>{feature.name}</h3>
        <p style={styles.cardDesc}>{feature.description}</p>
      </div>
    </div>
  );
}

export function FeaturesSection() {
  const features = [
    {
      name: "Code Analysis",
      description: "Analyze your project structure and dependencies in seconds",
      icon: () => (
        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4m-4-4l-4 4m4-4l4-4" />
        </svg>
      ),
    },
    {
      name: "AI Insights",
      description: "Get intelligent recommendations powered by advanced AI",
      icon: () => (
        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      name: "Real-time",
      description: "Get results instantly without waiting",
      icon: () => (
        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      name: "Secure",
      description: "Your code stays private and secure on our servers",
      icon: () => (
        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
    {
      name: "Export Results",
      description: "Download detailed analysis reports",
      icon: () => (
        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      ),
    },
    {
      name: "Multi-format",
      description: "Support for ZIP archives of any project type",
      icon: () => (
        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  const styles = {
    container: {
      padding: "48px 24px",
    },
    wrapper: {
      maxWidth: "1100px",
      margin: "0 auto",
    },
    header: {
      marginBottom: "48px",
    },
    title: {
      fontSize: "28px",
      fontWeight: "700",
      color: "#f4f4f5",
      margin: "0 0 12px 0",
    },
    subtitle: {
      fontSize: "14px",
      color: "#71838b",
      margin: 0,
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "16px",
    },
    card: {
      background: "rgba(14, 165, 165, 0.05)",
      border: "1px solid rgba(14, 165, 165, 0.15)",
      borderRadius: "12px",
      padding: "24px",
      overflow: "hidden",
      transition: "all 0.3s",
      cursor: "pointer",
      minHeight: "200px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    },
    cardHover: {
      borderColor: "rgba(14, 165, 165, 0.3)",
      background: "rgba(14, 165, 165, 0.08)",
    },
    iconContainer: {
      width: "28px",
      height: "28px",
      borderRadius: "8px",
      background: "rgba(14, 165, 165, 0.1)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#0ea5a5",
      marginBottom: "16px",
    },
    cardTitle: {
      fontSize: "14px",
      fontWeight: "600",
      color: "#e4e4e7",
      margin: "0 0 6px 0",
    },
    cardDesc: {
      fontSize: "12px",
      color: "#71838b",
      margin: 0,
      lineHeight: "1.5",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.header}>
          <h2 style={styles.title}>Powerful Features</h2>
          <p style={styles.subtitle}>Everything you need to understand your codebase</p>
        </div>
        <div style={styles.grid}>
          {features.map((feature, idx) => (
            <FeatureCard key={idx} feature={feature} styles={styles} />
          ))}
        </div>
      </div>
    </div>
  );
}
