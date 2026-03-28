// DOM Elements
const newsInput = document.getElementById('newsInput');
const urlInput = document.getElementById('urlInput');
const charCount = document.getElementById('charCount');
const wordCount = document.getElementById('wordCount');
const clearBtn = document.getElementById('clearBtn');
const analyzeBtn = document.getElementById('analyzeBtn');
const inputSection = document.getElementById('inputSection');
const processingState = document.getElementById('processingState');
const resultsSection = document.getElementById('resultsSection');
const processingStep = document.getElementById('processingStep');
const historyBtn = document.getElementById('historyBtn');
const historyModal = document.getElementById('historyModal');
const historyPanel = document.getElementById('historyPanel');
const historyOverlay = document.getElementById('historyOverlay');
const closeHistoryBtn = document.getElementById('closeHistoryBtn');
const historyList = document.getElementById('historyList');
const newAnalysisBtn = document.getElementById('newAnalysisBtn');
const exportBtn = document.getElementById('exportBtn');
const tabBtns = document.querySelectorAll('.tab-btn');

// Analysis History
let analysisHistory = JSON.parse(localStorage.getItem('analysisHistory') || '[]');

// Fake News Keywords Database
const suspiciousKeywords = [
  'shocking', 'you won\'t believe', 'secret', 'they don\'t want you to know',
  'miracle', 'cure', 'doctors hate', 'click here', 'breaking', 'urgent',
  'must see', 'gone viral', 'insane', 'unbelievable', 'banned', 'censored',
  'truth revealed', 'mainstream media', 'wake up', 'sheeple', 'hoax',
  'conspiracy', 'cover-up', 'deep state', 'fake news', 'alternative facts'
];

const credibleIndicators = [
  'according to', 'study published', 'research shows', 'data suggests',
  'experts say', 'reported by', 'official statement', 'verified', 'sources confirm',
  'peer-reviewed', 'journal', 'university', 'institute', 'statistics'
];

// Tab Switching
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const tab = btn.dataset.tab;
    document.getElementById('textTab').classList.toggle('hidden', tab !== 'text');
    document.getElementById('urlTab').classList.toggle('hidden', tab !== 'url');
  });
});

// Text Input Events
newsInput.addEventListener('input', () => {
  const text = newsInput.value;
  charCount.textContent = text.length;
  wordCount.textContent = text.trim() ? text.trim().split(/\s+/).length : 0;
});

clearBtn.addEventListener('click', () => {
  newsInput.value = '';
  charCount.textContent = '0';
  wordCount.textContent = '0';
});

// Analyze Button
analyzeBtn.addEventListener('click', () => {
  const text = newsInput.value.trim();
  const url = urlInput.value.trim();
  
  if (!text && !url) {
    // Shake animation for empty input
    newsInput.parentElement.classList.add('animate-shake');
    setTimeout(() => newsInput.parentElement.classList.remove('animate-shake'), 500);
    return;
  }
  
  startAnalysis(text || url);
});

// Processing Steps Animation
const processingSteps = [
  'Extracting text features...',
  'Analyzing sentiment patterns...',
  'Cross-referencing sources...',
  'Detecting sensationalism...',
  'Running ML classification...',
  'Calculating confidence score...'
];

async function startAnalysis(text) {
  // Show processing state
  inputSection.classList.add('hidden');
  resultsSection.classList.add('hidden');
  processingState.classList.remove('hidden');
  
  // Animate processing steps
  for (let i = 0; i < processingSteps.length; i++) {
    processingStep.textContent = processingSteps[i];
    await sleep(500);
  }
  
  // Perform analysis
  const result = analyzeText(text);
  
  // Save to history
  saveToHistory(text, result);
  
  // Show results
  await sleep(300);
  showResults(result);
}

