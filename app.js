// بيانات الأشواط
const tawafDuas = [
  "سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلا إِلَهَ إِلا اللَّهُ، وَاللَّهُ أَكْبَرُ، وَلا حَوْلَ وَلا قُوَّةَ إِلا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ.",
  "اللهم إني أسألك العفو والعافية في ديني ودنياي وأهلي ومالي. اللهم استر عوراتي وآمن روعاتي.",
  "اللهم إني أعوذ بك من الشك والشرك والشقاق والنفاق وسوء الأخلاق، وأعوذ بك من غلبة الدين وقهر الرجال.",
  "اللهم اجعله حجاً مبروراً، وسعياً مشكوراً، وذنباً مغفوراً، وعملاً صالحاً مقبولاً، وتجارة لن تبور.",
  "اللهم اغفر لي وارحمني وعافني واهدني وارزقني، واجبرني وارفعني، يا أرحم الراحمين.",
  "اللهم إني أسألك من الخير كله عاجله وآجله، ما علمت منه وما لم أعلم، وأعوذ بك من الشر كله عاجله وآجله.",
  "اللهم قنعني بما رزقتني، وبارك لي فيما أعطيتني، واخلف عليّ كل غائبة لي بخير."
];

const ziyaratData = [
  {
    title: "غار حراء (جبل النور) - مكة",
    story: "المكان الذي كان يخلو فيه النبي ﷺ للتعبد، وفيه نزل عليه أمين الوحي جبريل عليه السلام بأول آيات القرآن الكريم: (اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ)."
  },
  {
    title: "غار ثور (جبل ثور) - مكة",
    story: "الغار الذي لجأ إليه الرسول ﷺ وصاحبه الصديق أبو بكر أثناء الهجرة المباركة إلى المدينة، وفيه تجلت عناية الله: (إِذْ يَقُولُ لِصَاحِبِهِ لَا تَحْزَنْ إِنَّ اللَّهَ مَعَنَا)."
  },
  {
    title: "مسجد قباء - المدينة المنورة",
    story: "أول مسجد أُسس في الإسلام بعد الهجرة النبوية. الصلاة فيه تعدل أجر عمرة تامة كما ثبت في الحديث الصحيح."
  },
  {
    title: "جبل أحد ومقبرة الشهداء - المدينة",
    story: "جبل يحبنا ونحبه. دارت عنده غزوة أحد الشهيرة، ويضم مقبرة 70 صحابياً شهيداً وفي مقدمتهم سيد الشهداء حمزة بن عبد المطلب رضي الله عنه."
  }
];

let tawafStep = 1;
let saeyStep = 1;

function switchTab(tab) {
  ['tawaf', 'saey', 'ziyarat'].forEach(t => {
    document.getElementById(`view-${t}`).classList.add('hidden');
    document.getElementById(`tab-${t}`).className = 'flex-1 py-3 text-slate-400';
  });
  document.getElementById(`view-${tab}`).classList.remove('hidden');
  document.getElementById(`tab-${tab}`).className = 'flex-1 py-3 border-b-2 border-emerald-500 text-emerald-400';
}

function nextTawaf() {
  if (tawafStep < 7) {
    tawafStep++;
    updateTawafUI();
  } else {
    alert("الحمد لله، أتممت 7 أشواط! توجه الآن لصلاة ركعتين خلف مقام إبراهيم ثم اشرب من زمزم.");
    resetTawaf();
  }
}

function resetTawaf() {
  tawafStep = 1;
  updateTawafUI();
}

function updateTawafUI() {
  document.getElementById('tawaf-count').innerText = tawafStep;
  document.getElementById('tawaf-dua-title').innerText = `دعاء مقترح للشوط ${tawafStep}`;
  document.getElementById('tawaf-dua-text').innerText = `"${tawafDuas[tawafStep - 1]}"`;
}

function nextSaey() {
  if (saeyStep < 7) {
    saeyStep++;
    updateSaeyUI();
  } else {
    alert("الحمد لله، أتممت السعي في المروة! بقي لك الحلق أو التقصير للتحلل.");
    resetSaey();
  }
}

function resetSaey() {
  saeyStep = 1;
  updateSaeyUI();
}

function updateSaeyUI() {
  document.getElementById('saey-count').innerText = saeyStep;
  const isSafaToMarwa = saeyStep % 2 !== 0;
  document.getElementById('saey-direction').innerText = isSafaToMarwa 
    ? `الشوط ${saeyStep}: من الصفا نحو المروة` 
    : `الشوط ${saeyStep}: من المروة نحو الصفا`;
}

// عرض المزارات
const placesContainer = document.getElementById('places-list');
ziyaratData.forEach(p => {
  placesContainer.innerHTML += `
    <div class="bg-slate-800 p-4 rounded-xl border border-slate-700">
      <h3 class="font-bold text-emerald-400 mb-1 text-md">📌 ${p.title}</h3>
      <p class="text-sm text-slate-300 leading-relaxed">${p.story}</p>
    </div>
  `;
});
