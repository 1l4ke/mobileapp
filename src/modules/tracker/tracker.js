class TrackerModule {
  constructor() {
    this.entries = JSON.parse(localStorage.getItem('trackerEntries')) || [];
    this.streak = this.calculateStreak();
  }

  async init() {
  
  }

  render(container) {
  container.innerHTML = `
    <div class="tracker-header">
      <div>
        <h2>📈 Привычки</h2>
        <input type="date" id="datePicker" onchange="TrackerModule.loadDay()" style="margin-top:0.5rem;padding:0.75rem;border:2px solid var(--border);border-radius:8px;">
      </div>
      <button class="add-entry-btn" onclick="TrackerModule.showHabitEditor()">➕ Добавить</button>
    </div>
    <div class="habits-grid" id="habitsGrid"></div>
    <div class="day-stats" id="dayStats"></div>
  `;
  this.renderHabits();
  this.loadDay(); // Текущий день по умолчанию
  this.bindEvents();
}

  renderEntries() {
    const list = document.querySelector('.entries-list');
    const recent = this.entries.slice(-7).reverse(); // Последние 7 дней

    list.innerHTML = recent.map((entry, i) => `
      <div class="entry-item ${entry.success ? 'success' : entry.skip ? 'skip' : 'fail'}">
        <div class="entry-date">${new Date(entry.date).toLocaleDateString()}</div>
        <div class="entry-status">
          ${entry.success ? '✅' : entry.skip ? '⏭️' : '❌'}
          ${entry.success ? 'Успех' : entry.skip ? 'Пропуск' : 'Провал'}
        </div>
        ${entry.notes ? `<div class="entry-notes">${entry.notes}</div>` : ''}
      </div>
    `).join('') || '<p class="empty-state">Начни трекить привычки!</p>';
  }

  renderChart() {
    const canvas = document.getElementById('progress-chart');
    const ctx = canvas.getContext('2d');
    
    // Данные за 30 дней
    const days = 30;
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const entry = this.entries.find(e => new Date(e.date).toDateString() === date.toDateString());
      data.push(entry?.success ? 1 : 0);
    }

    // График
    const maxHeight = 150;
    const barWidth = canvas.width / days - 2;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    data.forEach((value, i) => {
      const barHeight = value * maxHeight;
      const x = i * (barWidth + 2);
      
      ctx.fillStyle = value ? '#10b981' : '#e5e7eb';
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
      
      // Стрик highlight
      if (i === data.length - this.streak && this.streak > 0) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 4;
        ctx.strokeRect(x - 1, canvas.height - maxHeight - 1, barWidth + 2, maxHeight + 2);
      }
    });
  }

  bindEvents() {
    document.querySelector('.add-entry-btn').onclick = () => this.showEditor();

    document.querySelector('#entry-save').onclick = () => this.saveEntry();
    document.querySelector('#entry-cancel').onclick = () => this.hideEditor();

    document.querySelector('.entries-list').addEventListener('click', (e) => {
      const item = e.target.closest('.entry-item');
      if (item && e.target.closest('.delete-entry')) {
        const index = parseInt(item.dataset.index);
        this.deleteEntry(index);
      }
    });
  }

  showEditor(editIndex = null) {
    this.editingIndex = editIndex;
    const form = document.querySelector('.entry-form');
    form.style.display = 'block';
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('entry-date').value = editIndex !== null ? 
      this.entries[editIndex].date.split('T')[0] : today;
    
    if (editIndex !== null) {
      const entry = this.entries[editIndex];
      document.getElementById('entry-success').value = entry.success ? 'success' : entry.skip ? 'skip' : 'fail';
      document.getElementById('entry-notes').value = entry.notes || '';
    }
  }

  hideEditor() {
    document.querySelector('.entry-form').style.display = 'none';
    this.clearEditor();
  }

  saveEntry() {
    const date = document.getElementById('entry-date').value;
    const status = document.getElementById('entry-success').value;
    const notes = document.getElementById('entry-notes').value.trim();

    const entry = { date: date + 'T00:00:00Z', success: status === 'success', skip: status === 'skip', notes };

    if (this.editingIndex !== null) {
      this.entries[this.editingIndex] = entry;
    } else {
      this.entries.push(entry);
      this.entries.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    this.streak = this.calculateStreak();
    this.save();
    this.renderEntries();
    this.renderChart();
    this.hideEditor();
  }

  deleteEntry(index) {
    if (confirm('Удалить запись?')) {
      this.entries.splice(index, 1);
      this.streak = this.calculateStreak();
      this.save();
      this.renderEntries();
      this.renderChart();
    }
  }

  calculateStreak() {
    let streak = 0;
    const today = new Date().toDateString();
    
    for (let i = this.entries.length - 1; i >= 0; i--) {
      const entryDate = new Date(this.entries[i].date).toDateString();
      
      if (this.entries[i].success && this.isConsecutive(today, entryDate, streak)) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  isConsecutive(today, entryDate, streak) {
    const daysDiff = (new Date(today) - new Date(entryDate)) / (1000 * 60 * 60 * 24);
    return daysDiff === streak;
  }

  clearEditor() {
    document.getElementById('entry-date').value = '';
    document.getElementById('entry-success').value = 'success';
    document.getElementById('entry-notes').value = '';
  }

  save() {
  localStorage.setItem('trackerEntries', JSON.stringify(this.entries));
  
  const streakEl = document.getElementById('streak-count');
  if (streakEl) {
    streakEl.textContent = this.streak;
  }
}
habits = [
  {id:'water', name:'Вода (л)', goal:2, icon:'💧'},
  {id:'sport', name:'Спорт (мин)', goal:30, icon:'💪'},
  {id:'reading', name:'Чтение (стр)', goal:20, icon:'📖'},
  {id:'sleep', name:'Сон (часы)', goal:8, icon:'😴'}, // Новое
  {id:'walk', name:'Прогулка (км)', goal:5, icon:'🚶'} // Новое
];

renderHabits() {
  const grid = document.getElementById('habitsGrid');
  grid.innerHTML = this.habits.map(habit => {
    const todayData = this.getTodayHabit(habit.id);
    const progress = todayData ? (todayData.value / habit.goal * 100) : 0;
    return `
      <div class="habit-card">
        <div class="habit-icon">${habit.icon}</div>
        <div class="habit-name">${habit.name}</div>
        <div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>
        <div class="habit-value">${todayData?.value || 0}/${habit.goal}</div>
        <input type="number" min="0" max="${habit.goal*2}" value="${todayData?.value || ''}" onchange="TrackerModule.updateHabit('${habit.id}', this.value)" placeholder="0">
        <button onclick="TrackerModule.resetHabit('${habit.id}')">Сброс</button>
      </div>
    `;
  }).join('');
}

getTodayHabit(habitId) {
  const today = new Date().toDateString();
  const data = localStorage.getItem(`${habitId}_${today}`);
  return data ? JSON.parse(data) : null;
}

updateHabit(id, value) {
  const today = new Date().toDateString();
  const habit = this.habits.find(h => h.id === id);
  localStorage.setItem(`${id}_${today}`, JSON.stringify({value: parseFloat(value)||0, date: today}));
  this.renderHabits();
}

resetHabit(id) {
  const today = new Date().toDateString();
  localStorage.removeItem(`${id}_${today}`);
  this.renderHabits();
}

loadDay() {
  const date = document.getElementById('datePicker').value;
  const dateStr = date ? new Date(date).toDateString() : new Date().toDateString();
  const stats = document.getElementById('dayStats');
  
  let html = `<h3>📅 ${new Date(dateStr).toLocaleDateString('ru-RU')} (${habits.length} привычек)</h3>`;
  let completed = 0;
  this.habits.forEach(habit => {
    const data = localStorage.getItem(`${habit.id}_${dateStr}`);
    if (data) {
      const val = JSON.parse(data).value;
      const done = val >= habit.goal;
      completed += done ? 1 : 0;
      html += `<div class="stat-item"><span>${habit.icon} ${habit.name}</span><span>${val}/${habit.goal} ${done ? '✅' : '❌'}</span></div>`;
    }
  });
  html += `<div style="margin-top:1rem;padding:1rem;background:var(--success);color:white;border-radius:8px;">Завершено: ${completed}/${this.habits.length}</div>`;
  stats.innerHTML = html;
}

showHabitEditor() { /* модалка если нужно */ }
}

window.Core.registerModule('tracker', new TrackerModule());