import React, { useState } from 'react';
import axios from 'axios';
import API_URL from '../config';
import '../styles/WelcomeTutorial.css';

function WelcomeTutorial({ user, token, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: `Welcome to CentraC, ${user.name}! 🎉`,
      content: "We're excited to have you on board! Let's take a quick tour to help you get started with managing your accounting tasks efficiently.",
      image: '👋'
    },
    {
      title: 'Team Members 👥',
      content: 'View all team members here. Each member has a color-coded avatar with the CentraC logo. Assign team members to accounts to track who is working on what.',
      image: '👥'
    },
    {
      title: 'Categories & Accounts 📁',
      content: 'Manage Corporation Tax Returns and Self Assessments. Click the arrow to expand categories and view all accounts. Add new accounts with company names, due dates, and assigned team members.',
      image: '📁'
    },
    {
      title: 'Interactive Pie Charts 📊',
      content: 'Switch between categories using the buttons below the pie chart. Click the chart to see detailed statistics in a larger view. Colors represent: Green = Completed & Submitted, Blue = Completed Not Submitted, Orange = In Progress, Red = Not Started.',
      image: '📊'
    },
    {
      title: 'Smart Priority System 🚦',
      content: 'Accounts automatically flash with priority colors across the entire card:\n• Red Flash (Fast) - High Priority: Due within 2 months\n• Orange Flash (Medium) - Medium Priority: Due within 4 months\n• Green Flash (Slow) - Low Priority: Due after 4 months\n\nPriorities update automatically based on due dates!',
      image: '🚦'
    },
    {
      title: 'Full Inline Editing ✏️',
      content: 'Edit any account detail directly - no popups needed! Update company names, descriptions, assigned persons, due dates, priorities, and progress status. Filter accounts by priority or view only your assigned work.',
      image: '✏️'
    },
    {
      title: 'Calendar & Tasks 📅',
      content: 'Schedule important tasks and deadlines in the calendar. Keep track of all upcoming activities and never miss a due date.',
      image: '📅'
    },
    {
      title: 'Profile & Settings 👤',
      content: 'Click your profile picture (top right) to see your name, email, and logout option. All your preferences are automatically saved.',
      image: '👤'
    },
    {
      title: "You're All Set! ✨",
      content: 'That\'s everything you need to know! Remember: small delete buttons have double confirmations to prevent accidents. Start managing your accounts efficiently with CentraC!',
      image: '✨'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    try {
      await axios.post(API_URL + '/api/users/tutorial-seen', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onComplete();
    } catch (err) {
      console.error('Error marking tutorial as seen:', err);
      onComplete();
    }
  };

  const step = steps[currentStep];

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-modal">
        <div className="tutorial-progress">
          <div className="tutorial-progress-bar" style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} />
        </div>
        
        <div className="tutorial-content">
          <div className="tutorial-icon">{step.image}</div>
          <h2 className="tutorial-title">{step.title}</h2>
          <p className="tutorial-text">{step.content}</p>
        </div>

        <div className="tutorial-footer">
          <div className="tutorial-dots">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`tutorial-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
              />
            ))}
          </div>
          
          <div className="tutorial-actions">
            {currentStep < steps.length - 1 && (
              <button onClick={handleSkip} className="tutorial-btn tutorial-btn-skip">
                Skip Tutorial
              </button>
            )}
            <button onClick={handleNext} className="tutorial-btn tutorial-btn-next">
              {currentStep < steps.length - 1 ? 'Next' : 'Get Started'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomeTutorial;