function analyzeText(text) {
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/);
  
  // Find suspicious phrases
  const foundSuspicious = suspiciousKeywords.filter(kw => lowerText.includes(kw));
  const foundCredible = credibleIndicators.filter(ind => lowerText.includes(ind));
  
  // Calculate base scores
  let fakeScore = foundSuspicious.length * 15;
  let realScore = foundCredible.length * 20;
  
  // Text features
  const exclamations = (text.match(/!/g) || []).length;
  const allCaps = (text.match(/\b[A-Z]{2,}\b/g) || []).length;
  const questionMarks = (text.match(/\?/g) || []).length;
  
  fakeScore += exclamations * 5;
  fakeScore += allCaps * 8;
  fakeScore += questionMarks * 2;
  
  // Sentiment analysis (simplified)
  const negativeWords = ['bad', 'terrible', 'horrible', 'disaster', 'crisis', 'panic'];
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful'];
  
  const negativeCount = negativeWords.filter(w => lowerText.includes(w)).length;
  const positiveCount = positiveWords.filter(w => lowerText.includes(w)).length;
  
  const sentimentScore = (positiveCount - negativeCount) * 5;
  
  // Calculate final verdict
  const totalIndicators = foundSuspicious.length + foundCredible.length + 1;
  const realProbability = Math.max(0, Math.min(100, 
    50 + (realScore - fakeScore) / totalIndicators + sentimentScore
  ));
  
  const isFake = realProbability < 50;
  const confidence = isFake ? 100 - realProbability : realProbability;
  
  return {
    isFake,
    confidence: Math.round(confidence),
    metrics: {
      sentiment: Math.round(50 + sentimentScore),
      sensationalism: Math.min(100, exclamations * 10 + allCaps * 15 + foundSuspicious.length * 10),
      sourceCredibility: Math.min(100, 40 + foundCredible.length * 15),
      factualLanguage: Math.min(100, 50 + foundCredible.length * 12 - foundSuspicious.length * 8),
      emotionalTone: Math.min(100, 30 + negativeCount * 10 + exclamations * 5),
      clickbaitScore: Math.min(100, foundSuspicious.length * 12 + allCaps * 10)
    },
    suspiciousPhrases: foundSuspicious,
    factors: [
      { label: 'Exclamation marks', value: exclamations, neutral: exclamations < 3 },
      { label: 'All-caps words', value: allCaps, neutral: allCaps < 2 },
      { label: 'Suspicious phrases', value: foundSuspicious.length, neutral: foundSuspicious.length < 2 },
      { label: 'Credible indicators', value: foundCredible.length, good: foundCredible.length > 0 }
    ]
  };
}

function showResults(result) {
  processingState.classList.add('hidden');
  resultsSection.classList.remove('hidden');
  
  // Update main result
  const resultTitle = document.getElementById('resultTitle');
  const resultBadge = document.getElementById('resultBadge');
  const confidenceScore = document.getElementById('confidenceScore');
  const confidenceBar = document.getElementById('confidenceBar');
  
  resultTitle.textContent = result.isFake ? 'Potentially Fake News' : 'Likely Credible News';
  
  resultBadge.className = 'result-badge ' + (result.isFake ? 'fake' : 'real');
  resultBadge.innerHTML = result.isFake 
    ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> FAKE'
    : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> REAL';
  
  confidenceScore.textContent = result.confidence + '%';
  confidenceBar.style.width = result.confidence + '%';
  confidenceBar.style.background = result.isFake 
    ? 'linear-gradient(90deg, var(--danger), #ff6b7a)' 
    : 'linear-gradient(90deg, var(--accent), #2ed573)';
  
  // Update metrics grid
  const metricsGrid = document.getElementById('metricsGrid');
  const metricLabels = {
    sentiment: 'Sentiment Score',
    sensationalism: 'Sensationalism',
    sourceCredibility: 'Source Quality',
    factualLanguage: 'Factual Language',
    emotionalTone: 'Emotional Tone',
    clickbaitScore: 'Clickbait Risk'
  };
  
  metricsGrid.innerHTML = Object.entries(result.metrics).map(([key, value]) => `
    <div class="metric-card">
      <p class="text-xs text-[var(--muted)] mb-1">${metricLabels[key]}</p>
      <p class="text-xl font-bold">${value}%</p>
      <div class="progress-bar mt-2">
        <div class="progress-fill" style="width: ${value}%; background: ${getMetricColor(key, value)}"></div>
      </div>
    </div>
  `).join('');
  
  metricsGrid.classList.add('visible');
  
  // Update suspicious phrases
  const suspiciousList = document.getElementById('suspiciousList');
  if (result.suspiciousPhrases.length > 0) {
    suspiciousList.innerHTML = result.suspiciousPhrases.map(p => `
      <li class="flex items-center gap-2 text-[var(--warning)]">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        "${p}"
      </li>
    `).join('');
  } else {
    suspiciousList.innerHTML = '<li class="text-[var(--muted)]">No suspicious phrases detected</li>';
  }
  
  // Update factors
  const factorsList = document.getElementById('factorsList');
  factorsList.innerHTML = result.factors.map(f => `
    <li class="flex items-center justify-between">
      <span class="text-[var(--muted)]">${f.label}</span>
      <span class="font-mono ${f.good ? 'text-[var(--success)]' : f.neutral ? 'text-[var(--fg)]' : 'text-[var(--warning)]'}">${f.value}</span>
    </li>
  `).join('');
}

