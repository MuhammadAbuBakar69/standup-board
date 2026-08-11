import React, { useState, useEffect } from 'react';
import './standup-board_App.css';

const STANDUP_COLUMNS = [
  { id: 'yesterday', title: 'What did I do yesterday?', color: '#3b82f6', badge: '⏪' },
  { id: 'today', title: 'What will I do today?', color: '#10b981', badge: '⏩' },
  { id: 'blockers', title: 'Blockers / Impediments', color: '#ef4444', badge: '🛑' },
];

const RETRO_COLUMNS = [
  { id: 'start', title: 'Start (New ideas to try)', color: '#8b5cf6', badge: '🚀' },
  { id: 'stop', title: 'Stop (Things not working)', color: '#f59e0b', badge: '⛔' },
  { id: 'continue', title: 'Continue (Keep doing)', color: '#06b6d4', badge: '✨' },
];

const TEAM_MEMBERS = ['Alex Morgan', 'Sarah Chen', 'David Kim', 'Emma Watson'];

const INITIAL_CARDS = [
  { id: 'c1', mode: 'standup', columnId: 'yesterday', text: 'Merged Auth JWT PR and deployed to Staging', author: 'Alex Morgan' },
  { id: 'c2', mode: 'standup', columnId: 'today', text: 'Fix responsive grid bugs on dashboard layout', author: 'Alex Morgan' },
  { id: 'c3', mode: 'standup', columnId: 'blockers', text: 'Waiting on Stripe API credentials from DevOps', author: 'Sarah Chen' },
  { id: 'c4', mode: 'retro', columnId: 'start', text: 'Adopt automated E2E Cypress regression suite', author: 'David Kim' },
  { id: 'c5', mode: 'retro', columnId: 'continue', text: 'Daily 15-minute async standup updates', author: 'Emma Watson' },
];

export default function App() {
  const [retroMode, setRetroMode] = useState(false);
  const [cards, setCards] = useState(() => {
    try {
      const saved = localStorage.getItem('standup_board_cards');
      return saved ? JSON.parse(saved) : INITIAL_CARDS;
    } catch (e) {
      return INITIAL_CARDS;
    }
  });

  const [activeAuthorFilter, setActiveAuthorFilter] = useState('All');
  
  // Card Creation Modal State
  const [modalColumnId, setModalColumnId] = useState(null);
  const [cardText, setCardText] = useState('');
  const [cardAuthor, setCardAuthor] = useState(TEAM_MEMBERS[0]);

  useEffect(() => {
    try {
      localStorage.setItem('standup_board_cards', JSON.stringify(cards));
    } catch (e) {
      console.error(e);
    }
  }, [cards]);

  const activeMode = retroMode ? 'retro' : 'standup';
  const columns = retroMode ? RETRO_COLUMNS : STANDUP_COLUMNS;

  const handleAddCard = (e) => {
    e.preventDefault();
    if (!cardText.trim() || !modalColumnId) return;

    const newCard = {
      id: Date.now().toString(),
      mode: activeMode,
      columnId: modalColumnId,
      text: cardText.trim(),
      author: cardAuthor,
    };

    setCards([...cards, newCard]);
    setCardText('');
    setModalColumnId(null);
  };

  const handleDeleteCard = (id) => {
    setCards(cards.filter(c => c.id !== id));
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="sb-app">
      {/* Top Navbar */}
      <header className="sb-header">
        <div className="sb-brand">
          <span className="sb-brand-icon">📋</span>
          <div>
            <h1>Agile Board & Retro</h1>
            <p>Team sync and retrospective collaboration</p>
          </div>
        </div>

        <div className="sb-controls">
          {/* Team Filter */}
          <div className="sb-filter-box">
            <label>Member:</label>
            <select
              value={activeAuthorFilter}
              onChange={(e) => setActiveAuthorFilter(e.target.value)}
              className="sb-select"
            >
              <option value="All">All Members</option>
              {TEAM_MEMBERS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Retro Switch Toggle */}
          <div className="sb-mode-toggle">
            <span className={!retroMode ? 'active' : ''}>Daily Standup</span>
            <label className="sb-switch">
              <input
                type="checkbox"
                checked={retroMode}
                onChange={(e) => setRetroMode(e.target.checked)}
              />
              <span className="sb-slider"></span>
            </label>
            <span className={retroMode ? 'active' : ''}>Retrospective</span>
          </div>
        </div>
      </header>

      {/* Columns Board */}
      <main className="sb-board">
        {columns.map(col => {
          const columnCards = cards.filter(c => {
            const matchesMode = c.mode === activeMode;
            const matchesCol = c.columnId === col.id;
            const matchesAuthor = activeAuthorFilter === 'All' || c.author === activeAuthorFilter;
            return matchesMode && matchesCol && matchesAuthor;
          });

          return (
            <div key={col.id} className="sb-column">
              <div className="sb-column-header" style={{ borderTopColor: col.color }}>
                <div className="sb-col-title-group">
                  <span className="sb-col-badge">{col.badge}</span>
                  <h3>{col.title}</h3>
                </div>
                <span className="sb-col-count">{columnCards.length}</span>
              </div>

              <div className="sb-cards-list">
                {columnCards.map(card => (
                  <div key={card.id} className="sb-card-item">
                    <p className="sb-card-text">{card.text}</p>
                    <div className="sb-card-footer">
                      <div className="sb-author-pill">
                        <span className="sb-author-avatar">{getInitials(card.author)}</span>
                        <span className="sb-author-name">{card.author}</span>
                      </div>
                      <button className="sb-btn-del" onClick={() => handleDeleteCard(card.id)}>🗑️</button>
                    </div>
                  </div>
                ))}

                <button
                  className="sb-btn-add-card"
                  onClick={() => setModalColumnId(col.id)}
                >
                  + Add Card
                </button>
              </div>
            </div>
          );
        })}
      </main>

      {/* Add Card Modal */}
      {modalColumnId && (
        <div className="sb-modal-overlay">
          <div className="sb-modal">
            <div className="sb-modal-header">
              <h3>Add Card to "{columns.find(c => c.id === modalColumnId)?.title}"</h3>
              <button className="sb-close-btn" onClick={() => setModalColumnId(null)}>✕</button>
            </div>
            <form onSubmit={handleAddCard} className="sb-form">
              <div className="sb-form-group">
                <label>Card Content *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your update or retro point..."
                  value={cardText}
                  onChange={(e) => setCardText(e.target.value)}
                  className="sb-textarea"
                />
              </div>

              <div className="sb-form-group">
                <label>Team Member *</label>
                <select
                  value={cardAuthor}
                  onChange={(e) => setCardAuthor(e.target.value)}
                  className="sb-select"
                >
                  {TEAM_MEMBERS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="sb-modal-actions">
                <button type="submit" className="sb-btn-submit">Add Card</button>
                <button type="button" className="sb-btn-cancel" onClick={() => setModalColumnId(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
