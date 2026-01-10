
// ===== ELEMENTS =====
const onboarding = document.getElementById("onboarding");
const home = document.getElementById("home");
const groupPage = document.getElementById("groupPage");
const tasks = document.getElementById("tasks");
const profile = document.getElementById("profile");

const groupTitle = document.getElementById("groupTitle");
const groupForm = document.getElementById("groupForm");
const groupInput = document.getElementById("groupInput");
const groupList = document.getElementById("groupList");

const goalForm = document.getElementById("goalForm");
const goalInput = document.getElementById("goalInput");
const goalList = document.getElementById("goalList");

const homePercent = document.getElementById("homePercent");
const doneCount = document.getElementById("doneCount");
const failCount = document.getElementById("failCount");
const successPercent = document.getElementById("successPercent");
const profilePercent = document.getElementById("profilePercent");

const loginForm = document.getElementById("loginForm");
const app = document.querySelector(".app");
const loginContainer = document.querySelector(".container");

const historyPage = document.getElementById("history");
const historyList = document.getElementById("historyList");

 
const circleContainer = document.getElementById('circleContainer');
        const numBars = 50;
        let activeBars = 0;

        for (let i = 0; i < numBars; i++) {
            const bar = document.createElement('div');
            bar.className = 'bar';
            bar.style.transform = `rotate(${(360 / numBars) * i}deg) translateY(-170px)`;
            circleContainer.appendChild(bar);
        }

        function animateBars() {
            const bars = document.querySelectorAll('.bar');

            setInterval(() => {
                bars[activeBars % numBars].classList.add('active');

                if (activeBars > 8) {
                    bars[(activeBars - 8) % numBars].classList.remove('active');
                }

                activeBars++;
            }, 100);
        }

       
   
loginForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const emailInput = loginForm.querySelector("input[type='email']");
  const email = emailInput.value.trim();
  if (!email) return alert("Email wajib diisi");

  const name = email.split("@")[0];

  const user = {
    name: name,
    email: email,
    avatar: name.charAt(0).toUpperCase()
  };

  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("loggedIn", "true");

  loginContainer.style.display = "none";
  app.style.display = "block";

  loadUser();
  showHome();
});



function loadUser() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return;

  // HOME
  const usernameEl = document.getElementById("username");
  if (usernameEl) usernameEl.textContent = user.name;

  // PROFILE
  const nameInput = document.getElementById("profileName");
  const emailInput = document.getElementById("profileEmail");
  const avatarEl = document.getElementById("profileAvatar");

  if (nameInput) nameInput.value = user.name;
  if (emailInput) emailInput.value = user.email;
  if (avatarEl) avatarEl.textContent = user.avatar;
}

function saveProfile() {
  const nameInput = document.getElementById("profileName");
  const emailInput = document.getElementById("profileEmail");

  if (!nameInput) return alert("Input nama tidak ditemukan");

  const newName = nameInput.value.trim();
  if (newName === "") return alert("Nama tidak boleh kosong");

  // ambil user lama
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return alert("User tidak ditemukan");

  // update data
  user.name = newName;
  user.avatar = newName.charAt(0).toUpperCase();

  // SIMPAN
  localStorage.setItem("user", JSON.stringify(user));

  // UPDATE UI HOME
  const usernameEl = document.getElementById("username");
  if (usernameEl) usernameEl.textContent = user.name;

  // UPDATE AVATAR PROFILE
  const avatarEl = document.getElementById("profileAvatar");
  if (avatarEl) avatarEl.textContent = user.avatar;

  alert("✅ Profile berhasil disimpan!");
}



// ===== LOGOUT =====
function logout() {
  localStorage.removeItem("loggedIn");
  localStorage.removeItem("user");

  app.style.display = "none";
  loginContainer.style.display = "flex";

  hideAll();
}





// ===== STATE =====
let activeGroup = null;

// ===== WEEK KEY =====
function getWeekKey() {
  const now = new Date();
  const day = now.getDay() || 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - day + 1);
  return monday.toISOString().slice(0, 10);
}

const WEEK_KEY = getWeekKey();

const lastWeek = localStorage.getItem("lastWeekKey");
if (lastWeek && lastWeek !== WEEK_KEY) {
  generateWeeklyReport();
}
localStorage.setItem("lastWeekKey", WEEK_KEY);


