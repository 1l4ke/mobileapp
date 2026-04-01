class TrackerModule {
  constructor() {
    this.entries = JSON.parse(localStorage.getItem('trackerEntries')) || [];
    this.streak = this.calculateStreak();
  }

  async init() {
    this.save();
  }

  render(container) {
    container.innerHTML = `
      <div class="tracker-header">
        <div class="streak-display">
          <h2>🔥 Стрик: <span id="streak-count">${this.streak}</span> дней</h2>
          <div class="streak-badge">Продолжай!</div>
        </div>
        <button class="add-entry-btn">➕ Добавить день</button>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <h3>Всего дней</h3>
          <div class="stat-number">${this.entries.length}</div>
        </div>
        <div class="stat-card">
          <h3>Успешных</h3>
          <div class="stat-number">${this.entries.filter(e => e.success).length}</div>
        </div>
        <div class="stat-card">
          <h3>Уровень</h3>
          <div class="stat-number level">${Math.floor(this.entries.filter(e => e.success).length / 10)}</div>
        </div>
      </div>

      <canvas id="progress-chart" width="400" height="200"></canvas>

      <div class="entries-list">
        <!-- Динамически -->
      </div>

      <div class="entry-form" style="display:none;">
        <div class="form-row">
          <input id="entry-date" type="date" />
          <select id="entry-success">
            <option value="success">✅ Успех</option>
            <option value="fail">❌ Провал</option>
            <option value="skip">⏭️ Пропуск</option>
          </select>
        </div>
        <div class="form-row">
          <textarea id="entry-notes" placeholder="Заметки за день..."></textarea>
        </div>
        <div class="form-actions">
          <button id="entry-save">Сохранить</button>
          <button id="entry-cancel">Отмена</button>
        </div>
      </div>
    `;

    this.renderEntries();
    this.renderChart();
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
    document.getElementById('streak-count').textContent = this.streak;
  }
}

window.Core.registerModule('tracker', new TrackerModule());