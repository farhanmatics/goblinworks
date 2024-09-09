import React from 'react';
import { Link } from 'react-router-dom';

const WelcomePage: React.FC = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Welcome to AR Testing</h1>
      <div style={styles.linkContainer}>
        <Link to="/body-detection" style={styles.link}>Body Detection</Link>
        <Link to="/pose-detection" style={styles.link}>Pose Detection</Link>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: 'white',
    color: 'black',
  },
  title: {
    fontSize: 'calc(24px + 2vmin)',
    marginBottom: '5vh',
  },
  linkContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  },
  link: {
    padding: '10px 20px',
    border: '2px solid black',
    borderRadius: '5px',
    textDecoration: 'none',
    color: 'black',
    fontSize: 'calc(14px + 1vmin)',
    transition: 'background-color 0.3s, color 0.3s',
    ':hover': {
      backgroundColor: 'black',
      color: 'white',
    },
  },
};

export default WelcomePage;
