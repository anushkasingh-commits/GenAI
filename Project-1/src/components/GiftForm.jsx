import React, { useState } from 'react';
import { Sparkles, Gift, Heart, Calendar, Users, IndianRupee, Tag, Info, Wand2 } from 'lucide-react';

const OCCASIONS = [
  'Birthday 🎂',
  'Anniversary 💍',
  'Wedding 💒',
  'Graduation 🎓',
  "Valentine's Day 💖",
  'Friendship Day 🤝',
  'Farewell / Goodbye 🛫',
  'Festival / Holiday 🪔',
  'Housewarming 🏡',
  'Thank You 🙏',
  'Just Because / Surprise ✨',
];

const RELATIONSHIPS = [
  'Friend 🧑‍🤝‍🧑',
  'Partner / Spouse ❤️',
  'Parent 👨‍👩‍👦',
  'Sibling 👧👦',
  'Colleague / Boss 💼',
  'Teacher / Mentor 📚',
  'Child / Teen 🎈',
  'Other 🌟',
];

const BUDGET_PRESETS = [
  '₹500',
  '₹1,000',
  '₹2,000',
  '₹5,000',
  '₹10,000+',
  'Custom',
];

const QUICK_INTEREST_TAGS = [
  '🎧 Tech & Gadgets',
  '📚 Reading & Books',
  '☕ Coffee & Tea',
  '🧘 Fitness & Yoga',
  '🎨 Art & Craft',
  '🍳 Cooking & Baking',
  '🎮 Gaming',
  '🌿 Plants & Gardening',
  '✈️ Travel & Adventure',
  '💄 Skincare & Beauty',
  '🎵 Music & Vinyl',
  '👗 Fashion & Style',
];

const PERSONA_PRESETS = [
  {
    name: 'Techie Best Friend',
    gender: 'Male',
    age: '24',
    occasion: 'Birthday 🎂',
    relationship: 'Friend 🧑‍🤝‍🧑',
    budget: '₹2,000',
    interests: 'Tech, Gaming, Ergonomic desk setup',
    additionalInfo: 'Spends 10 hours at computer, loves minimalist dark tech gadgets.',
  },
  {
    name: "Mom's Birthday",
    gender: 'Female',
    age: '52',
    occasion: 'Birthday 🎂',
    relationship: 'Parent 👨‍👩‍👦',
    budget: '₹5,000',
    interests: 'Gardening, herbal tea, wellness, cooking',
    additionalInfo: 'Appreciates premium organic products and cozy home comforts.',
  },
  {
    name: 'Romantic Anniversary',
    gender: 'Female',
    age: '28',
    occasion: 'Anniversary 💍',
    relationship: 'Partner / Spouse ❤️',
    budget: '₹5,000',
    interests: 'Perfume, fine dining, photography, romantic keepsakes',
    additionalInfo: 'Celebrating our 3rd anniversary, looking for something thoughtful and heartfelt.',
  },
  {
    name: 'Colleague Farewell',
    gender: 'Any',
    age: '30',
    occasion: 'Farewell / Goodbye 🛫',
    relationship: 'Colleague / Boss 💼',
    budget: '₹1,000',
    interests: 'Coffee, stationery, desk decor',
    additionalInfo: 'Moving to a new city for a promotion, memorable team gift.',
  },
];

