import { db } from './firebase-config.js';
import { collection, addDoc, query, orderBy, limit, getDocs } from "firebase/firestore";
import { getUser } from './auth.js';

const leaderboardModal = document.getElementById('leaderboard-modal');
const leaderboardBtn = document.getElementById('leaderboard-btn');
const closeLeaderboard = document.getElementById('close-leaderboard');
const leaderboardList = document.getElementById('leaderboard-list');

// UI
leaderboardBtn.addEventListener('click', () => {
    leaderboardModal.classList.add('show');
    fetchLeaderboard();
});

closeLeaderboard.addEventListener('click', () => {
    leaderboardModal.classList.remove('show');
});

// Save Score
export async function saveScore(wpm, accuracy, level) {
    const user = getUser();
    if (!user) return; // Only save if logged in

    try {
        // We could check if it's a high score, but for now just save everything
        // Or better: Save one document per user per level? 
        // For simplicity: Add new score.
        await addDoc(collection(db, "scores"), {
            uid: user.uid,
            username: user.displayName || "Anonymous",
            wpm: wpm,
            accuracy: accuracy,
            level: level,
            timestamp: new Date()
        });
        console.log("Score saved!");
    } catch (e) {
        console.error("Error adding score: ", e);
    }
}

// Fetch Leaderboard
async function fetchLeaderboard() {
    leaderboardList.innerHTML = '<p>Loading scores...</p>';

    // Default: Top 10 by WPM across all levels? 
    // Ideally user selects level filter. defaulting to simple list.
    const q = query(collection(db, "scores"), orderBy("wpm", "desc"), limit(20));

    try {
        const querySnapshot = await getDocs(q);
        leaderboardList.innerHTML = '';

        if (querySnapshot.empty) {
            leaderboardList.innerHTML = '<p>No scores yet. Be the first!</p>';
            return;
        }

        let html = '';
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const date = data.timestamp ? data.timestamp.toDate().toLocaleDateString() : '';
            html += `
                <div class="score-row">
                    <span>${data.level?.toUpperCase() || '-'}</span>
                    <strong style="color:var(--primary-color)">${data.wpm} WPM</strong>
                    <span>${data.accuracy}%</span>
                    <span>${data.username}</span>
                </div>
            `;
        });
        leaderboardList.innerHTML = html;
    } catch (error) {
        console.error("Error fetching leaderboard: ", error);
        leaderboardList.innerHTML = '<p>Error loading scores.</p>';
    }
}