// ===== DATA =====

// ===== HISTORY & REPORT DATA =====
let historyLogs = JSON.parse(localStorage.getItem("historyLogs")) || [];
let weeklyReports = JSON.parse(localStorage.getItem("weeklyReports")) || [];


let goals = JSON.parse(localStorage.getItem(WEEK_KEY)) || {
  College: [],
  Personal: [],
  Study: []
};
let weeklyGoals = JSON.parse(localStorage.getItem('weeklyGoals')) || [];

// ===== NAV =====
function hideAll() {
  onboarding.style.display = "none";
  home.style.display = "none";
  groupPage.style.display = "none";
  tasks.style.display = "none";
  profile.style.display = "none";
  historyPage.style.display = "none";
}

function goHome() {
  localStorage.setItem("onboarded", "true");
  showHome();
}

function showTasks() {
  hideAll();
  tasks.style.display = "block";
  renderWeeklyGoals();
  updateWeeklyStats();
}

function showProfile() {
  hideAll();
  profile.style.display = "block";
  updateProfileStats();
}

function showHome() {
  hideAll();
  home.style.display = "block";
  updateStats();
}

function showHistory() {
  hideAll();
  historyPage.style.display = "block";
  renderHistory();
}


function openGroup(group) {
  activeGroup = group;
  console.log("GROUP AKTIF:", activeGroup);
  hideAll();
  groupPage.style.display = "block";
  groupTitle.textContent = group + " Goals";
  if (!goals[group]) goals[group] = [];
  renderGroupGoals();
}

// ===== SAVE =====
function saveGoals() {
  localStorage.setItem(WEEK_KEY, JSON.stringify(goals));
  renderGroupGoals();
  updateStats();          // ✅ update task group + home
  updateProfileStats();   // ✅ update profile
}


function saveWeeklyGoals() {
  localStorage.setItem('weeklyGoals', JSON.stringify(weeklyGoals));
  renderWeeklyGoals();
  updateWeeklyStats();
}

function addHistory(text, type = "info") {
  const now = new Date();
  const log = {
    time: now.toLocaleString(),
    text,
    type
  };

  historyLogs.unshift(log);
  localStorage.setItem("historyLogs", JSON.stringify(historyLogs));
}

function generateWeeklyReport() {
  let done = 0;
  let failed = 0;

  Object.values(goals).forEach(group => {
    done += group.filter(g => g.status === "done").length;
    failed += group.filter(g => g.status === "failed").length;
  });

  const evaluated = done + failed;
  const percent = evaluated === 0 ? 0 : Math.round((done / evaluated) * 100);

  weeklyReports.push({
    week: WEEK_KEY,
    done,
    failed,
    percent,
    date: new Date().toLocaleDateString()
  });

  localStorage.setItem("weeklyReports", JSON.stringify(weeklyReports));
  addHistory(`Weekly report generated (${percent}%)`, "report");
}


