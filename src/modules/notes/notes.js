console.log('📔 NOTES OK');

class NotesModule {
    constructor() {
        this.notes = [];
    }
    
    async init() {
        this.notes = await window.DataService.getNotes() || [
            {id:1, content:'Первая заметка о проекте', type:'text', date: new Date().toISOString()},
            {id:2, content:'Купить молоко завтра', type:'reminder', date: new Date(Date.now() - 86400000).toISOString()}
        ];
        console.log('📔 Notes:', this.notes.length);
    }
    
    render(container) {
        container.innerHTML = `
            <div style="max-width:900px;margin:0 auto">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem">
                    <div>
                        <h1 style="font-size:2.5rem;margin:0;color:#1f2937">📔 Заметки</h1>
                        <p style="color:#6b7280;margin:0.5rem 0 0 0">Быстрые записи и напоминания</p>
                    </div>
                    <div style="text-align:right">
                        <span style="font-size:1.5rem;font-weight:bold;color:#3b82f6">${this.notes.length}</span>
                        <div style="color:#6b7280;font-size:0.9rem">заметок</div>
                    </div>
                </div>
                
                <form id="note-form" style="background:white;padding:2rem;border-radius:20px;box-shadow:0 10px 40px rgba(0,0,0,0.1);margin-bottom:2rem">
                    <div style="display:flex;gap:1rem;align-items:end">
                        <textarea id="note-content" rows="3" style="flex:1;padding:1.25rem;font-size:1.1rem;border:2px solid #e5e7eb;border-radius:16px;font-family:monospace;resize:vertical;min-height:120px" placeholder="Впиши заметку... (Enter для новой строки)" required></textarea>
                        <select id="note-type" style="padding:1rem;font-size:1rem;border:2px solid #e5e7eb;border-radius:16px;background:white">
                            <option value="text">📄 Текст</option>
                            <option value="reminder">⏰ Напоминание</option>
                            <option value="idea">💡 Идея</option>
                            <option value="important">🔥 Важно</option>
                        </select>
                        <button type="submit" style="padding:1.25rem 1.5rem;font-size:1.1rem;font-weight:600;border:none;border-radius:16px;background:#3b82f6;color:white;cursor:pointer;box-shadow:0 4px 15px rgba(59,130,246,0.4)">💾 Сохранить</button>
                    </div>
                </form>
                
                <div style="display:grid;gap:1.5rem">
                    ${this.notes.map(note => `
                        <div style="background:white;border-radius:20px;padding:2rem;box-shadow:0 10px 40px rgba(0,0,0,0.08);position:relative;transition:transform 0.3s">
                            <div class="note-header" style="display:flex;justify-content:space-between;align-items:start;gap:1rem;margin-bottom:1rem">
                                <div style="display:flex;gap:1rem;align-items:center;flex-wrap:wrap">
                                    <span style="background:#3b82f6;color:white;padding:0.5rem 1rem;border-radius:25px;font-size:0.85rem;font-weight:500">${note.type}</span>
                                    <span style="color:#6b7280;font-size:0.9rem">${new Date(note.date).toLocaleString('ru', {day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'})}</span>
                                </div>
                                <button onclick="NotesModule.delete(${note.id})" style="width:40px;height:40px;border-radius:50%;border:none;background:#ef4444;color:white;font-size:1.2rem;cursor:pointer;font-weight:bold;box-shadow:0 4px 12px rgba(239,68,68,0.3)" title="Удалить">×</button>
                            </div>
                            <div class="note-content" style="font-size:1.1rem;line-height:1.6;color:#1f2937;white-space:pre-wrap">${note.content}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Events
        document.getElementById('note-form').onsubmit = async e => {
            e.preventDefault();
            const content = document.getElementById('note-content').value;
            const type = document.getElementById('note-type').value;
            const noteId = await window.DataService.saveNote({content, type});
            this.notes.unshift({id: noteId, content, type, date: new Date().toISOString()});
            this.render(container);
            e.target.reset();
        };
    }
    
    static async delete(id) {
        console.log('🗑️ Удалить заметку:', id);
        // DataService.deleteNote(id)
    }
}

window.NotesModule = new NotesModule();
window.Core.registerModule('notes', window.NotesModule);
console.log('✅ NotesModule готов');