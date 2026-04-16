:root {
    --plum: #710C21;
    --orchid: #A24C61;
    --cream: #F5EBE6;
    --glass-white: rgba(255, 255, 255, 0.35);
    --border-white: rgba(255, 255, 255, 0.5);
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
    font-family: 'Manrope', sans-serif;
    background: var(--cream);
    background-image: radial-gradient(at 0% 0%, rgba(162, 76, 97, 0.15) 0px, transparent 50%),
                      radial-gradient(at 100% 100%, rgba(113, 12, 33, 0.1) 0px, transparent 50%);
    background-attachment: fixed;
    color: var(--plum);
    padding: 80px 20px;
    display: flex;
    justify-content: center;
}

.app-layout { width: 100%; max-width: 900px; display: flex; flex-direction: column; gap: 25px; }

/* FLUID GLASSMORPHISM */
.card {
    background: var(--glass-white);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid var(--border-white);
    border-radius: 40px;
    padding: 45px;
    box-shadow: 0 10px 40px rgba(113, 12, 33, 0.04);
}

.serif { font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 600; }
.eyebrow { font-size: 10px; letter-spacing: 3px; font-weight: 800; color: var(--orchid); text-transform: uppercase; margin-bottom: 12px; }

.hero-section { text-align: center; }
.hero-section h1 { font-size: 72px; margin-bottom: 15px; }
.description { font-size: 15px; opacity: 0.7; line-height: 1.6; max-width: 600px; margin: 0 auto 30px; }

.pill-row { display: flex; justify-content: center; gap: 12px; margin-bottom: 40px; }
.pill { border: 1px solid var(--orchid); padding: 8px 20px; border-radius: 50px; font-size: 11px; font-weight: 700; color: var(--orchid); }

.live-status-container {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 35px;
    padding: 30px;
    display: flex;
    align-items: center;
    justify-content: space-around;
    gap: 20px;
}
.live-status-container h2 { font-size: 50px; line-height: 1; }

.stats-grid { display: grid; grid-template-columns: repeat(3, 80px); gap: 10px; text-align: center; }
.stat-item strong { font-size: 20px; display: block; }

.grid-form { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }

input, select { 
    width: 100%; padding: 16px; border-radius: 15px; border: 1px solid rgba(162, 76, 97, 0.2); 
    background: rgba(255, 255, 255, 0.5); font-family: inherit; font-size: 14px; outline: none;
    transition: all 0.3s;
}
input:focus { border-color: var(--orchid); background: white; }

.checkbox-row { grid-column: span 2; display: flex; gap: 15px; }
.pill-check { flex: 1; background: rgba(162, 76, 97, 0.1); padding: 15px; border-radius: 50px; text-align: center; font-size: 12px; font-weight: 800; cursor: pointer; color: var(--orchid); display: flex; align-items: center; justify-content: center; gap: 10px; }

.form-actions { grid-column: span 2; display: flex; gap: 15px; margin-top: 10px; }
.primary-btn { background: var(--plum); color: white; border: none; padding: 20px; border-radius: 60px; font-weight: 800; flex: 2; cursor: pointer; font-size: 14px; }
.action-btn-outline { background: transparent; border: 1.5px solid var(--plum); color: var(--plum); padding: 12px 25px; border-radius: 50px; font-weight: 800; cursor: pointer; font-size: 12px; }

.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 25px; }
.summary-card { text-align: center; }
.status-badge { background: var(--orchid); color: white; padding: 6px 18px; border-radius: 50px; font-size: 11px; font-weight: 800; display: inline-block; margin-bottom: 10px; }
.score-text { margin-top: 10px; font-size: 14px; }

.guidance-list { list-style: none; font-size: 14px; line-height: 2; }
.guidance-list li::before { content: "→ "; color: var(--orchid); font-weight: 800; }

.table-controls { display: flex; gap: 15px; }
.search-box { padding: 12px 25px; border-radius: 50px; background: white; width: 220px; }
.table-container { margin-top: 30px; overflow-x: auto; }
table { width: 100%; border-collapse: collapse; min-width: 600px; }
th { text-align: left; font-size: 10px; padding: 20px; border-bottom: 2px solid rgba(113, 12, 33, 0.1); text-transform: uppercase; letter-spacing: 1.5px; }
td { padding: 20px; font-size: 14px; border-bottom: 1px solid rgba(113, 12, 33, 0.05); }

.del-btn { color: var(--plum); font-weight: 800; cursor: pointer; background: none; border: none; text-decoration: underline; font-size: 12px; }
