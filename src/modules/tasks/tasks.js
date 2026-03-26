class TasksModule {
    constructor() {
        this.tasks = [];
    }
    
    async init() {
        this.tasks = await window.DataService.getTasks();
        if (this.tasks.length === 0) {
            this.tasks = [{id:1,title:'Первая задача ✅',type:'health',status:'completed'}];
        }
        console.log('📝 Tasks:', this.tasks.length);
    }
    
    render(container) {
        container.innerHTML = `
            <div style="max-width:900px;margin:0 auto">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem">
                    <div>
                        <h1 style="font-size:2.5rem;margin:0;color:#1f2937">📝 Мои задачи</h1>
                        <p style="color:#6b7280;margin:0.5rem 0 0 0">Управляй задачами и набирай очки!</p>
                    </div>
                    <div style="text-align:right">
                        <div style="font-size:1.5rem;font-weight:bold;color:#10b981">
                            ${this.tasks.filter(t=>t.status==='completed').length}/${this.tasks.length}
                        </div>
                        <div style="color:#6b7280;font-size:0.9rem">выполнено</div>
                    </div>
                </div>
                
                <form id="task-form" style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:2rem;border-radius:20px;color:white;box-shadow:0 20px 40px rgba(102,126,234,0.3);margin-bottom:2rem">
                    <div style="display:flex;gap:1rem;align-items:end">
                        <input id="task-title" style="flex:1;padding:1.25rem;font-size:1.1rem;border:none;border-radius:16px;box-shadow:inset 0 2px 4px rgba(0,0,0,0.1)" placeholder="Что нужно сделать сегодня?" required>
                        <select id="task-type" style="padding:1rem;font-size:1rem;border:none;border-radius:16px;background:#5a67d8">
                            <option value="health">💪 Здоровье (+20 очков)</option>
                            <option value="household">🏠 Дом (+10 очков)</option>
                            <option value="work">💼 Работа (+15 очков)</option>
                        </select>
                        <button type="submit" style="padding:1.25rem 2rem;font-size:1.1rem;font-weight:600;border:none;border-radius:16px;background:#10b981;color:white;cursor:pointer;box-shadow:0 4px 15px rgba(16,185,129,0.4)">➕ Создать</button>
                    </div>
                </form>
                
                <div style="display:grid;gap:1.5rem">
                    ${this.tasks.map(task => `
                        <div style="background:white;border-radius:20px;padding:2rem;box-shadow:0 10px 40px rgba(0,0,0,0.1);transition:transform 0.3s,box-shadow 0.3s;border-left:6px solid ${task.status==='completed'?'#10b981':'#6366f1'}">
                            <div style="display:flex;justify-content:space-between;align-items:start;gap:1rem">
                                <div style="flex:1">
                                    <h3 style="margin:0 0 0.5rem 0;font-size:1.4rem;color:#1f2937">${task.title}</h3>
                                    <div style="display:flex;gap:1rem">
                                        <span style="background:${task.type==='health'?'#10b981':task.type==='household'?'#f59e0b':'#6366f1'};color:white;padding:0.5rem 1rem;border-radius:20px;font-size:0.85rem;font-weight:500">${task.type}</span>
                                        <span style="color:#6b7280;font-size:0.9rem">${new Date(task.date||Date.now()).toLocaleDateString('ru')}</span>
                                    </div>
                                </div>
                                <button onclick="TasksModule.toggle(${task.id})" style="width:60px;height:60px;border-radius:50%;border:none;background:${task.status==='completed'?'#10b981':'#6366f1'};color:white;font-size:1.5rem;font-weight:bold;cursor:pointer;box-shadow:0 6px 20px rgba(99,102,241,0.4);transition:transform 0.2s" title="${task.status==='completed'?'Готово':'Выполнить'}">
                                    ${task.status==='completed'?'✅':'○'}
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        document.getElementById('task-form').onsubmit = async e => {
            e.preventDefault();
            const title = document.getElementById('task-title').value;
            const type = document.getElementById('task-type').value;
            const taskId = await window.DataService.saveTask({title, type, status: 'pending'});
            this.tasks.push({id: taskId, title, type, status: 'pending', date: new Date().toISOString()});
            this.render(container);
            e.target.reset();
        };
    }
    
    static async toggle(id) {
        console.log('Toggle task:', id);
    }
}

window.TasksModule = new TasksModule();
window.Core.registerModule('tasks', window.TasksModule);