class AuthService {
    async loginGuest() {
        const user = { id: 'guest', name: 'Гость', points: 0 };
        document.getElementById('user-profile').innerHTML = `
            <span class="user-name">${user.name}</span>
            <div class="points-display">
                <span class="points-label">баллов</span>
                <span id="total-points" class="points-value">${user.points}</span>
            </div>
        `;
        console.log('👤 Гость вошел');
    }
}

window.AuthService = new AuthService();