function renderReports() {
  const list = document.getElementById("reportList");
  if (!list) return;

  list.innerHTML = "";
  weeklyReports.forEach(r => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${r.week}</strong>
      <p>Done: ${r.done} | Failed: ${r.failed}</p>
      <p>Success: ${r.percent}%</p>
    `;
    list.appendChild(li);
  });
}



// ===== ADD GOAL (Group) =====
groupForm.addEventListener("submit", function (e) {
  e.preventDefault();
  if (!activeGroup) {
    alert("Klik task group dulu!");
    return;
  }
  const text = groupInput.value.trim();
  if (!text) return;
  
  goals[activeGroup].push({ text, status: "pending" });
  addHistory(`Added goal "${text}" to ${activeGroup}`, "group");

  groupInput.value = "";
  saveGoals();
});

// ===== ADD GOAL (Weekly) =====
goalForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const text = goalInput.value.trim();
  if (!text) return;

  weeklyGoals.push({ text, status: "pending" });
  goalInput.value = "";

  weeklyGoals.push({ text, status: "pending" });
addHistory(`Added weekly goal "${text}"`, "weekly");

  
  saveWeeklyGoals();
});




// ===== RENDER GOALS (Group) =====
function renderGroupGoals() {
  groupList.innerHTML = "";
  goals[activeGroup].forEach((goal, index) => {
    const li = document.createElement("li");
    li.className = "goal-item";
    if (goal.status === "done") li.style.opacity = "0.6";
    if (goal.status === "failed") li.style.textDecoration = "line-through";
    li.innerHTML = `
      <span>${goal.text}</span>
      <div class="goal-actions">
        <button onclick="markDone(${index})">✅</button>
        <button onclick="markFailed(${index})">❌</button>
        <button onclick="removeGoal(${index})">🗑</button>
      </div>
    `;
    groupList.appendChild(li);
  });
}

// ===== RENDER GOALS (Weekly) =====
function renderWeeklyGoals() {
  goalList.innerHTML = "";
  weeklyGoals.forEach((goal, index) => {
    const li = document.createElement("li");
    li.className = "goal-item";
    if (goal.status === "done") li.style.opacity = "0.6";
    if (goal.status === "failed") li.style.textDecoration = "line-through";
    li.innerHTML = `
      <span>${goal.text}</span>
      <div class="goal-actions">
        <button onclick="markWeeklyDone(${index})">✅</button>
        <button onclick="markWeeklyFailed(${index})">❌</button>
        <button onclick="removeWeeklyGoal(${index})">🗑</button>
      </div>
    `;
    goalList.appendChild(li);
  });
}

// ===== ACTIONS (Group) =====
function markDone(index) {
  goals[activeGroup][index].status = "done";
  saveGoals();
}

function markFailed(index) {
  goals[activeGroup][index].status = "failed";
  saveGoals();
}

function removeGoal(index) {
  goals[activeGroup].splice(index, 1);
  saveGoals();
}

// ===== ACTIONS (Weekly) =====
function markWeeklyDone(index) {
  weeklyGoals[index].status = "done";
  saveWeeklyGoals();
}

function markWeeklyFailed(index) {
  weeklyGoals[index].status = "failed";
  saveWeeklyGoals();
}

function removeWeeklyGoal(index) {
  weeklyGoals.splice(index, 1);
  saveWeeklyGoals();
}


// ===== STATS (Group) =====
function updateStats() {
  let totalDone = 0;
  let totalEvaluated = 0;

  Object.keys(goals).forEach(group => {
    const list = goals[group];

    const done = list.filter(g => g.status === "done").length;
    const failed = list.filter(g => g.status === "failed").length;

    const evaluated = done + failed;
    const percent =
      evaluated === 0 ? 0 : Math.round((done / evaluated) * 100);

    const el = document.getElementById(`percent-${group}`);
    if (el) el.textContent = percent + "%";

    totalDone += done;
    totalEvaluated += evaluated;
  });

  const overall =
    totalEvaluated === 0
      ? 0
      : Math.round((totalDone / totalEvaluated) * 100);

  homePercent.textContent = overall + "%";
}


// ===== STATS (Weekly) =====
function updateWeeklyStats() {
  const done = weeklyGoals.filter(g => g.status === "done").length;
  const failed = weeklyGoals.filter(g => g.status === "failed").length;
  const evaluated = done + failed;
  const percent = evaluated === 0 ? 0 : Math.round((done / evaluated) * 100);
  doneCount.textContent = done;
  failCount.textContent = failed;
  successPercent.textContent = percent + "%";
}




// ===== STATS (Profile) =====
function updateProfileStats() {
  let totalDone = 0;
  let totalEvaluated = 0;

  Object.keys(goals).forEach(group => {
    const list = goals[group];
    totalDone += list.filter(g => g.status === "done").length;
    totalEvaluated += list.filter(
      g => g.status === "done" || g.status === "failed"
    ).length;
  });

  // optional: include weekly goals
  totalDone += weeklyGoals.filter(g => g.status === "done").length;
  totalEvaluated += weeklyGoals.filter(
    g => g.status === "done" || g.status === "failed"
  ).length;

  const percent =
    totalEvaluated === 0 ? 0 : Math.round((totalDone / totalEvaluated) * 100);

  profilePercent.textContent = percent + "%";
}


function renderHistory() {
  const list = document.getElementById("historyList");
  if (!list) return;

  list.innerHTML = "";
  historyLogs.forEach(log => {
    const li = document.createElement("li");
    li.innerHTML = `
      <small>${log.time}</small>
      <p>${log.text}</p>
    `;
    list.appendChild(li);
  });
}


function filterHistory(type) {
  document.querySelectorAll(".history-filter button")
    .forEach(btn => btn.classList.remove("active"));

  event.target.classList.add("active");

  const list = document.getElementById("historyList");
  list.innerHTML = "";

  const filtered =
    type === "all"
      ? historyLogs
      : historyLogs.filter(log => log.type === type);

  if (filtered.length === 0) {
    list.innerHTML = "<li><em>No history found</em></li>";
    return;
  }

  filtered.forEach(log => {
    const li = document.createElement("li");
    li.innerHTML = `
      <small>${log.time}</small>
      <p>${log.text}</p>
    `;
    list.appendChild(li);
  });
}




function clearHistory() {
  if (!confirm("Clear all history?")) return;

  historyLogs = [];
  localStorage.removeItem("historyLogs");

  renderHistory();
}


// ===== INIT =====
const isLoggedIn = localStorage.getItem("loggedIn");
const savedUser = localStorage.getItem("user");

if (isLoggedIn && savedUser) {
  loginContainer.style.display = "none";
  app.style.display = "block";
  loadUser();
  showHome();
} else {
  hideAll();
  onboarding.style.display = "block";
}



Object.keys(goals).forEach(group => {
  if (!goals[group]) goals[group] = [];
});
updateStats();
updateWeeklyStats();
updateProfileStats();
animateBars();
renderHistory();
=======
// ===== ELEMENTS =====
const onboarding = document.getElementById("onboarding");
const home = document.getElementById("home");
const groupPage = document.getElementById("groupPage");
const tasks = document.getElementById("tasks");
const profile = document.getElementById("profile");

const groupTitle = document.getElementById("groupTitle");
const groupForm = document.getElementById("groupForm");
const groupInput = document.getElementById("groupInput");
const groupList = document.getElementById("groupList");

const goalForm = document.getElementById("goalForm");
const goalInput = document.getElementById("goalInput");
const goalList = document.getElementById("goalList");

const homePercent = document.getElementById("homePercent");
const doneCount = document.getElementById("doneCount");
const failCount = document.getElementById("failCount");
const successPercent = document.getElementById("successPercent");
const profilePercent = document.getElementById("profilePercent");

const loginForm = document.getElementById("loginForm");
const app = document.querySelector(".app");
const loginContainer = document.querySelector(".container");

 
const circleContainer = document.getElementById('circleContainer');
        const numBars = 50;
        let activeBars = 0;

        for (let i = 0; i < numBars; i++) {
            const bar = document.createElement('div');
            bar.className = 'bar';
            bar.style.transform = `rotate(${(360 / numBars) * i}deg) translateY(-170px)`;
            circleContainer.appendChild(bar);
        }

        function animateBars() {
            const bars = document.querySelectorAll('.bar');

            setInterval(() => {
                bars[activeBars % numBars].classList.add('active');

                if (activeBars > 8) {
                    bars[(activeBars - 8) % numBars].classList.remove('active');
                }

                activeBars++;
            }, 100);
        }

       
   
loginForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const emailInput = loginForm.querySelector("input[type='email']");
  const email = emailInput.value.trim();
  if (!email) return alert("Email wajib diisi");

  const name = email.split("@")[0];

  const user = {
    name: name,
    email: email,
    avatar: name.charAt(0).toUpperCase()
  };

  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("loggedIn", "true");

  loginContainer.style.display = "none";
  app.style.display = "block";

  loadUser();
  showHome();
});



function loadUser() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return;

  // HOME
  const usernameEl = document.getElementById("username");
  if (usernameEl) usernameEl.textContent = user.name;

  // PROFILE
  const nameInput = document.getElementById("profileName");
  const emailInput = document.getElementById("profileEmail");
  const avatarEl = document.getElementById("profileAvatar");

  if (nameInput) nameInput.value = user.name;
  if (emailInput) emailInput.value = user.email;
  if (avatarEl) avatarEl.textContent = user.avatar;
}

function saveProfile() {
  const nameInput = document.getElementById("profileName");
  const emailInput = document.getElementById("profileEmail");

  if (!nameInput) return alert("Input nama tidak ditemukan");

  const newName = nameInput.value.trim();
  if (newName === "") return alert("Nama tidak boleh kosong");

  // ambil user lama
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return alert("User tidak ditemukan");

  // update data
  user.name = newName;
  user.avatar = newName.charAt(0).toUpperCase();

  // SIMPAN
  localStorage.setItem("user", JSON.stringify(user));

  // UPDATE UI HOME
  const usernameEl = document.getElementById("username");
  if (usernameEl) usernameEl.textContent = user.name;

  // UPDATE AVATAR PROFILE
  const avatarEl = document.getElementById("profileAvatar");
  if (avatarEl) avatarEl.textContent = user.avatar;

  alert("✅ Profile berhasil disimpan!");
}



// ===== LOGOUT =====
function logout() {
  localStorage.removeItem("loggedIn");
  localStorage.removeItem("user");

  app.style.display = "none";
  loginContainer.style.display = "flex";

  hideAll();
}





// ===== STATE =====
let activeGroup = null;

// ===== WEEK KEY =====
function getWeekKey() {
  const now = new Date();
  const day = now.getDay() || 7; // Minggu = 7
  const monday = new Date(now);
  monday.setDate(now.getDate() - day + 1);
  return monday.toISOString().slice(0, 10);
}

const WEEK_KEY = getWeekKey();

// ===== DATA =====
let goals = JSON.parse(localStorage.getItem(WEEK_KEY)) || {
  Office: [],
  Personal: [],
  Study: []
};
let weeklyGoals = JSON.parse(localStorage.getItem('weeklyGoals')) || [];

// ===== NAV =====
function hideAll() {
  onboarding.style.display = "none";
  home.style.display = "none";
  groupPage.style.display = "none";
  tasks.style.display = "none";
  profile.style.display = "none";
}

function goHome() {
  localStorage.setItem("onboarded", "true");
  showHome();
}

function showTasks() {
  hideAll();
  tasks.style.display = "block";
  renderWeeklyGoals();
  updateWeeklyStats();
}

function showProfile() {
  hideAll();
  profile.style.display = "block";
  updateProfileStats();
}

function showHome() {
  hideAll();
  home.style.display = "block";
  updateStats();
}

function openGroup(group) {
  activeGroup = group;
  console.log("GROUP AKTIF:", activeGroup);
  hideAll();
  groupPage.style.display = "block";
  groupTitle.textContent = group + " Goals";
  if (!goals[group]) goals[group] = [];
  renderGroupGoals();
}

// ===== SAVE =====
function saveGoals() {
  localStorage.setItem(WEEK_KEY, JSON.stringify(goals));
  renderGroupGoals();
  updateStats();          // ✅ update task group + home
  updateProfileStats();   // ✅ update profile
}


function saveWeeklyGoals() {
  localStorage.setItem('weeklyGoals', JSON.stringify(weeklyGoals));
  renderWeeklyGoals();
  updateWeeklyStats();
}

// ===== ADD GOAL (Group) =====
groupForm.addEventListener("submit", function (e) {
  e.preventDefault();
  if (!activeGroup) {
    alert("Klik task group dulu!");
    return;
  }
  const text = groupInput.value.trim();
  if (!text) return;
  goals[activeGroup].push({ text, status: "pending" });
  groupInput.value = "";
  saveGoals();
});

// ===== ADD GOAL (Weekly) =====
goalForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const text = goalInput.value.trim();
  if (!text) return;
  weeklyGoals.push({ text, status: "pending" });
  goalInput.value = "";
  saveWeeklyGoals();
});

// ===== RENDER GOALS (Group) =====
function renderGroupGoals() {
  groupList.innerHTML = "";
  goals[activeGroup].forEach((goal, index) => {
    const li = document.createElement("li");
    li.className = "goal-item";
    if (goal.status === "done") li.style.opacity = "0.6";
    if (goal.status === "failed") li.style.textDecoration = "line-through";
    li.innerHTML = `
      <span>${goal.text}</span>
      <div class="goal-actions">
        <button onclick="markDone(${index})">✅</button>
        <button onclick="markFailed(${index})">❌</button>
        <button onclick="removeGoal(${index})">🗑</button>
      </div>
    `;
    groupList.appendChild(li);
  });
}

// ===== RENDER GOALS (Weekly) =====
function renderWeeklyGoals() {
  goalList.innerHTML = "";
  weeklyGoals.forEach((goal, index) => {
    const li = document.createElement("li");
    li.className = "goal-item";
    if (goal.status === "done") li.style.opacity = "0.6";
    if (goal.status === "failed") li.style.textDecoration = "line-through";
    li.innerHTML = `
      <span>${goal.text}</span>
      <div class="goal-actions">
        <button onclick="markWeeklyDone(${index})">✅</button>
        <button onclick="markWeeklyFailed(${index})">❌</button>
        <button onclick="removeWeeklyGoal(${index})">🗑</button>
      </div>
    `;
    goalList.appendChild(li);
  });
}

// ===== ACTIONS (Group) =====
function markDone(index) {
  goals[activeGroup][index].status = "done";
  saveGoals();
}

function markFailed(index) {
  goals[activeGroup][index].status = "failed";
  saveGoals();
}

function removeGoal(index) {
  goals[activeGroup].splice(index, 1);
  saveGoals();
}

// ===== ACTIONS (Weekly) =====
function markWeeklyDone(index) {
  weeklyGoals[index].status = "done";
  saveWeeklyGoals();
}

function markWeeklyFailed(index) {
  weeklyGoals[index].status = "failed";
  saveWeeklyGoals();
}

function removeWeeklyGoal(index) {
  weeklyGoals.splice(index, 1);
  saveWeeklyGoals();
}

// ===== STATS (Group) =====
function updateStats() {
  let totalDone = 0;
  let totalEvaluated = 0;

  Object.keys(goals).forEach(group => {
    const list = goals[group];

    const done = list.filter(g => g.status === "done").length;
    const failed = list.filter(g => g.status === "failed").length;

    const evaluated = done + failed;
    const percent =
      evaluated === 0 ? 0 : Math.round((done / evaluated) * 100);

    const el = document.getElementById(`percent-${group}`);
    if (el) el.textContent = percent + "%";

    totalDone += done;
    totalEvaluated += evaluated;
  });

  const overall =
    totalEvaluated === 0
      ? 0
      : Math.round((totalDone / totalEvaluated) * 100);

  homePercent.textContent = overall + "%";
}


// ===== STATS (Weekly) =====
function updateWeeklyStats() {
  const done = weeklyGoals.filter(g => g.status === "done").length;
  const failed = weeklyGoals.filter(g => g.status === "failed").length;
  const evaluated = done + failed;
  const percent = evaluated === 0 ? 0 : Math.round((done / evaluated) * 100);
  doneCount.textContent = done;
  failCount.textContent = failed;
  successPercent.textContent = percent + "%";
}




// ===== STATS (Profile) =====
function updateProfileStats() {
  let totalDone = 0;
  let totalEvaluated = 0;

  Object.keys(goals).forEach(group => {
    const list = goals[group];
    totalDone += list.filter(g => g.status === "done").length;
    totalEvaluated += list.filter(
      g => g.status === "done" || g.status === "failed"
    ).length;
  });

  // optional: include weekly goals
  totalDone += weeklyGoals.filter(g => g.status === "done").length;
  totalEvaluated += weeklyGoals.filter(
    g => g.status === "done" || g.status === "failed"
  ).length;

  const percent =
    totalEvaluated === 0 ? 0 : Math.round((totalDone / totalEvaluated) * 100);

  profilePercent.textContent = percent + "%";
}

// ===== INIT =====
const isLoggedIn = localStorage.getItem("loggedIn");
const savedUser = localStorage.getItem("user");

if (isLoggedIn && savedUser) {
  loginContainer.style.display = "none";
  app.style.display = "block";
  loadUser();
  showHome();
} else {
  hideAll();
  onboarding.style.display = "block";
}



Object.keys(goals).forEach(group => {
  if (!goals[group]) goals[group] = [];
});
updateStats();
updateWeeklyStats();
updateProfileStats();
animateBars();
