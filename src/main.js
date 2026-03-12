// ==================== DATA STRUCTURE ====================
let appData = {
  profile: {
    name: 'Данил Пряхин',
    about: 'Типа программист',
    birthday: '1933-03-30',
    avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Ivan',
    goals: {
      water: 2,
      sport: 30,
      reading: 20
    }
  },
  notes: [],
  habits: {
    water: { current: 0.5, goal: 2, unit: 'л', history: [] },
    sport: { current: 10, goal: 30, unit: 'мин', history: [] },
    reading: { current: 1, goal: 20, unit: 'мин', history: [] }
  },
  customHabits: {},
  stats: {
    streak: 0,
    lastActiveDate: null,
    totalActions: 0
  },
  achievements: [],
  theme: 'light',
  currentListType: 'bullet'
};

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  initializeApp();
  setupEventListeners();
});

function initializeApp() {
  // Set current date
  updateCurrentDate();
  
  // Load profile
  loadProfile();
  
  // Render notes
  renderNotes();
  
  // Update habits display
  updateAllHabits();
  
  // Update statistics
  updateStats();
  
  // Render achievements
  renderAchievements();
  
  // Generate days row
  generateDaysRow();
  
  // Apply theme
  if (appData.theme === 'dark') {
    document.body.classList.add('dark-mode');
  }
  
  // Calculate age
  calculateAge();
  
  showToast('Приложение загружено!');
}

function setupEventListeners() {
  // Auto-save on input changes
  document.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('change', saveData);
  });
}

// ==================== THEME ====================
function toggleTheme() {
  appData.theme = appData.theme === 'light' ? 'dark' : 'light';
  document.body.classList.toggle('dark-mode');
  saveData();
  showToast(`Тема: ${appData.theme === 'dark' ? 'Тёмная' : 'Светлая'}`);
}

// ==================== NAVIGATION ====================
function switchTab(tabName, btnElement) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Show selected tab
  document.getElementById(tabName + '-tab').classList.add('active');
  
  // Update navigation buttons
  if (btnElement) {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    btnElement.classList.add('active');
  }
  
  // Refresh data when switching tabs
  if (tabName === 'stats') {
    updateStats();
    renderWeeklyChart();
  }
  
  if (tabName === 'habits') {
    updateAllHabits();
  }
}

// ==================== PROFILE ====================
function loadProfile() {
  document.getElementById('display-name').textContent = appData.profile.name;
  document.getElementById('profile-avatar').src = appData.profile.avatar;
  document.getElementById('input-name').value = appData.profile.name;
  document.getElementById('input-about').value = appData.profile.about;
  document.getElementById('input-birthday').value = appData.profile.birthday;
  
  // Load goals
  document.getElementById('goal-water').value = appData.profile.goals.water;
  document.getElementById('goal-sport').value = appData.profile.goals.sport;
  document.getElementById('goal-reading').value = appData.profile.goals.reading;
  
  calculateAge();
}

function updateProfile() {
  appData.profile.name = document.getElementById('input-name').value;
  appData.profile.about = document.getElementById('input-about').value;
  appData.profile.birthday = document.getElementById('input-birthday').value;
  
  // Update goals
  appData.profile.goals.water = parseFloat(document.getElementById('goal-water').value) || 2;
  appData.profile.goals.sport = parseFloat(document.getElementById('goal-sport').value) || 30;
  appData.profile.goals.reading = parseFloat(document.getElementById('goal-reading').value) || 20;
  
  document.getElementById('display-name').textContent = appData.profile.name;
  calculateAge();
  saveData();
}

function calculateAge() {
  if (!appData.profile.birthday) return;
  
  const birthDate = new Date(appData.profile.birthday);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  const ageElement = document.getElementById('user-age');
  if (ageElement) {
    ageElement.textContent = age > 0 ? `${age} лет` : '';
  }
}

