
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

const layer = $("#windowLayer");
const toast = $("#toast");

let windowCount = 0;
let activeWindows = [];
let calendarDate = new Date();
let savedNotes = JSON.parse(localStorage.getItem("mellupi-notes") || "[]");
let diaryEntries = JSON.parse(localStorage.getItem("mellupi-diary") || "[]");
let wishes = JSON.parse(localStorage.getItem("mellupi-wishes") || "[]");
let completedTasks = JSON.parse(localStorage.getItem("mellupi-tasks") || "[]");

const pages = {
  garden: {
    title: "taman kecil ♡",
    icon: "🌷",
    render: () => `
      <h1>selamat datang di taman kecil</h1>
      <p>tidak semua hal harus tumbuh dengan cepat. beberapa bunga membutuhkan waktu, hujan, dan sedikit kesabaran. begitu pula manusia.</p>
      <div class="app-grid">
        <div class="app-card"><span>🌷</span><b>kelembutan</b><small>menjadi baik kepada diri sendiri</small></div>
        <div class="app-card"><span>🌱</span><b>pertumbuhan</b><small>sedikit demi sedikit</small></div>
        <div class="app-card"><span>🌼</span><b>kebahagiaan</b><small>menemukan hal kecil yang indah</small></div>
        <div class="app-card"><span>🪻</span><b>ketenangan</b><small>beristirahat tanpa rasa bersalah</small></div>
      </div>
      <div class="paper"><h2>pesan dari taman</h2><p id="gardenQuote">anda tidak harus mekar setiap hari untuk tetap berharga. ♡</p><button onclick="gardenMessage()">pesan lainnya ✿</button></div>
    `
  },

  letter: {
    title: "surat untuk anda 💌",
    icon: "💌",
    render: () => `
      <h1>sebuah surat kecil</h1>
      <div class="paper">
        <p>kepada seseorang yang sedang menjalani harinya,</p>
        <p>barangkali hari ini tidak sepenuhnya berjalan sesuai keinginan. barangkali ada hal yang belum selesai, perkataan yang masih teringat, atau perasaan yang belum menemukan nama.</p>
        <p>meskipun demikian, anda tetap boleh beristirahat. anda tetap boleh memulai kembali. tidak ada kewajiban untuk memahami seluruh kehidupan dalam satu malam.</p>
        <p>semoga anda menemukan alasan kecil untuk tersenyum, seseorang yang bersedia mendengarkan, serta keberanian untuk melanjutkan langkah dengan cara anda sendiri.</p>
        <p>dengan hangat,<br><i>seseorang yang berharap anda baik-baik saja.</i> ♡</p>
      </div>
      <button onclick="openPage('notes')">tulis balasan untuk diri sendiri ✎</button>
    `
  },

  music: {
    title: "ruang musik ♫",
    icon: "♫",
    render: () => `
      <h1>soundtrack hari ini</h1>
      <p>pilih suasana yang ingin menemani anda. tombol berikut menghasilkan rekomendasi suasana, bukan memutar audio secara otomatis.</p>
      <div class="app-grid">
        <div class="app-card" onclick="musicMood('tenang')"><span>☁️</span><b>tenang</b><small>piano lembut · hujan</small></div>
        <div class="app-card" onclick="musicMood('ceria')"><span>🍓</span><b>ceria</b><small>indie pop · musim semi</small></div>
        <div class="app-card" onclick="musicMood('sendu')"><span>🌧️</span><b>sendu</b><small>slow songs · malam</small></div>
        <div class="app-card" onclick="musicMood('berani')"><span>🦋</span><b>berani</b><small>lagu untuk memulai lagi</small></div>
      </div>
      <div class="paper" id="musicResult">pilih suasana untuk menemukan teman bagi perasaan anda. ♡</div>
      <button onclick="openPage('wishes')">putar harapan baik ♡</button>
    `
  },

  profile: {
    title: "profil mungil ☻",
    icon: "☻",
    render: () => `
      <h1>ruang milik anda</h1>
      <span class="big-emoji">🧸</span>
      <div class="paper">
        <p><b>nama panggilan</b></p>
        <input id="nickname" placeholder="nama yang ingin digunakan..." value="${escapeHTML(localStorage.getItem("mellupi-name") || "")}">
        <p><b>tentang diri anda</b></p>
        <textarea id="bio" placeholder="hal-hal kecil yang membuat anda menjadi diri sendiri...">${escapeHTML(localStorage.getItem("mellupi-bio") || "")}</textarea>
        <button onclick="saveProfile()">simpan identitas ♡</button>
      </div>
      <p>ruang ini tidak perlu sempurna. jadikan ia milik anda.</p>
    `
  },

  calendar: {
    title: "kalender kenangan",
    icon: "▦",
    render: () => `
      <h1>hari-hari yang berharga</h1>
      <p>setiap tanggal memiliki kesempatan untuk menjadi kenangan yang baik.</p>
      <div class="paper"><label>pilih tanggal</label><input id="memoryDate" type="date"><label>apa yang ingin diingat?</label><textarea id="memoryText" placeholder="hari ini saya ingin mengingat..."></textarea><button onclick="saveMemory()">simpan kenangan ♡</button></div>
      <div id="memoryList">${renderMemories()}</div>
    `
  },

  memories: {
    title: "album kenangan ▧",
    icon: "▧",
    render: () => `
      <h1>hal-hal yang ingin disimpan</h1>
      <p>kenangan tidak harus berupa peristiwa besar. secangkir minuman hangat, percakapan sederhana, atau perjalanan pulang pun dapat berarti.</p>
      <div class="app-grid">
        <div class="app-card"><span>🌸</span><b>hari yang indah</b><small>hal baik yang pernah terjadi</small></div>
        <div class="app-card"><span>☀️</span><b>matahari pagi</b><small>kesempatan untuk memulai</small></div>
        <div class="app-card"><span>🌙</span><b>malam tenang</b><small>waktu untuk berhenti sejenak</small></div>
        <div class="app-card"><span>🫧</span><b>momen sederhana</b><small>kebahagiaan yang tidak direncanakan</small></div>
      </div>
      <div class="paper"><h2>arsip pribadi</h2><p>jumlah kenangan tersimpan: ${getMemories().length}</p><button onclick="openPage('calendar')">buka catatan kenangan</button></div>
    `
  },

  archive: {
    title: "arsip kecil ▣",
    icon: "▣",
    render: () => `
      <h1>semua yang pernah disimpan</h1>
      <p>tempat menyimpan hal-hal yang tidak ingin terlupakan.</p>
      <div class="app-grid">
        <div class="app-card" onclick="openPage('calendar')"><span>🌷</span><b>kenangan</b><small>${getMemories().length} catatan</small></div>
        <div class="app-card" onclick="openPage('notes')"><span>📒</span><b>catatan</b><small>${savedNotes.length} tulisan</small></div>
        <div class="app-card" onclick="openPage('diary')"><span>📔</span><b>buku harian</b><small>${diaryEntries.length} halaman</small></div>
        <div class="app-card" onclick="openPage('wishes')"><span>💌</span><b>harapan</b><small>${wishes.length} harapan</small></div>
      </div>
    `
  },

  notes: {
    title: "catatan kecil ✎",
    icon: "✎",
    render: () => `
      <h1>ruang untuk menulis</h1>
      <p>tuliskan gagasan, hal yang perlu diingat, atau sesuatu yang belum sempat disampaikan.</p>
      <div class="paper">
        <input id="noteTitle" placeholder="judul catatan...">
        <textarea id="noteBody" placeholder="tuliskan apa saja di sini..."></textarea>
        <button onclick="saveNote()">simpan catatan ♡</button>
      </div>
      <div id="notesList">${renderNotes()}</div>
    `
  },

  school: {
    title: "ruang belajar 📚",
    icon: "📚",
    render: () => `
      <h1>belajar dengan lembut</h1>
      <p>anda tidak perlu memahami semuanya sekaligus. pilih satu hal, kemudian kerjakan dengan tenang.</p>
      <div class="paper">
        <h2>daftar kegiatan belajar</h2>
        <div id="taskList">${renderTasks()}</div>
        <input id="taskInput" placeholder="tambahkan kegiatan belajar...">
        <button onclick="addTask()">tambah kegiatan +</button>
        <p>kegiatan selesai: ${completedTasks.filter(t=>t.done).length} dari ${completedTasks.length}</p>
      </div>
    `
  },

  desktop: {
    title: "teman kecil 🧸",
    icon: "🧸",
    render: () => `
      <h1>halo, teman kecil!</h1>
      <span class="big-emoji" id="petFace">🧸</span>
      <div class="paper" style="text-align:center">
        <h2 id="petMood">saya siap menemani anda ♡</h2>
        <p id="petText">apa yang ingin anda lakukan hari ini?</p>
        <button onclick="petAction('hug')">peluk virtual ♡</button>
        <button onclick="petAction('play')">bermain ✿</button>
        <button onclick="petAction('rest')">beristirahat ☁</button>
        <button onclick="petAction('snack')">makan camilan 🍓</button>
      </div>
    `
  },

  wishes: {
    title: "kotak harapan 💌",
    icon: "💌",
    render: () => `
      <h1>harapan yang dititipkan</h1>
      <p>tidak semua harapan harus segera terwujud. beberapa cukup disimpan agar kita tidak lupa arah yang ingin dituju.</p>
      <div class="paper">
        <textarea id="wishInput" placeholder="saya berharap suatu hari nanti..."></textarea>
        <button onclick="saveWish()">titipkan harapan ♡</button>
      </div>
      <div id="wishesList">${renderWishes()}</div>
    `
  },

  diary: {
    title: "buku harian 📔",
    icon: "📔",
    render: () => `
      <h1>halaman hari ini</h1>
      <p>tidak perlu merangkai kata yang sempurna. cukup tuliskan apa yang benar-benar anda rasakan.</p>
      <div class="paper">
        <label>tanggal</label>
        <input type="date" id="diaryDate">
        <label>bagaimana hari anda?</label>
        <select id="diaryMood">
          <option>🌷 tenang</option>
          <option>☀️ bahagia</option>
          <option>☁️ lelah</option>
          <option>🌧️ sedih</option>
          <option>🦋 bersemangat</option>
          <option>🫧 belum tahu</option>
        </select>
        <label>cerita hari ini</label>
        <textarea id="diaryText" placeholder="hari ini saya..."></textarea>
        <button onclick="saveDiary()">simpan halaman ♡</button>
      </div>
      <div id="diaryList">${renderDiary()}</div>
    `
  },

  love: {
    title: "hal-hal baik ♡",
    icon: "♡",
    render: () => `
      <h1>hal baik tentang kehidupan</h1>
      <p>sebuah pengingat kecil: dunia masih menyimpan banyak hal yang pantas untuk dinantikan.</p>
      <div class="paper">
        <span class="big-emoji" id="goodEmoji">🌷</span>
        <p id="goodText" style="text-align:center">anda tidak harus produktif setiap saat untuk menjadi seseorang yang berharga.</p>
        <div style="text-align:center"><button onclick="goodThing()">hal baik lainnya ✿</button></div>
      </div>
      <h2>daftar hal kecil yang menyenangkan</h2>
      <div class="app-grid">
        <div class="app-card"><span>🍓</span><b>makanan kesukaan</b></div>
        <div class="app-card"><span>🌤️</span><b>udara pagi</b></div>
        <div class="app-card"><span>🐈</span><b>melihat kucing</b></div>
        <div class="app-card"><span>🛏️</span><b>tidur nyenyak</b></div>
        <div class="app-card"><span>🎧</span><b>mendengar lagu</b></div>
        <div class="app-card"><span>💌</span><b>menerima kabar baik</b></div>
      </div>
    `
  },

  selfcare: {
    title: "merawat diri ☁",
    icon: "☁",
    render: () => `
      <h1>periksa keadaan diri</h1>
      <p>berhenti sebentar bukan berarti menyerah. terkadang, itu adalah cara terbaik untuk melanjutkan perjalanan.</p>
      <div class="paper">
        <h2>apa yang anda butuhkan sekarang?</h2>
        <div id="careList">
          ${["minum air putih","meregangkan tubuh","beristirahat sejenak","merapikan satu sudut meja","mendengarkan lagu kesukaan","berbicara dengan orang tepercaya"].map((x,i)=>`<label><input type="checkbox" class="care-check" style="width:auto;margin-right:8px" data-index="${i}">${x}</label>`).join("")}
        </div>
        <button onclick="careDone()">selesai memeriksa ♡</button>
      </div>
      <div class="paper"><h2>catatan lembut</h2><p>jangan mengukur nilai diri hanya dari banyaknya hal yang berhasil diselesaikan. kebutuhan anda juga layak diperhatikan.</p></div>
    `
  },

  settings: {
    title: "pengaturan ⚙",
    icon: "⚙",
    render: () => `
      <h1>atur dunia kecil anda</h1>
      <p>sesuaikan beberapa hal agar ruang ini terasa semakin dekat dengan selera anda.</p>
      <div class="paper">
        <h2>warna suasana</h2>
        <button onclick="setTheme('rose')">🌷 rose garden</button>
        <button onclick="setTheme('sage')">🌿 sage garden</button>
        <button onclick="setTheme('cream')">🧸 vanilla cream</button>
        <button onclick="setTheme('lavender')">🪻 lavender dream</button>
      </div>
      <div class="paper">
        <h2>gerakan</h2>
        <button onclick="togglePetals()">ubah hujan kelopak ✿</button>
        <button onclick="closeAllWindows()">tutup semua jendela</button>
      </div>
      <div class="paper">
        <h2>data lokal</h2>
        <p>catatan dan harapan disimpan pada penyimpanan lokal peramban ini.</p>
        <button onclick="exportData()">ekspor data pribadi ↓</button>
        <button onclick="resetData()">hapus seluruh data tersimpan</button>
      </div>
    `
  },

  home: {
    title: "beranda mellupi ⌂",
    icon: "⌂",
    render: () => `
      <h1>selamat datang kembali ♡</h1>
      <span class="big-emoji">🌷</span>
      <div class="paper">
        <h2>sebuah ruang kecil untuk bernapas</h2>
        <p>dunia ini dibuat untuk menemani hari-hari anda: menyimpan kenangan, merapikan pikiran, menulis harapan, dan menemukan sedikit ketenangan di antara kesibukan.</p>
        <p>silakan menjelajahi setiap sudutnya. setiap ikon membuka jendela tersendiri sehingga anda dapat menyimpan beberapa ruang sekaligus.</p>
      </div>
      <div class="app-grid">
        ${Object.entries(pages).filter(([k])=>k!=="home").map(([k,v])=>`<div class="app-card" onclick="openPage('${k}')"><span>${v.icon}</span><b>${v.title}</b><small>buka ruang ini ↗</small></div>`).join("")}
      </div>
    `
  }
};

