(function(){
  const QUESTIONS = [
    { q:"What's my favorite nickname?", opts:["Lulu","Lu","Jojo","Luji"], correct:0 },
    { q:"When's my birthday?", opts:["May 21st","May 25th","May 15th","May 30th"], correct:0 },
    { q:"What's my favorite color?", opts:["Blue","Coral","White","Butter Yellow"], correct:0 },
    { q:"Who's my favorite artist?", opts:["The Weeknd","Bryson Tiller","Adrianne Lenker","PartyNextDoor"], correct:0 },
    { q:"Who's my celebrity crush?", opts:["James Franco","Henry Cavill","Joseph Morgan","Chris Evans"], correct:0 },
    { q:"What's my go-to drink order?", opts:["Spanish Latte","Matcha","Iced Americano","Tea and Mint"], correct:0 },
    { q:"Am I a morning person or a night owl?", opts:["Morning person","Night owl"], correct:0 },
    { q:"What's my favorite cartoon?", opts:["Adventure Time","The Amazing World of Gumball","Clarence","In the Night Garden"], correct:0 },
    { q:"Who named me?", opts:["My mom","My dad","My grandma","My grandpa"], correct:0 },
    { q:"How old am I?", opts:["19","20","21","22"], correct:1 },
    { q:"What is my favorite type of music?", opts:["Everything (almost)","R&B only","Pop only","Hip-Hop only"], correct:0 },
    { q:"What's my favorite cat?", opts:["Leo","Sukkar"], correct:0 },
    { q:"How much did I get in my high school senior year?", opts:["85.9","82.3","88.4","79.6"], correct:0 },
    { q:"What's my least favorite type of music?", opts:["Pop","Metal","Jazz"], correct:0 },
    { q:"How many kids do I want?", opts:["Two boys, two girls","One boy, one girl","Three boys","No kids"], correct:0 },
    { q:"Am I over my ex?", opts:["Yes","No"], correct:1 },
    { q:"Before my parents picked my name, what was I supposed to be called?", opts:["Zein","Salma","Nour","Laila"], correct:0 },
    { q:"What family member do I look the most like?", opts:["Ahmad","My mama","My baba","Bashar"], correct:0 },
    { q:"What do I love most about myself?", opts:["Everything","My looks","My personality","My style"], correct:0 },
  ];

  const mount = document.getElementById('quizMount');
  const rail = document.getElementById('rail');
  let score = 0;
  let answered = new Array(QUESTIONS.length).fill(false);
  const photoSlots = [];

  QUESTIONS.forEach((item, i) => {
    const section = document.createElement('section');
    section.className = 'qsection';
    section.id = 'q'+i;

    const wrap = document.createElement('div');
    wrap.className = 'qcard-wrap';

    // photo placeholder
    const rotDeg = (i % 2 === 0 ? -1 : 1) * (4 + (i % 4) * 2);
    const photoSlot = document.createElement('label');
    photoSlot.className = 'photo-slot ' + (i % 2 === 0 ? 'side-left' : 'side-right');
    photoSlot.dataset.rot = rotDeg;
    photoSlot.style.transform = `rotate(${rotDeg}deg)`;
    photoSlot.innerHTML = '<input type="file" accept="image/*" hidden><span class="photo-plus">+</span><span class="photo-label">add photo</span>';
    const fileInput = photoSlot.querySelector('input');
    fileInput.addEventListener('change', () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      photoSlot.style.backgroundImage = `url(${url})`;
      photoSlot.classList.add('filled');
    });
    wrap.appendChild(photoSlot);
    photoSlots.push(photoSlot);

    const card = document.createElement('div');
    card.className = 'qcard';

    const idx = document.createElement('div');
    idx.className = 'qindex';
    idx.textContent = String(i+1).padStart(2,'0') + ' / ' + String(QUESTIONS.length).padStart(2,'0');
    card.appendChild(idx);

    const qtext = document.createElement('div');
    qtext.className = 'qtext';
    qtext.textContent = item.q;
    card.appendChild(qtext);

    const opts = document.createElement('div');
    opts.className = 'options';

    // Pair options with their original array indices before shuffling
    const shuffledOpts = item.opts.map((label, originalIndex) => ({
      label,
      originalIndex
    }));

    // Scramble choices randomly
    shuffledOpts.sort(() => Math.random() - 0.5);

    // Build buttons using the mixed up options
    shuffledOpts.forEach((optObj, btnIdx) => {
      const b = document.createElement('button');
      b.className = 'opt';
      b.textContent = optObj.label;
      
      b.addEventListener('click', () => {
        if (answered[i]) return;
        answered[i] = true;
        
        const allBtns = opts.querySelectorAll('.opt');
        allBtns.forEach(btn => btn.classList.add('disabled'));
        
        if (optObj.originalIndex === item.correct) {
          b.classList.add('correct');
          score++;
        } else {
          b.classList.add('wrong');
          // Scan the scrambled layout to reveal the correct button wherever it landed
          shuffledOpts.forEach((o, idxToCheck) => {
            if (o.originalIndex === item.correct) {
              allBtns[idxToCheck].classList.add('correct');
            }
          });
        }
        
        updateScoreBadge();
        feedback.classList.add('show');
        feedback.innerHTML = optObj.originalIndex === item.correct
          ? "good job <b> baby </b>"
          : "oops not rlly, now u know tho";
      });
      opts.appendChild(b);
    });
    card.appendChild(opts);

    const feedback = document.createElement('div');
    feedback.className = 'feedback';
    card.appendChild(feedback);

    wrap.appendChild(card);
    section.appendChild(wrap);
    mount.appendChild(section);

    const dot = document.createElement('div');
    dot.className = 'dot';
    dot.dataset.index = i;
    rail.appendChild(dot);
  });

  function updateScoreBadge(){
    document.getElementById('scoreBadgeNum').textContent = score;
  }

  // scroll-driven focus effect
  const allSections = document.querySelectorAll('.qsection');
  const dots = document.querySelectorAll('#rail .dot');
  const scoreBadge = document.getElementById('scoreBadge');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const i = Array.from(allSections).indexOf(entry.target);
      if (entry.isIntersecting && entry.intersectionRatio > 0.55){
        entry.target.classList.add('active');
        dots.forEach(d => d.classList.remove('active'));
        if (dots[i]) dots[i].classList.add('active');
      } else {
        entry.target.classList.remove('active');
      }
    });
  }, { threshold: [0, 0.55, 1] });
  allSections.forEach(s => observer.observe(s));

  // photo parallax on scroll
  const mainEl = document.getElementById('main');
  let ticking = false;
  function updateParallax(){
    const vh = window.innerHeight;
    photoSlots.forEach(el => {
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const delta = (vh / 2 - center) * 0.18;
      const rot = el.dataset.rot;
      el.style.transform = `rotate(${rot}deg) translateY(${delta}px)`;
    });
    ticking = false;
  }
  function onScroll(){
    dots.forEach((d,i) => { if (answered[i]) d.classList.add('done'); });
    scoreBadge.classList.toggle('show', mainEl.scrollTop > window.innerHeight * 0.6);
    if (!ticking){
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }
  mainEl.addEventListener('scroll', onScroll);
  updateParallax();

  // hero -> start
  const nameInput = document.getElementById('playerName');
  const startBtn = document.getElementById('startBtn');
  const scrollHint = document.getElementById('scrollHint');
  let playerName = '';

  nameInput.addEventListener('input', () => {
    startBtn.disabled = nameInput.value.trim().length === 0;
  });
  nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !startBtn.disabled) startBtn.click();
  });

  startBtn.addEventListener('click', () => {
    playerName = nameInput.value.trim().slice(0,24) || 'Anonymous';
    document.getElementById('q0').scrollIntoView({ behavior:'smooth' });
  });

  setTimeout(() => scrollHint.classList.add('show'), 900);

  // theme toggle
  const themeToggle = document.getElementById('themeToggle');
  const THEME_KEY = 'quiz_theme';
  let theme = localStorage.getItem(THEME_KEY) || 'dark';
  function applyTheme(){
    document.documentElement.setAttribute('data-theme', theme);
    themeToggle.textContent = theme === 'dark' ? '☀' : '☾';
  }
  applyTheme();
  themeToggle.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, theme);
    applyTheme();
  });

  // results
  function goToResults(){
    document.getElementById('finalScore').textContent = score;
    const tierEl = document.getElementById('resultTier');
    const msgEl = document.getElementById('resultMsg');
    let tier, msg;
    if (score === 19){ tier = "marry me?"; msg = "you're my soulmate"; }
    else if (score >= 15){ tier = "i love u"; msg = "ouuu"; }
    else if (score >= 10){ tier = "hehe"; msg = "okayyy"; }
    else if (score >= 5){ tier = "woah"; msg = "we should hang out more "; }
    else { tier = "STRANGER"; msg = "did we just meet?"; }
    tierEl.textContent = tier;
    msgEl.textContent = msg;
  }

  const io2 = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) goToResults(); });
  }, { threshold: 0.6 });
  io2.observe(document.getElementById('results'));

  document.getElementById('retryBtn').addEventListener('click', () => {
    location.reload();
  });


  // ==========================================
  // GLOBAL LEADERBOARD (SUPABASE CONNECTIONS)
  // ==========================================
  
  // PASTE YOUR KEYS FROM SUPABASE INSIDE THE SINGLE QUOTES BELOW:
  const SUPABASE_URL = 'sb_publishable_90GcHyudLqEV8mnjE0hWdw_JEUYdwOC';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnbnhyeWtybHRreHB0a2dhdHFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNDMzMjEsImV4cCI6MjA5OTYxOTMyMX0.AcMKvA9OyduKZRXGr_t2U-WwQjFpXMYAlqOZ00TK9xE';
  
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  let lbRecorded = false;

  // Retrieve global top scores from Supabase
  async function loadLB() {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('name, score')
        .order('score', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch(e) {
      console.error("Error loading leaderboard:", e);
      return [];
    }
  }

  // Push new row to your Supabase table spreadsheet
  async function saveLB(playerName, scoreVal) {
    try {
      const { error } = await supabase
        .from('leaderboard')
        .insert([{ name: playerName, score: scoreVal }]);

      if (error) throw error;
    } catch(e) {
      console.error("Error saving score:", e);
    }
  }

  async function recordScore() {
    if (lbRecorded) return;
    lbRecorded = true;
    
    const finalName = playerName || 'Anonymous';
    
    // 1. Send score to cloud database
    await saveLB(finalName, score);
    
    // 2. Fetch fresh top 10 scores
    const list = await loadLB();
    
    // 3. Render updated list onto the screen
    renderLB(list, finalName, score);
  }

  function renderLB(list, myName = '', myScore = -1){
    const lbList = document.getElementById('lbList');
    lbList.innerHTML = '';
    
    if (!list.length){
      lbList.innerHTML = '<div class="lb-empty">no scores yet.</div>';
      return;
    }
    
    list.forEach((entry, i) => {
      const li = document.createElement('li');
      const isMe = lbRecorded && entry.name === myName && entry.score === myScore;
      li.className = 'lb-row' + (isMe ? ' me' : '');
      li.innerHTML = `
        <span class="lb-rank">${String(i+1).padStart(2,'0')}</span>
        <span class="lb-name">${escapeHtml(entry.name)}</span>
        <span class="lb-score">${entry.score}/19</span>
      `;
      lbList.appendChild(li);
    });
  }

  function escapeHtml(str){
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  document.getElementById('toLeaderboard').addEventListener('click', () => {
    recordScore();
    document.getElementById('leaderboard').scrollIntoView({ behavior:'smooth' });
  });

  const io3 = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) recordScore(); });
  }, { threshold: 0.4 });
  io3.observe(document.getElementById('leaderboard'));

  // Load cloud scores immediately when someone boots up the link
  loadLB().then(list => renderLB(list));
  
})();