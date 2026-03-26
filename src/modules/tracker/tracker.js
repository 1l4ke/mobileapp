console.log('📈 TRACKER OK');

class TrackerModule {
    constructor() {
        this.stats = {};
    }
    
    async init() {
        const tasks = await window.DataService.getTasks();
        const notes = await window.DataService.getNotes();
        
        this.stats = {
            totalTasks: tasks.length,
            completedTasks: tasks.filter(t => t.status === 'completed').length,
            totalNotes: notes.length,
            taskTypes: {
                health: tasks.filter(t => t.type === 'health').length,
                household: tasks.filter(t => t.type === 'household').length,
                work: tasks.filter(t => t.type === 'work').length
            },
            streak: Math.min(this.completedTasks, 7),  // Макс 7 дней
            points: this.completedTasks * 15  // 15 очков за задачу
        };
        
        console.log('📈 Stats:', this.stats);
    }
    
    render(container) {
        container.innerHTML = `
            <div style="max-width:1000px;margin:0 auto;padding:2rem">
                <div style="text-align:center;margin-bottom:3rem">
                    <h1 style="font-size:3rem;margin:0;color:#1f2937">📈 Твой прогресс</h1>
                    <p style="color:#6b7280;font-size:1.2rem;margin:1rem 0">Статистика за всё время</p>
                    
                    <!-- Level badge -->
                    <div style="display:inline-block;background:linear-gradient(135deg,#10b981,#059669);color:white;padding:1rem 2rem;border-radius:50px;font-size:1.3rem;font-weight:bold;box-shadow:0 10px 30px rgba(16,185,129,0.4);margin:1rem 0">
                        Уровень ${Math.floor(this.stats.points / 100) + 1}
                    </div>
                </div>
                
                <!-- Stats grid -->
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:2rem;margin-bottom:3rem">
                    <div style="background:white;padding:2rem;border-radius:20px;box-shadow:0 10px 40px rgba(0,0,0,0.1);text-align:center">
                        <div style="font-size:3.5rem;color:#3b82f6;margin-bottom:1rem">${this.stats.totalTasks}</div>
                        <div style="font-size:1.2rem;color:#1f2937;font-weight:600">Задач всего</div>
                        <div style="color:#10b981;font-size:1.1rem;font-weight:bold">${this.stats.completedTasks} выполнено</div>
                    </div>
                    
                    <div style="background:white;padding:2rem;border-radius:20px;box-shadow:0 10px 40px rgba(0,0,0,0.1);text-align:center">
                        <div style="font-size:3.5rem;color:#10b981;margin-bottom:1rem">${this.stats.totalNotes}</div>
                        <div style="font-size:1.2rem;color:#1f2937;font-weight:600">Заметок</div>
                        <div style="color:#6b7280;font-size:1rem">Быстрые записи</div>
                    </div>
                    
                    <div style="background:white;padding:2rem;border-radius:20px;box-shadow:0 10px 40px rgba(0,0,0,0.1);text-align:center">
                        <div style="font-size:3.5rem;color:#f59e0b;margin-bottom:1rem">${this.stats.streak}</div>
                        <div style="font-size:1.2rem;color:#1f2937;font-weight:600">Серия дней</div>
                        <div style="color:#f59e0b;font-size:1.1rem;font-weight:bold">Продолжай! 🔥</div>
                    </div>
                    
                    <div style="background:white;padding:2rem;border-radius:20px;box-shadow:0 10px 40px rgba(0,0,0,0.1);text-align:center">
                        <div style="font-size:3.5rem;color:#6366f1;margin-bottom:1rem">${this.stats.points}</div>
                        <div style="font-size:1.2rem;color:#1f2937;font-weight:600">Очков</div>
                        <div style="color:#6b7280;font-size:1rem">За все задачи</div>
                    </div>
                </div>
                
                <!-- Progress bars -->
                <div style="background:white;padding:2rem;border-radius:20px;box-shadow:0 10px 40px rgba(0,0,0,0.1)">
                    <h3 style="margin-top:0;color:#1f2937">Типы задач</h3>
                    <div style="display:flex;flex-direction:column;gap:1rem">
                        <div>
                            <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem">
                                <span>💪 Здоровье</span>
                                <span>${this.stats.taskTypes.health} задач</span>
                            </div>
                            <div style="height:12px;background:#e5e7eb;border-radius:6px;overflow:hidden">
                                <div style="height:100%;background:#10b981;width:${Math.min(this.stats.taskTypes.health*10,100)}%;transition:width 0.5s"></div>
                            </div>
                        </div>
                        
                        <div>
                            <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem">
                                <span>🏠 Дом</span>
                                <span>${this.stats.taskTypes.household} задач</span>
                            </div>
                            <div style="height:12px;background:#e5e7eb;border-radius:6px;overflow:hidden">
                                <div style="height:100%;background:#f59e0b;width:${Math.min(this.stats.taskTypes.household*10,100)}%;transition:width 0.5s"></div>
                            </div>
                        </div>
                        
                        <div>
                            <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem">
                                <span>💼 Работа</span>
                                <span>${this.stats.taskTypes.work || 0} задач</span>
                            </div>
                            <div style="height:12px;background:#e5e7eb;border-radius:6px;overflow:hidden">
                                <div style="height:100%;background:#6366f1;width:${Math.min((this.stats.taskTypes.work||0)*10,100)}%;transition:width 0.5s"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

window.TrackerModule = new TrackerModule();
window.Core.registerModule('tracker', window.TrackerModule);
console.log('✅ Tracker готов');