function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  })[c]);
}

function openPage(key) {
  const page = pages[key];
  if (!page) return;

  windowCount++;
  const id = `window-${windowCount}`;

  const win = document.createElement("section");
  win.className = "app-window";
  win.id = id;
  win.style.zIndex = 45 + windowCount;
  win.style.left = `${50 + ((windowCount % 5) - 2) * 2}%`;
  win.innerHTML = `
    <div class="window-top">
      <button class="window-dot dot-red" title="tutup" onclick="closeWindow('${id}')"></button>
      <button class="window-dot dot-yellow" title="sembunyikan" onclick="minimizeWindow('${id}')"></button>
      <button class="window-dot dot-green" title="kembali ke beranda" onclick="openPage('home')"></button>
      <span class="window-title">${page.title}</span>
    </div>
    <div class="window-content">${page.render()}</div>
  `;

  layer.appendChild(win);
  activeWindows.push(id);

  win.addEventListener("pointerdown", () => {
    $$(".app-window", layer).forEach(w => w.style.zIndex = 45);
    win.style.zIndex = 80 + windowCount;
  });

  if (key === "diary") $("#diaryDate", win).value = today();
  if (key === "calendar") $("#memoryDate", win).value = today();

  toastMessage(`${page.icon} ruang baru telah dibuka ♡`);
}