export default function GiftForm({ onSubmit, isLoading, initialValues }) {
  const [gender, setGender] = useState(initialValues?.gender || 'Any');
  const [age, setAge] = useState(initialValues?.age || '25');
  const [occasion, setOccasion] = useState(initialValues?.occasion || 'Birthday 🎂');
  const [relationship, setRelationship] = useState(initialValues?.relationship || 'Friend 🧑‍🤝‍🧑');
  const [budgetType, setBudgetType] = useState(initialValues?.budget || '₹2,000');
  const [customBudget, setCustomBudget] = useState('');
  const [interests, setInterests] = useState(initialValues?.interests || '');
  const [additionalInfo, setAdditionalInfo] = useState(initialValues?.additionalInfo || '');

  const applyPreset = (preset) => {
    setGender(preset.gender);
    setAge(preset.age);
    setOccasion(preset.occasion);
    setRelationship(preset.relationship);
    if (BUDGET_PRESETS.includes(preset.budget)) {
      setBudgetType(preset.budget);
    } else {
      setBudgetType('Custom');
      setCustomBudget(preset.budget);
    }
    setInterests(preset.interests);
    setAdditionalInfo(preset.additionalInfo);
  };

  const toggleInterestTag = (tag) => {
    const cleanTag = tag.replace(/^[^\w\s]+/, '').trim();
    const currentTags = interests ? interests.split(',').map((t) => t.trim()).filter(Boolean) : [];
    
    if (currentTags.includes(cleanTag)) {
      const newTags = currentTags.filter((t) => t !== cleanTag);
      setInterests(newTags.join(', '));
    } else {
      const newTags = [...currentTags, cleanTag];
      setInterests(newTags.join(', '));
    }
  };

  const isTagSelected = (tag) => {
    const cleanTag = tag.replace(/^[^\w\s]+/, '').trim();
    if (!interests) return false;
    return interests.toLowerCase().includes(cleanTag.toLowerCase());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalBudget = budgetType === 'Custom' ? (customBudget ? `₹${customBudget.replace(/[^\d]/g, '')}` : 'Flexible') : budgetType;

    onSubmit({
      gender,
      age: age || '25',
      occasion,
      relationship,
      budget: finalBudget,
      interests,
      additionalInfo,
    });
  };

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">
          <Sparkles size={16} />
          <span>Powered by Google Gemini AI</span>
        </div>
        <h2 className="hero-title">
          Find the Perfect Gift <span className="gradient-text">🎁</span>
        </h2>
        <p className="hero-subtitle">
          Tell us a little about them, and AI will find gift ideas they'll actually love.
        </p>

        {/* Quick Presets */}
        <div className="presets-container">
          <span className="presets-label">⚡ Quick Fill Presets:</span>
          <div className="presets-list">
            {PERSONA_PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                className="preset-chip"
                onClick={() => applyPreset(p)}
              >
                <span>✨</span>
                <span>{p.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Input Form */}
      <div className="form-card">
        <div className="form-header">
          <h2>
            <span>✨</span>
            <span>Recipient Profile & Preferences</span>
          </h2>
          <p>Customize your inputs below to get 6 hyper-personalized recommendations.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* Gender */}
            <div>
              <label className="form-label">
                <span>Gender</span>
              </label>
              <div className="segmented-control">
                {['Male', 'Female', 'Any'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    className={`segment-btn ${gender === g ? 'active' : ''}`}
                    onClick={() => setGender(g)}
                  >
                    {g === 'Male' && '👨 Male'}
                    {g === 'Female' && '👩 Female'}
                    {g === 'Any' && '🎁 Any'}
                  </button>
                ))}
              </div>
            </div>

            {/* Age */}
            <div>
              <label htmlFor="age-input" className="form-label">
                <span>Age (Years)</span>
              </label>
              <div className="input-wrapper">
                <input
                  id="age-input"
                  type="number"
                  min="1"
                  max="120"
                  className="form-input"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 26"
                  required
                />
              </div>
            </div>

            {/* Occasion / Event */}
            <div>
              <label htmlFor="occasion-select" className="form-label">
                <span>Occasion / Event</span>
              </label>
              <div className="input-wrapper">
                <select
                  id="occasion-select"
                  className="form-select"
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  required
                >
                  {OCCASIONS.map((occ) => (
                    <option key={occ} value={occ}>
                      {occ}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Relationship */}
            <div>
              <label htmlFor="relationship-select" className="form-label">
                <span>Relationship</span>
              </label>
              <div className="input-wrapper">
                <select
                  id="relationship-select"
                  className="form-select"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  required
                >
                  {RELATIONSHIPS.map((rel) => (
                    <option key={rel} value={rel}>
                      {rel}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Budget */}
            <div className="form-group-full">
              <label className="form-label">
                <span>Budget (INR)</span>
              </label>
              <div className="budget-pills-container">
                <div className="budget-pills">
                  {BUDGET_PRESETS.map((b) => (
                    <button
                      key={b}
                      type="button"
                      className={`budget-pill ${budgetType === b ? 'active' : ''}`}
                      onClick={() => setBudgetType(b)}
                    >
                      {b}
                    </button>
                  ))}
                </div>
                {budgetType === 'Custom' && (
                  <div className="budget-custom-input animate-fade-in">
                    <div className="input-wrapper" style={{ flex: 1 }}>
                      <span className="input-icon">₹</span>
                      <input
                        type="text"
                        className="form-input input-with-icon"
                        placeholder="Enter custom amount in INR (e.g. 3500)"
                        value={customBudget}
                        onChange={(e) => setCustomBudget(e.target.value)}
                        autoFocus
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Interests / Hobbies */}
            <div className="form-group-full">
              <label htmlFor="interests-input" className="form-label">
                <span>Interests & Hobbies</span>
                <span className="optional">(Select tags or type custom)</span>
              </label>
              <div className="interest-tags-container">
                <div className="quick-interest-chips">
                  {QUICK_INTEREST_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className={`interest-chip ${isTagSelected(tag) ? 'selected' : ''}`}
                      onClick={() => toggleInterestTag(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <input
                  id="interests-input"
                  type="text"
                  className="form-input"
                  placeholder="e.g. specialty coffee, minimalist tech gadgets, fantasy novels..."
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="form-group-full">
              <label htmlFor="additional-info" className="form-label">
                <span>Additional Information</span>
                <span className="optional">(Personality, preferences, specific dislikes, vibe)</span>
              </label>
              <textarea
                id="additional-info"
                className="form-textarea"
                placeholder="e.g. They work remotely, love pastel aesthetics, dislike clutter, and prefer experiences or practical daily items over trinkets."
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Submit CTA */}
          <div className="form-submit-section">
            <button
              type="submit"
              className="btn-primary-glow"
              disabled={isLoading}
            >
              <Wand2 size={20} />
              <span>Find Gift Ideas 🎁</span>
            </button>
            <p className="submit-note">
              <span>✨ Gemini AI curates 6 tailored gifts matching your budget</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