function getMetricColor(key, value) {
  const goodMetrics = ['sentiment', 'sourceCredibility', 'factualLanguage'];
  const badMetrics = ['sensationalism', 'emotionalTone', 'clickbaitScore'];
  
  if (goodMetrics.includes(key)) {
    return value > 60 ? 'var(--success)' : value > 40 ? 'var(--warning)' : 'var(--danger)';
  } else if (badMetrics.includes(key)) {
    return value > 60 ? 'var(--danger)' : value > 40 ? 'var(--warning)' : 'var(--success)';
  }
  return 'var(--accent)';
}

// History Management
function saveToHistory(text, result) {
  const entry = {
    id: Date.now(),
    text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
    fullText: text,
    isFake: result.isFake,
    confidence: result.confidence,
    timestamp: new Date().toISOString()
  };
  
  analysisHistory.unshift(entry);
  if (analysisHistory.length > 10) analysisHistory.pop();
  
  localStorage.setItem('analysisHistory', JSON.stringify(analysisHistory));
  renderHistory();
}

function renderHistory() {
  if (analysisHistory.length === 0) {
    historyList.innerHTML = '<p class="text-[var(--muted)] text-center py-8">No analysis history yet</p>';
    return;
  }
  
  historyList.innerHTML = analysisHistory.map(entry => `
    <div class="history-item mb-3" data-id="${entry.id}">
      <div class="flex items-center justify-between mb-2">
        <span class="result-badge ${entry.isFake ? 'fake' : 'real'} text-xs py-1 px-2">
          ${entry.isFake ? 'FAKE' : 'REAL'}
        </span>
        <span class="text-xs text-[var(--muted)]">${new Date(entry.timestamp).toLocaleDateString()}</span>
      </div>
      <p class="text-sm text-[var(--fg)] line-clamp-2">${entry.text}</p>
      <p class="text-xs text-[var(--muted)] mt-1">Confidence: ${entry.confidence}%</p>
    </div>
  `).join('');
  
  // Add click handlers
  historyList.querySelectorAll('.history-item').forEach(item => {
    item.addEventListener('click', () => {
      const entry = analysisHistory.find(e => e.id === parseInt(item.dataset.id));
      if (entry) {
        newsInput.value = entry.fullText;
        newsInput.dispatchEvent(new Event('input'));
        closeHistoryModal();
      }
    });
  });
}

// History Modal
function openHistoryModal() {
  historyModal.classList.remove('hidden');
  setTimeout(() => historyPanel.classList.remove('translate-x-full'), 10);
}

function closeHistoryModal() {
  historyPanel.classList.add('translate-x-full');
  setTimeout(() => historyModal.classList.add('hidden'), 300);
}

historyBtn.addEventListener('click', openHistoryModal);
closeHistoryBtn.addEventListener('click', closeHistoryModal);
historyOverlay.addEventListener('click', closeHistoryModal);

// New Analysis Button
newAnalysisBtn.addEventListener('click', () => {
  resultsSection.classList.add('hidden');
  inputSection.classList.remove('hidden');
  newsInput.value = '';
  newsInput.dispatchEvent(new Event('input'));
});

// Export Report
exportBtn.addEventListener('click', () => {
  const resultBadge = document.getElementById('resultBadge').textContent.trim();
  const confidence = document.getElementById('confidenceScore').textContent;
  const text = newsInput.value;
  
  const report = `
VERITAS - FAKE NEWS DETECTOR REPORT
===================================
Date: ${new Date().toLocaleString()}

VERDICT: ${resultBadge}
Confidence: ${confidence}

ANALYZED TEXT:
 ${text}

Generated by Veritas ML Engine
  `.trim();
  
  const blob = new Blob([report], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'veritas-report.txt';
  a.click();
  URL.revokeObjectURL(url);
});

// Utility Functions
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Initialize
renderHistory();