function closeWindow(id) {
  const win = document.getElementById(id);
  if (!win) return;
  win.style.animation = "windowIn .2s reverse both";
  setTimeout(() => win.remove(), 180);
  activeWindows = activeWindows.filter(x => x !== id);
}

function minimizeWindow(id) {
  const win = document.getElementById(id);
  if (win) win.classList.toggle("minimized");
}

function closeAllWindows() {
  $$(".app-window", layer).forEach(w => w.remove());
  activeWindows = [];
  toastMessage("semua jendela telah dirapikan ♡");
}

$$("[data-page]").forEach(button => {
  button.addEventListener("click", () => {
    const key = button.dataset.page;
    if (key === "home") {
      openPage("home");
      return;
    }
    openPage(key);
  });
});

function toastMessage(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function updateClock() {
  const d = new Date();
  $("#clock").textContent = d.toLocaleTimeString("id-ID", {
    hour: "2-digit", minute: "2-digit"
  });
  $("#bigDay").textContent = d.getDate();
  $("#bigMonth").textContent = d.toLocaleDateString("id-ID",{month:"long"}).toUpperCase();
  $("#bigYear").textContent = d.getFullYear();
}
updateClock();
setInterval(updateClock, 1000);

function renderCalendar() {
  const y = calendarDate.getFullYear();
  const m = calendarDate.getMonth();

  $("#monthName").textContent = calendarDate.toLocaleDateString("id-ID",{
    month:"long",year:"numeric"
  });

  const first = new Date(y,m,1).getDay();
  const offset = (first + 6) % 7;
  const days = new Date(y,m+1,0).getDate();
  const now = new Date();

  let html = "";
  for(let i=0;i<offset;i++) html += `<span class="empty"></span>`;

  for(let d=1;d<=days;d++){
    const isToday = d===now.getDate() && m===now.getMonth() && y===now.getFullYear();
    html += `<span class="${isToday?'today':''}" title="buka kalender" onclick="openPage('calendar')">${d}</span>`;
  }

  $("#calendarGrid").innerHTML = html;
}
renderCalendar();

$("#prevMonth").addEventListener("click", e => {
  e.stopPropagation();
  calendarDate.setMonth(calendarDate.getMonth()-1);
  renderCalendar();
});

$("#nextMonth").addEventListener("click", e => {
  e.stopPropagation();
  calendarDate.setMonth(calendarDate.getMonth()+1);
  renderCalendar();
});

const gardenMessages = [
  "anda tidak harus mekar setiap hari untuk tetap berharga. ♡",
  "pertumbuhan yang tenang tetaplah pertumbuhan.",
  "semoga hati anda menemukan tempat untuk beristirahat.",
  "tidak apa-apa berjalan perlahan selama anda tetap merawat diri.",
  "ada banyak hal baik yang belum sempat anda temui."
];

function gardenMessage() {
  $("#gardenQuote").textContent = gardenMessages[Math.floor(Math.random()*gardenMessages.length)];
}

const musicMoods = {
  tenang: "rekomendasi suasana: piano lembut, suara hujan, dan instrumental yang membantu anda memperlambat hari.",
  ceria: "rekomendasi suasana: indie pop ringan, gitar akustik, dan melodi cerah untuk menemani kegiatan kecil.",
  sendu: "rekomendasi suasana: slow songs yang memberi ruang bagi perasaan tanpa memaksa anda segera merasa baik.",
  berani: "rekomendasi suasana: lagu penuh semangat yang mengingatkan anda bahwa permulaan baru selalu mungkin."
};

function musicMood(mood) {
  $("#musicResult").textContent = musicMoods[mood];
}

function saveProfile() {
  localStorage.setItem("mellupi-name", $("#nickname").value.trim());
  localStorage.setItem("mellupi-bio", $("#bio").value.trim());
  toastMessage("identitas kecil berhasil disimpan ♡");
}

function getMemories() {
  return JSON.parse(localStorage.getItem("mellupi-memories") || "[]");
}

function saveMemory() {
  const date = $("#memoryDate").value;
  const text = $("#memoryText").value.trim();
  if (!date || !text) return toastMessage("tanggal dan cerita perlu diisi dahulu ♡");

  const items = getMemories();
  items.unshift({date,text});
  localStorage.setItem("mellupi-memories",JSON.stringify(items));
  $("#memoryText").value = "";
  $("#memoryList").innerHTML = renderMemories();
  toastMessage("kenangan kecil telah disimpan ✿");
}

function renderMemories() {
  return getMemories().map((x,i)=>`
    <div class="paper">
      <small>${escapeHTML(x.date)}</small>
      <p>${escapeHTML(x.text)}</p>
      <button onclick="deleteMemory(${i})">hapus</button>
    </div>
  `).join("") || "<p>belum ada kenangan tersimpan. jadikan hari ini awal yang baik. ♡</p>";
}

function deleteMemory(i) {
  const items = getMemories();
  items.splice(i,1);
  localStorage.setItem("mellupi-memories",JSON.stringify(items));
  refreshPageContent("calendar","memoryList",renderMemories());
}

function saveNote() {
  const title = $("#noteTitle").value.trim();
  const body = $("#noteBody").value.trim();
  if (!title && !body) return toastMessage("tuliskan sesuatu terlebih dahulu ♡");

  savedNotes.unshift({title:title||"catatan tanpa judul",body,date:today()});
  localStorage.setItem("mellupi-notes",JSON.stringify(savedNotes));
  $("#noteTitle").value = "";
  $("#noteBody").value = "";
  $("#notesList").innerHTML = renderNotes();
  toastMessage("catatan tersimpan dengan baik ♡");
}

function renderNotes() {
  return savedNotes.map((x,i)=>`
    <div class="paper">
      <h2>${escapeHTML(x.title)}</h2>
      <small>${escapeHTML(x.date)}</small>
      <p>${escapeHTML(x.body)}</p>
      <button onclick="deleteNote(${i})">hapus catatan</button>
    </div>
  `).join("") || "<p>belum ada catatan. halaman pertama menanti anda. ✎</p>";
}

function deleteNote(i) {
  savedNotes.splice(i,1);
  localStorage.setItem("mellupi-notes",JSON.stringify(savedNotes));
  refreshPageContent("notes","notesList",renderNotes());
}

function addTask() {
  const input = $("#taskInput");
  const text = input.value.trim();
  if (!text) return toastMessage("tuliskan satu kegiatan kecil dahulu ♡");
  completedTasks.push({text,done:false});
  localStorage.setItem("mellupi-tasks",JSON.stringify(completedTasks));
  input.value = "";
  refreshPageContent("school","taskList",renderTasks());
}

function renderTasks() {
  return completedTasks.map((t,i)=>`
    <label>
      <input style="width:auto;margin-right:8px" type="checkbox" ${t.done?"checked":""} onchange="toggleTask(${i},this.checked)">
      <span style="${t.done?"text-decoration:line-through;opacity:.55":""}">${escapeHTML(t.text)}</span>
      <button onclick="deleteTask(${i})">×</button>
    </label>
  `).join("") || "<p>daftar anda masih kosong. mulailah dengan satu langkah sederhana.</p>";
}

function toggleTask(i,done) {
  completedTasks[i].done = done;
  localStorage.setItem("mellupi-tasks",JSON.stringify(completedTasks));
  refreshPageContent("school","taskList",renderTasks());
}

function deleteTask(i) {
  completedTasks.splice(i,1);
  localStorage.setItem("mellupi-tasks",JSON.stringify(completedTasks));
  refreshPageContent("school","taskList",renderTasks());
}

function saveWish() {
  const input = $("#wishInput");
  const text = input.value.trim();
  if (!text) return toastMessage("harapan anda belum dituliskan ♡");
  wishes.unshift({text,date:today()});
  localStorage.setItem("mellupi-wishes",JSON.stringify(wishes));
  input.value = "";
  $("#wishesList").innerHTML = renderWishes();
  toastMessage("harapan dititipkan dengan lembut 💌");
}

function renderWishes() {
  return wishes.map((w,i)=>`
    <div class="paper">
      <span>♡</span>
      <p>${escapeHTML(w.text)}</p>
      <small>${escapeHTML(w.date)}</small>
      <button onclick="deleteWish(${i})">lepaskan harapan ini</button>
    </div>
  `).join("") || "<p>kotak ini masih kosong. harapan pertama anda dapat dimulai kapan saja. ♡</p>";
}

function deleteWish(i) {
  wishes.splice(i,1);
  localStorage.setItem("mellupi-wishes",JSON.stringify(wishes));
  refreshPageContent("wishes","wishesList",renderWishes());
}

function saveDiary() {
  const date = $("#diaryDate").value || today();
  const mood = $("#diaryMood").value;
  const text = $("#diaryText").value.trim();
  if (!text) return toastMessage("halaman ini menunggu cerita anda ♡");

  diaryEntries.unshift({date,mood,text});
  localStorage.setItem("mellupi-diary",JSON.stringify(diaryEntries));
  $("#diaryText").value = "";
  $("#diaryList").innerHTML = renderDiary();
  toastMessage("halaman harian berhasil disimpan 📔");
}

function renderDiary() {
  return diaryEntries.map((d,i)=>`
    <div class="paper">
      <small>${escapeHTML(d.date)} · ${escapeHTML(d.mood)}</small>
      <p>${escapeHTML(d.text)}</p>
      <button onclick="deleteDiary(${i})">hapus halaman</button>
    </div>
  `).join("") || "<p>belum ada halaman. mulailah ketika anda siap. ♡</p>";
}

function deleteDiary(i) {
  diaryEntries.splice(i,1);
  localStorage.setItem("mellupi-diary",JSON.stringify(diaryEntries));
  refreshPageContent("diary","diaryList",renderDiary());
}

function refreshPageContent(pageKey,elementId,html) {
  const windows = $$(".app-window",layer);
  for (const win of windows) {
    const title = $(".window-title",win);
    if (!title || title.textContent !== pages[pageKey].title) continue;
    const el = $(`#${elementId}`,win);
    if (el) el.innerHTML = html;
  }
}

function petAction(action) {
  const states = {
    hug: ["🧸","pelukan virtual diterima!","semoga anda merasa sedikit lebih hangat. anda layak menerima kebaikan."],
    play: ["🐰","waktunya bermain!","mari mencari satu hal kecil yang membuat hari terasa lebih menyenangkan."],
    rest: ["🐑","waktunya beristirahat.","anda tidak harus menyelesaikan semuanya sekarang. ambil jeda yang anda perlukan."],
    snack: ["🍓","camilan diterima!","jangan lupa memperhatikan kebutuhan tubuh anda hari ini. ♡"]
  };
  const s = states[action];
  $("#petFace").textContent = s[0];
  $("#petMood").textContent = s[1];
  $("#petText").textContent = s[2];
}

const goodThings = [
  ["🌷","anda tidak harus produktif setiap saat untuk menjadi seseorang yang berharga."],
  ["☀️","permulaan yang sederhana tetap dapat membawa perubahan yang berarti."],
  ["🐈","terkadang, kebahagiaan datang dari hal yang tidak pernah direncanakan."],
  ["🍓","anda boleh menikmati sesuatu hanya karena hal itu membuat anda senang."],
  ["🌙","hari yang berat tidak menghapus kemungkinan hadirnya hari yang lebih baik."],
  ["🫧","tidak semua hal perlu segera memiliki jawaban."],
  ["🦋","anda boleh berubah pikiran ketika menemukan pemahaman yang baru."]
];

function goodThing() {
  const item = goodThings[Math.floor(Math.random()*goodThings.length)];
  $("#goodEmoji").textContent = item[0];
  $("#goodText").textContent = item[1];
}

function careDone() {
  const checked = $$(".care-check").filter(x=>x.checked).length;
  toastMessage(checked ? `${checked} kebutuhan telah diperhatikan. terima kasih sudah merawat diri ♡` : "pilih satu hal kecil yang ingin anda lakukan ♡");
}

function setTheme(theme) {
  const themes = {
    rose: ["#f5a4a0","#e88c91","#fff8e9","#a9bd8d","#735e61"],
    sage: ["#c3d0a8","#a9bd8d","#fff8e9","#8ba58b","#5c715e"],
    cream: ["#f2d8bd","#e9c9a9","#fffaf0","#d9bd94","#846c5d"],
    lavender: ["#d5c4e6","#bba6d5","#fff8ff","#a6b3d0","#6c617f"]
  };
  const root = document.documentElement;
  const vars = themes[theme];
  ["--pink","--rose","--cream","--green","--ink"].forEach((v,i)=>root.style.setProperty(v,vars[i]));
  localStorage.setItem("mellupi-theme",theme);
  toastMessage(`suasana ${theme} telah diterapkan ♡`);
}

let petalsEnabled = true;

function togglePetals() {
  petalsEnabled = !petalsEnabled;
  if (!petalsEnabled) $("#petals").innerHTML = "";
  toastMessage(petalsEnabled ? "kelopak akan kembali menari ✿" : "hujan kelopak dihentikan ♡");
}

function createPetal() {
  if (!petalsEnabled) return;
  const el = document.createElement("span");
  el.className = "petal";
  el.textContent = ["✿","❀","♡","·","✧"][Math.floor(Math.random()*5)];
  el.style.left = Math.random()*100+"vw";
  el.style.fontSize = (9+Math.random()*14)+"px";
  el.style.animationDuration = (8+Math.random()*12)+"s";
  $("#petals").appendChild(el);
  setTimeout(()=>el.remove(),21000);
}
setInterval(createPetal,700);

function exportData() {
  const data = {
    profile: {
      name:localStorage.getItem("mellupi-name"),
      bio:localStorage.getItem("mellupi-bio")
    },
    notes:savedNotes,
    diary:diaryEntries,
    wishes,
    tasks:completedTasks,
    memories:getMemories()
  };

  const blob = new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "mellupi-data.json";
  a.click();
  URL.revokeObjectURL(url);
  toastMessage("salinan data sedang disiapkan ↓");
}

function resetData() {
  if (!confirm("apakah anda benar-benar ingin menghapus semua catatan, kenangan, harapan, dan profil yang tersimpan di peramban ini? tindakan ini tidak dapat dibatalkan.")) return;
  ["mellupi-notes","mellupi-diary","mellupi-wishes","mellupi-tasks","mellupi-memories","mellupi-name","mellupi-bio"].forEach(k=>localStorage.removeItem(k));
  savedNotes = [];
  diaryEntries = [];
  wishes = [];
  completedTasks = [];
  closeAllWindows();
  toastMessage("data pribadi telah dibersihkan.");
}

const savedTheme = localStorage.getItem("mellupi-theme");
if (savedTheme) setTheme(savedTheme);
