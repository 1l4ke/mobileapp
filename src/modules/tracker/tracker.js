class TrackerModule {
  constructor() {
    this.entries = JSON.parse(localStorage.getItem('trackerEntries')) || [];
    this.streak = this.calculateStreak();
    // Привычки как свойство класса
    this.habits = [
      {id:'water', name:'Вода (л)', goal:2, icon:'💧'},
      {id:'sport', name:'Спорт (мин)', goal:30, icon:'💪'},
      {id:'reading', name:'Чтение (стр)', goal:20, icon:'📖'},
      {id:'sleep', name:'Сон (часы)', goal:8, icon:'😴'},
      {id:'walk', name:'Прогулка (км)', goal:5, icon:'🚶'}
    ];
  }

  render(container) {
    container.innerHTML = `
      <div class="tracker-header">
        <div>
          <h2>📈 Привычки</h2>
          <input type="date" id="datePicker" onchange="window.TrackerInstance.loadDay()" style="margin-top:0.5rem;padding:0.75rem;border:2px solid var(--border);border-radius:8px;">
        </div>
        <button class="add-entry-btn" onclick="window.TrackerInstance.showHabitEditor()">➕ Добавить</button>
      </div>
      <div class="habits-grid" id="habitsGrid"></div>
      <div class="day-stats" id="dayStats"></div>
    `;
    this.renderHabits();
    this.loadDay();
  }

  renderHabits() {
    const grid = document.getElementById('habitsGrid');
    if (!grid) return;
    grid.innerHTML = this.habits.map(habit => {
      const todayData = this.getTodayHabit(habit.id);
      const progress = todayData ? (todayData.value / habit.goal * 100) : 0;
      return `
        <div class="habit-card">
          <div class="habit-icon">${habit.icon}</div>
          <div class="habit-name">${habit.name}</div>
          <div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>
          <div class="habit-value">${todayData?.value || 0}/${habit.goal}</div>
          <input type="number" min="0" max="${habit.goal*2}" value="${todayData?.value || ''}" onchange="window.TrackerInstance.updateHabit('${habit.id}', this.value)" placeholder="0">
          <button onclick="window.TrackerInstance.resetHabit('${habit.id}')">Сброс</button>
        </div>
      `;
    }).join('');
  }

  getTodayHabit(habitId) {
    const today = new Date().toDateString();
    try {
      const data = localStorage.getItem(`${habitId}_${today}`);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  updateHabit(id, value) {
    const today = new Date().toDateString();
    const habitData = {value: parseFloat(value) || 0, date: today};
    localStorage.setItem(`${id}_${today}`, JSON.stringify(habitData));
    this.renderHabits();
  }

  resetHabit(id) {
    const today = new Date().toDateString();
    localStorage.removeItem(`${id}_${today}`);
    this.renderHabits();
  }

  loadDay() {
    const dateInput = document.getElementById('datePicker');
    const dateStr = dateInput && dateInput.value ? new Date(dateInput.value).toDateString() : new Date().toDateString();
    const stats = document.getElementById('dayStats');
    if (!stats) return;

    let html = `<h3>📅 ${new Date(dateStr).toLocaleDateString('ru-RU')} (${this.habits.length} привычек)</h3>`;
    let completed = 0;
    this.habits.forEach(habit => {
      try {
        const data = localStorage.getItem(`${habit.id}_${dateStr}`);
        if (data) {
          const val = JSON.parse(data).value;
          const done = val >= habit.goal;
          completed += done ? 1 : 0;
          html += `<div class="stat-item"><span>${habit.icon} ${habit.name}</span><span>${val}/${habit.goal} ${done ? '✅' : '❌'}</span></div>`;
        }
      } catch {}
    });
    html += `<div style="margin-top:1rem;padding:1rem;background:var(--success);color:white;border-radius:8px;font-weight:600;">Завершено: ${completed}/${this.habits.length}</div>`;
    stats.innerHTML = html || '<p>Нет данных</p>';
  }

  showHabitEditor() {
    // Простая модалка для новых привычек (опционально)
    alert('Добавление новой привычки в разработке! Используйте существующие.');
  }

  bindEvents() {
    // Пустой - события через window.TrackerInstance
  }

  calculateStreak() { return 0; } // Заглушка

  save() {
    localStorage.setItem('trackerEntries', JSON.stringify(this.entries));
  }
}

// Глобальная ссылка
window.TrackerInstance = new TrackerModule();
window.Core.registerModule('tracker', window.TrackerInstance);