function changeAvatar() {
  const seeds = ['Ivan', 'Dev', 'Code', 'Web', 'App', 'Tech', 'User', 'Pro'];
  const randomSeed = seeds[Math.floor(Math.random() * seeds.length)];
  appData.profile.avatar = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${randomSeed}${Date.now()}`;
  document.getElementById('profile-avatar').src = appData.profile.avatar;
  saveData();
  showToast('Аватар изменён!');
}

// ==================== NOTES ====================
function setListType(type) {
  appData.currentListType = type;
  showToast(type === 'bullet' ? 'Маркированный список' : 'Нумерованный список');
}

function addNote() {
  const title = document.getElementById('note-title').value.trim();
  const text = document.getElementById('note-text').value.trim();
  const category = document.getElementById('note-category').value;
  const priority = document.getElementById('note-priority').value;
  
  if (!title || !text) {
    showToast('⚠️ Введите заголовок и текст!', 'error');
    return;
  }
  
  const content = text.split('\n').filter(line => line.trim());
  
  const newNote = {
    id: Date.now(),
    title: title,
    content: content,
    listType: appData.currentListType,
    category: category,
    priority: priority,
    date: new Date().toLocaleDateString('ru-RU'),
    timestamp: new Date()
  };
  
  appData.notes.unshift(newNote);
  renderNotes();
  
  // Clear inputs
  document.getElementById('note-title').value = '';
  document.getElementById('note-text').value = '';
  
  saveData();
  updateStats();
  showToast('✅ Заметка добавлена!');
}

function renderNotes(filter = '', sortBy = 'newest') {
  const notesList = document.getElementById('notes-list');
  if (!notesList) return;
  
  notesList.innerHTML = '';
  
  let filteredNotes = appData.notes;
  
  // Search filter
  if (filter) {
    filteredNotes = filteredNotes.filter(note => 
      note.title.toLowerCase().includes(filter.toLowerCase()) ||
      note.content.some(line => line.toLowerCase().includes(filter.toLowerCase()))
    );
  }
  
  // Sort
  if (sortBy === 'newest') {
    filteredNotes.sort((a, b) => b.timestamp - a.timestamp);
  } else if (sortBy === 'oldest') {
    filteredNotes.sort((a, b) => a.timestamp - b.timestamp);
  } else if (sortBy === 'alpha') {
    filteredNotes.sort((a, b) => a.title.localeCompare(b.title));
  }
  
  if (filteredNotes.length === 0) {
    notesList.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:20px;">📝 Нет заметок</p>';
    return;
  }
  
  const categoryEmojis = {
    personal: '📝',
    work: '💼',
    ideas: '💡',
    shopping: '🛒'
  };
  
  filteredNotes.forEach(note => {
    const noteCard = document.createElement('div');
    noteCard.className = `note-card ${note.priority === 'important' ? 'priority-important' : ''}`;
    
    const listHtml = note.listType === 'number' 
      ? `<ol>${note.content.map(item => `<li>${item}</li>`).join('')}</ol>`
      : `<ul>${note.content.map(item => `<li>${item}</li>`).join('')}</ul>`;
    
    noteCard.innerHTML = `
      <h3>
        <span>${note.title}</span>
        <div class="note-actions">
          <button onclick="editNote(${note.id})" title="Редактировать">✏️</button>
          <button onclick="deleteNote(${note.id})" title="Удалить">🗑️</button>
          <button onclick="exportNote(${note.id})" title="Экспорт">📤</button>
        </div>
      </h3>
      <span class="note-category">${categoryEmojis[note.category] || '📝'} ${note.category}</span>
      ${listHtml}
      <div class="note-meta">
        <span>${note.date}</span>
        ${note.priority === 'important' ? '<span style="color:var(--danger-color)">🔴 Важная</span>' : '<span>⚪ Обычная</span>'}
      </div>
    `;
    
    notesList.appendChild(noteCard);
  });
}

function searchNotes() {
  const searchTerm = document.getElementById('search-notes').value;
  const sortBy = document.getElementById('sort-notes').value;
  renderNotes(searchTerm, sortBy);
}

function sortNotes() {
  const searchTerm = document.getElementById('search-notes').value;
  const sortBy = document.getElementById('sort-notes').value;
  renderNotes(searchTerm, sortBy);
}

function editNote(id) {
  const note = appData.notes.find(n => n.id === id);
  if (note) {
    document.getElementById('note-title').value = note.title;
    document.getElementById('note-text').value = note.content.join('\n');
    document.getElementById('note-category').value = note.category;
    document.getElementById('note-priority').value = note.priority;
    appData.currentListType = note.listType;
    
    deleteNote(id, false);
    showToast('Редактирование...');
  }
}

function deleteNote(id, showMsg = true) {
  appData.notes = appData.notes.filter(n => n.id !== id);
  renderNotes();
  saveData();
  updateStats();
  if (showMsg) showToast('Заметка удалена');
}

function exportNote(id) {
  const note = appData.notes.find(n => n.id === id);
  if (!note) return;
  
  let content = `${note.title}\n`;
  content += `Дата: ${note.date}\n`;
  content += `Категория: ${note.category}\n`;
  content += `Приоритет: ${note.priority}\n\n`;
  content += note.content.join('\n');
  
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${note.title.replace(/[^a-z0-9а-яё]/gi, '_')}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  
  showToast('📤 Заметка экспортирована!');
}

// ==================== HABITS ====================
function updateAllHabits() {
  updateHabitDisplay('water');
  updateHabitDisplay('sport');
  updateHabitDisplay('reading');
  
  // Update custom habits
  Object.keys(appData.customHabits).forEach(habitKey => {
    updateCustomHabitDisplay(habitKey);
  });
}

function updateHabitDisplay(habitType) {
  const habit = appData.habits[habitType];
  const goal = appData.profile.goals[habitType];
  
  document.getElementById(`${habitType}-current`).textContent = `${habit.current} ${habit.unit}`;
  document.getElementById(`${habitType}-progress`).style.width = `${Math.min((habit.current / goal) * 100, 100)}%`;
  
  // Update total in stats
  const totalElement = document.getElementById(`${habitType}-total`);
  if (totalElement) {
    totalElement.textContent = `${habit.current} ${habit.unit}`;
  }
}

function addHabitValue(habitType) {
  const input = document.getElementById(`${habitType}-input`);
  const value = parseFloat(input.value);
  
  if (isNaN(value) || value <= 0) {
    showToast('⚠️ Введите корректное значение!', 'error');
    return;
  }
  
  appData.habits[habitType].current += value;
  appData.stats.totalActions++;
  
  updateHabitDisplay(habitType);
  checkAchievements();
  saveData();
  
  input.value = '';
  showToast(`➕ Добавлено ${value} ${appData.habits[habitType].unit}!`);
}

function resetHabit(habitType) {
  if (confirm(`Сбросить прогресс "${habitType}"?`)) {
    appData.habits[habitType].current = 0;
    updateHabitDisplay(habitType);
    saveData();
    showToast('Прогресс сброшен');
  }
}

function addCustomHabit() {
  const name = document.getElementById('custom-habit-name').value.trim();
  const icon = document.getElementById('custom-habit-icon').value.trim() || '🎯';
  const unit = document.getElementById('custom-habit-unit').value.trim() || 'ед.';
  const goal = parseFloat(document.getElementById('custom-habit-goal').value) || 10;
  
  if (!name) {
    showToast('⚠️ Введите название привычки!', 'error');
    return;
  }
  
  const habitKey = `custom_${Date.now()}`;
  
  appData.customHabits[habitKey] = {
    name: name,
    icon: icon,
    current: 0,
    goal: goal,
    unit: unit,
    history: []
  };
  
  // Add to habits container
  renderCustomHabit(habitKey);
  
  // Clear inputs
  document.getElementById('custom-habit-name').value = '';
  document.getElementById('custom-habit-icon').value = '';
  document.getElementById('custom-habit-unit').value = '';
  document.getElementById('custom-habit-goal').value = '';
  
  saveData();
  showToast('✅ Привычка добавлена!');
}

function renderCustomHabit(habitKey) {
  const habit = appData.customHabits[habitKey];
  const container = document.getElementById('habits-container');
  
  const habitCard = document.createElement('div');
  habitCard.className = 'habit-card';
  habitCard.dataset.habit = habitKey;
  habitCard.id = `habit-${habitKey}`;
  
  habitCard.innerHTML = `
    <div class="habit-header">
      <div class="habit-info">
        <span class="habit-icon">${habit.icon}</span>
        <span class="habit-name">${habit.name}</span>
      </div>
      <div class="habit-stats">
        <span class="habit-current" id="${habitKey}-current">0 ${habit.unit}</span>
        <span class="habit-goal">/ ${habit.goal} ${habit.unit}</span>
      </div>
    </div>
    <div class="progress-bar">
      <div class="progress-fill" id="${habitKey}-progress" style="width: 0%"></div>
    </div>
    <div class="habit-input-row">
      <input type="number" id="${habitKey}-input" placeholder="Значение" class="habit-input">
      <span class="unit">${habit.unit}</span>
      <button class="btn-add" onclick="addCustomHabitValue('${habitKey}')">+</button>
      <button class="btn-reset" onclick="deleteCustomHabit('${habitKey}')">🗑️</button>
    </div>
  `;
  
  container.appendChild(habitCard);
}

function addCustomHabitValue(habitKey) {
  const input = document.getElementById(`${habitKey}-input`);
  const value = parseFloat(input.value);
  
  if (isNaN(value) || value <= 0) {
    showToast('⚠️ Введите корректное значение!', 'error');
    return;
  }
  
  appData.customHabits[habitKey].current += value;
  appData.stats.totalActions++;
  
  updateCustomHabitDisplay(habitKey);
  saveData();
  
  input.value = '';
  showToast('➕ Добавлено!');
}

function updateCustomHabitDisplay(habitKey) {
  const habit = appData.customHabits[habitKey];
  const percentage = Math.min((habit.current / habit.goal) * 100, 100);
  
  document.getElementById(`${habitKey}-current`).textContent = `${habit.current} ${habit.unit}`;
  document.getElementById(`${habitKey}-progress`).style.width = `${percentage}%`;
}

function deleteCustomHabit(habitKey) {
  if (confirm('Удалить эту привычку?')) {
    delete appData.customHabits[habitKey];
    const element = document.getElementById(`habit-${habitKey}`);
    if (element) element.remove();
    saveData();
    showToast('Привычка удалена');
  }
}

function saveDayProgress() {
  const today = new Date().toLocaleDateString('ru-RU');
  
  // Save to history
  Object.keys(appData.habits).forEach(key => {
    appData.habits[key].history.push({
      date: today,
      value: appData.habits[key].current
    });
  });
  
  // Update streak
  updateStreak();
  
  saveData();
  showToast('✅ Прогресс дня сохранён!');
}

function updateStreak() {
  const today = new Date().toDateString();
  const lastActive = appData.stats.lastActiveDate;
  
  if (lastActive !== today) {
    appData.stats.streak++;
    appData.stats.lastActiveDate = today;
  }
  
  document.getElementById('current-streak').textContent = appData.stats.streak;
}

// ==================== STATISTICS ====================
function updateStats() {
  // Update stat cards
  document.getElementById('stat-streak').textContent = appData.stats.streak;
  document.getElementById('stat-notes').textContent = appData.notes.length;
  document.getElementById('stat-water').textContent = `${appData.habits.water.current} л`;
  document.getElementById('stat-sport').textContent = `${appData.habits.sport.current} мин`;
  document.getElementById('stat-reading').textContent = `${appData.habits.reading.current} мин`;
  document.getElementById('stat-achievements').textContent = appData.achievements.length;
  
  // Update current streak display
  const streakElement = document.getElementById('current-streak');
  if (streakElement) {
    streakElement.textContent = appData.stats.streak;
  }
}

function setPeriod(period) {
  document.querySelectorAll('.period-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  renderWeeklyChart(period);
}

function renderWeeklyChart(period = 'week') {
  const chartContainer = document.getElementById('weekly-chart');
  if (!chartContainer) return;
  
  chartContainer.innerHTML = '';
  
  const days = period === 'week' ? 
    ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] :
    ['1', '2', '3', '4', 'Неделя'];
  
  const values = period === 'week' ?
    [0.5, 1.0, 0.8, 1.5, 1.2, 0.5, appData.habits.water.current] :
    [2, 3, 2.5, 4, appData.habits.water.current];
  
  const maxValue = Math.max(...values, 2);
  
  values.forEach((value, index) => {
    const bar = document.createElement('div');
    bar.className = 'chart-bar';
    const height = (value / maxValue) * 100;
    bar.style.height = `${Math.max(height, 10)}%`;
    
    const label = document.createElement('span');
    label.className = 'chart-bar-label';
    label.textContent = days[index];
    
    const valueLabel = document.createElement('span');
    valueLabel.className = 'chart-bar-value';
    valueLabel.textContent = value;
    
    bar.appendChild(label);
    bar.appendChild(valueLabel);
    chartContainer.appendChild(bar);
  });
}

function generateDaysRow() {
  const daysRow = document.getElementById('days-row');
  if (!daysRow) return;
  
  daysRow.innerHTML = '';
  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  
  days.forEach((day, index) => {
    const btn = document.createElement('button');
    btn.className = `day-btn ${index === 6 ? 'active' : ''}`;
    btn.textContent = day;
    btn.onclick = () => selectDay(day, btn);
    daysRow.appendChild(btn);
  });
  
  // Set current date
  document.getElementById('selected-date-display').textContent = new Date().toLocaleDateString('ru-RU');
}

function selectDay(day, btnElement) {
  document.querySelectorAll('.day-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  btnElement.classList.add('active');
  
  // Load notes for selected day (mock data)
  const notesList = document.getElementById('day-notes-list');
  if (notesList) {
    notesList.innerHTML = `
      <div class="note-item">
        <div class="note-content">
          <div>Заметка за ${day}</div>
          <div class="note-date">${new Date().toLocaleDateString('ru-RU')}</div>
        </div>
        <button class="btn-delete" onclick="this.parentElement.remove()">✕</button>
      </div>
      <div class="note-item new-note">
        <textarea placeholder="Новая заметка за этот день..."></textarea>
      </div>
    `;
  }
  
  showToast(`Выбран: ${day}`);
}

// ==================== ACHIEVEMENTS ====================
function checkAchievements() {
  const newAchievements = [];
  
  // Water champion
  if (appData.habits.water.current >= 10 && !hasAchievement('water_champion')) {
    newAchievements.push({
      id: 'water_champion',
      name: 'Водный чемпион',
      icon: '💧',
      desc: 'Выпей 10л воды'
    });
  }
  
  // Week streak
  if (appData.stats.streak >= 7 && !hasAchievement('week_streak')) {
    newAchievements.push({
      id: 'week_streak',
      name: 'Серия 7 дней',
      icon: '🔥',
      desc: 'Неделя без пропусков'
    });
  }
  
  // Writer
  if (appData.notes.length >= 10 && !hasAchievement('writer')) {
    newAchievements.push({
      id: 'writer',
      name: 'Писатель',
      icon: '📝',
      desc: '10 заметок'
    });
  }
  
  // Add new achievements
  newAchievements.forEach(ach => {
    if (!appData.achievements.find(a => a.id === ach.id)) {
      appData.achievements.push(ach);
      showToast(`🏆 Достижение: ${ach.name}!`);
    }
  });
  
  if (newAchievements.length > 0) {
    renderAchievements();
    saveData();
  }
}

function hasAchievement(id) {
  return appData.achievements.some(a => a.id === id);
}

function renderAchievements() {
  const container = document.getElementById('achievements-list');
  if (!container) return;
  
  const defaultAchievements = [
    { id: 'water_champion', name: 'Водный чемпион', icon: '💧', desc: 'Выпей 10л воды' },
    { id: 'week_streak', name: 'Серия 7 дней', icon: '🔥', desc: 'Неделя без пропусков' },
    { id: 'writer', name: 'Писатель', icon: '📝', desc: '10 заметок' },
    { id: 'sport_master', name: 'Спортсмен', icon: '🏃', desc: '100 мин спорта' }
  ];
  
  container.innerHTML = '';
  
  defaultAchievements.forEach(ach => {
    const unlocked = hasAchievement(ach.id);
    const div = document.createElement('div');
    div.className = 'achievement';
    div.dataset.unlocked = unlocked;
    
    div.innerHTML = `
      <span class="achievement-icon">${unlocked ? ach.icon : '🔒'}</span>
      <span class="achievement-name">${ach.name}</span>
      <span class="achievement-desc">${ach.desc}</span>
    `;
    
    container.appendChild(div);
  });
}

// ==================== UTILITIES ====================
function updateCurrentDate() {
  const options = { day: 'numeric', month: 'long' };
  const dateStr = new Date().toLocaleDateString('ru-RU', options);
  const element = document.getElementById('current-date');
  if (element) {
    element.textContent = dateStr;
  }
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  
  toast.textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// ==================== DATA MANAGEMENT ====================
function saveData() {
  try {
    localStorage.setItem('myTrackerData', JSON.stringify(appData));
    console.log('Data saved');
  } catch (e) {
    console.error('Save error:', e);
    showToast('⚠️ Ошибка сохранения!', 'error');
  }
}

function loadData() {
  try {
    const saved = localStorage.getItem('myTrackerData');
    if (saved) {
      const parsed = JSON.parse(saved);
      appData = { ...appData, ...parsed };
      console.log('Data loaded');
    }
  } catch (e) {
    console.error('Load error:', e);
  }
}

function exportData() {
  const dataStr = JSON.stringify(appData, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mytracker_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  showToast('📤 Данные экспортированы!');
}

function clearAllData() {
  if (confirm('⚠️ ВНИМАНИЕ! Все данные будут удалены. Продолжить?')) {
    if (confirm('Вы уверены? Это действие нельзя отменить!')) {
      localStorage.removeItem('myTrackerData');
      location.reload();
    }
  }
}