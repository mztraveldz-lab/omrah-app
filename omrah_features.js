// omrah_features.js - الميزات المعزولة الشاملة (التعميمات + إدارة الدروس والمزارات)

(function() {
  console.log("Omrah Extended Features Running...");

  // 1. نظام إغلاق الشريط الأحمر والاحتفاظ بسجل التعميمات
  function setupBroadcastFeatures() {
    const banner = document.getElementById('broadcast-banner');
    if (!banner) return;

    if (!document.getElementById('btn-close-broadcast')) {
      const closeBtn = document.createElement('button');
      closeBtn.id = 'btn-close-broadcast';
      closeBtn.innerHTML = '✕';
      closeBtn.style.cssText = 'position:absolute; left:12px; top:50%; transform:translateY(-50%); background:rgba(0,0,0,0.3); border:none; color:#fff; border-radius:50%; width:26px; height:26px; cursor:pointer; font-weight:bold; font-size:12px; line-height:24px;';
      closeBtn.onclick = function(e) {
        e.stopPropagation();
        banner.style.display = 'none';
        const currentText = banner.innerText.replace('✕', '').trim();
        localStorage.setItem('dismissed_broadcast', currentText);
      };
      banner.style.position = 'relative';
      banner.appendChild(closeBtn);
    }

    const observer = new MutationObserver(function() {
      const text = banner.innerText.replace('✕', '').trim();
      if (!text) return;

      const lastDismissed = localStorage.getItem('dismissed_broadcast');
      if (lastDismissed && lastDismissed === text) {
        banner.style.display = 'none';
      }

      let history = [];
      try { history = JSON.parse(localStorage.getItem('broadcast_history') || '[]'); } catch(e){}
      const now = new Date();
      const timeStr = now.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' });
      const dateStr = now.toLocaleDateString('ar-DZ');

      if (!history.some(item => item.text === text)) {
        history.unshift({ text: text, time: timeStr, date: dateStr });
        if (history.length > 50) history.pop();
        localStorage.setItem('broadcast_history', JSON.stringify(history));
      }
    });

    observer.observe(banner, { childList: true, subtree: true, characterData: true });
  }

  // 2. زر فتح أرشيف التعميمات
  function setupArchiveButton() {
    if (document.getElementById('btn-show-archive')) return;

    const archiveBtn = document.createElement('button');
    archiveBtn.id = 'btn-show-archive';
    archiveBtn.innerHTML = '📜 سجل التعميمات';
    archiveBtn.style.cssText = 'position:fixed; bottom:20px; left:20px; z-index:999; background:#0284c7; color:#fff; border:none; padding:8px 14px; border-radius:20px; font-weight:bold; font-size:12px; box-shadow:0 4px 10px rgba(0,0,0,0.4); cursor:pointer;';
    
    archiveBtn.onclick = showArchiveModal;
    document.body.appendChild(archiveBtn);
  }

  function showArchiveModal() {
    let existing = document.getElementById('archive-modal');
    if (existing) existing.remove();

    let history = [];
    try { history = JSON.parse(localStorage.getItem('broadcast_history') || '[]'); } catch(e){}

    let itemsHtml = '<div style="color:#94a3b8; text-align:center; padding:20px;">لا توجد تعميمات مسجلة بعد</div>';
    if (history.length > 0) {
      itemsHtml = history.map(h => `
        <div style="background:#0f172a; border-right:3px solid #ef4444; padding:10px; border-radius:6px; margin-bottom:8px;">
          <div style="display:flex; justify-content:space-between; font-size:11px; color:#94a3b8; margin-bottom:4px;">
            <span>📅 ${h.date}</span>
            <span>⏱ ${h.time}</span>
          </div>
          <div style="color:#fff; font-size:13px; line-height:1.4;">${h.text}</div>
        </div>
      `).join('');
    }

    const modal = document.createElement('div');
    modal.id = 'archive-modal';
    modal.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:99999; display:flex; align-items:center; justify-content:center; padding:16px;';
    modal.innerHTML = `
      <div style="background:#1e293b; border-radius:12px; width:100%; max-width:480px; max-height:80vh; display:flex; flex-direction:column; border:1px solid #475569;">
        <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 16px; border-bottom:1px solid #334155;">
          <h3 style="color:#fff; margin:0; font-size:15px;">📢 أرشيف تعميمات الفوج</h3>
          <button onclick="document.getElementById('archive-modal').remove()" style="background:#ef4444; border:none; color:#fff; border-radius:6px; padding:4px 10px; cursor:pointer;">إغلاق ✕</button>
        </div>
        <div style="padding:12px; overflow-y:auto; flex:1;">${itemsHtml}</div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // 3. إدارة الدروس (حقيبة الحافلة) للمرشد
  function setupLessonsManagement() {
    const container = document.getElementById('lessons-container');
    if (!container || document.getElementById('ext-lesson-form')) return;

    const formDiv = document.createElement('div');
    formDiv.id = 'ext-lesson-form';
    formDiv.style.cssText = 'background:#1e293b; border:1px solid #38bdf8; border-radius:8px; padding:12px; margin-bottom:14px;';
    formDiv.innerHTML = `
      <div style="color:#38bdf8; font-weight:bold; margin-bottom:8px; font-size:14px;">📝 لوحة المرشد: إضافة / تعديل درس للحافلة</div>
      <input type="hidden" id="ext-lesson-idx" value="-1">
      <div style="display:flex; gap:6px; margin-bottom:6px;">
        <select id="ext-lesson-cat" style="background:#0f172a; color:#fff; border:1px solid #334155; border-radius:6px; padding:6px; font-size:12px;">
          <option value="أخلاق">أخلاق ولحمة</option>
          <option value="المطار والتسكين">المطار والتسكين</option>
          <option value="الصلاة">الصلاة والجنائز</option>
        </select>
        <input type="text" id="ext-lesson-title" placeholder="عنوان الدرس..." style="flex:1; background:#0f172a; color:#fff; border:1px solid #334155; border-radius:6px; padding:6px; font-size:12px;">
      </div>
      <textarea id="ext-lesson-body" rows="3" placeholder="نص الدرس كاملاً..." style="width:100%; box-sizing:border-box; background:#0f172a; color:#fff; border:1px solid #334155; border-radius:6px; padding:6px; font-size:12px; margin-bottom:8px;"></textarea>
      <div style="display:flex; gap:6px;">
        <button id="ext-btn-save-lesson" class="btn btn-primary" style="flex:1; padding:7px; font-size:12px;">نشر الدرس 📢</button>
        <button id="ext-btn-cancel-lesson" class="btn" style="background:#475569; color:#fff; padding:7px; font-size:12px;">إلغاء</button>
      </div>
    `;

    container.parentNode.insertBefore(formDiv, container);

    document.getElementById('ext-btn-save-lesson').onclick = saveLesson;
    document.getElementById('ext-btn-cancel-lesson').onclick = clearLessonForm;

    attachLessonActionButtons();
  }

  function getStoredLessons() {
    try {
      const saved = localStorage.getItem('omrah_lessons_store');
      if (saved) return JSON.parse(saved);
    } catch(e){}
    return (typeof lessons !== 'undefined') ? lessons : [];
  }

  function saveLesson() {
    const idx = parseInt(document.getElementById('ext-lesson-idx').value);
    const cat = document.getElementById('ext-lesson-cat').value;
    const title = document.getElementById('ext-lesson-title').value.trim();
    const body = document.getElementById('ext-lesson-body').value.trim().replace(/\n/g, '<br>');

    if (!title || !body) {
      alert('يرجى كتابة عنوان الدرس ومحتواه أولاً');
      return;
    }

    let list = getStoredLessons();
    const item = {
      title: title,
      content: body,
      category: cat,
      badge: cat.includes('أخلاق') ? 'badge-purple' : (cat.includes('صلاة') ? 'badge-rose' : 'badge-amber'),
      time: '⏱ وقت الإلقاء: دقيقتان إلى 3 دقائق'
    };

    if (idx >= 0 && idx < list.length) {
      list[idx] = item;
    } else {
      list.unshift(item);
    }

    localStorage.setItem('omrah_lessons_store', JSON.stringify(list));
    if (typeof lessons !== 'undefined') lessons = list;
    clearLessonForm();
    if (typeof renderLessons === 'function') renderLessons('all');
    setTimeout(attachLessonActionButtons, 100);
    alert('تم حفظ ونشر الدرس بنجاح!');
  }

  function clearLessonForm() {
    document.getElementById('ext-lesson-idx').value = '-1';
    document.getElementById('ext-lesson-title').value = '';
    document.getElementById('ext-lesson-body').value = '';
    document.getElementById('ext-btn-save-lesson').innerText = 'نشر الدرس 📢';
  }

  function attachLessonActionButtons() {
    const cards = document.querySelectorAll('#lessons-container .card');
    const list = getStoredLessons();
    cards.forEach((card, idx) => {
      if (card.querySelector('.ext-ctrl-group')) return;
      const group = document.createElement('div');
      group.className = 'ext-ctrl-group';
      group.style.cssText = 'display:flex; gap:6px; margin-top:8px; padding-top:6px; border-top:1px solid rgba(255,255,255,0.1);';
      group.innerHTML = `
        <button style="background:#0284c7; color:#fff; border:none; border-radius:4px; padding:4px 8px; font-size:11px; cursor:pointer;">تعديل ✏️</button>
        <button style="background:#ef4444; color:#fff; border:none; border-radius:4px; padding:4px 8px; font-size:11px; cursor:pointer;">حذف 🗑️</button>
      `;
      group.children[0].onclick = function() {
        if (!list[idx]) return;
        document.getElementById('ext-lesson-idx').value = idx;
        document.getElementById('ext-lesson-title').value = list[idx].title || '';
        document.getElementById('ext-lesson-body').value = (list[idx].content || list[idx].story || '').replace(/<br\s*[\/]?>/gi, '\n');
        document.getElementById('ext-btn-save-lesson').innerText = 'تحديث وتعديل الدرس 💾';
        document.getElementById('ext-lesson-form').scrollIntoView({ behavior: 'smooth' });
      };
      group.children[1].onclick = function() {
        if (!confirm('هل تريد حذف هذا الدرس بالتأكيد؟')) return;
        list.splice(idx, 1);
        localStorage.setItem('omrah_lessons_store', JSON.stringify(list));
        if (typeof lessons !== 'undefined') lessons = list;
        if (typeof renderLessons === 'function') renderLessons('all');
        setTimeout(attachLessonActionButtons, 100);
      };
      card.appendChild(group);
    });
  }

  // 4. إدارة المزارات والقصص للمرشد
  function setupPlacesManagement() {
    const container = document.getElementById('places-container');
    if (!container || document.getElementById('ext-place-form')) return;

    const formDiv = document.createElement('div');
    formDiv.id = 'ext-place-form';
    formDiv.style.cssText = 'background:#1e293b; border:1px solid #10b981; border-radius:8px; padding:12px; margin-bottom:14px;';
    formDiv.innerHTML = `
      <div style="color:#10b981; font-weight:bold; margin-bottom:8px; font-size:14px;">📍 لوحة المرشد: إضافة / تعديل مزار أو قصة</div>
      <input type="hidden" id="ext-place-idx" value="-1">
      <div style="display:flex; gap:6px; margin-bottom:6px;">
        <select id="ext-place-city" style="background:#0f172a; color:#fff; border:1px solid #334155; border-radius:6px; padding:6px; font-size:12px;">
          <option value="مكة المكرمة والمشاعر">مكة المكرمة والمشاعر</option>
          <option value="المدينة المنورة">المدينة المنورة</option>
        </select>
        <input type="text" id="ext-place-title" placeholder="اسم المزار (مثال: بئر غرس)..." style="flex:1; background:#0f172a; color:#fff; border:1px solid #334155; border-radius:6px; padding:6px; font-size:12px;">
      </div>
      <textarea id="ext-place-story" rows="3" placeholder="اكتب السرد والقصة التاريخية بالتفصيل..." style="width:100%; box-sizing:border-box; background:#0f172a; color:#fff; border:1px solid #334155; border-radius:6px; padding:6px; font-size:12px; margin-bottom:8px;"></textarea>
      <div style="display:flex; gap:6px;">
        <button id="ext-btn-save-place" class="btn btn-primary" style="flex:1; padding:7px; font-size:12px; background:#059669;">حفظ المزار 📍</button>
        <button id="ext-btn-cancel-place" class="btn" style="background:#475569; color:#fff; padding:7px; font-size:12px;">إلغاء</button>
      </div>
    `;

    container.parentNode.insertBefore(formDiv, container);

    document.getElementById('ext-btn-save-place').onclick = savePlace;
    document.getElementById('ext-btn-cancel-place').onclick = clearPlaceForm;

    attachPlaceActionButtons();
  }

  function getStoredPlaces() {
    try {
      const saved = localStorage.getItem('omrah_places_store');
      if (saved) return JSON.parse(saved);
    } catch(e){}
    return (typeof places !== 'undefined') ? places : [];
  }

  function savePlace() {
    const idx = parseInt(document.getElementById('ext-place-idx').value);
    const city = document.getElementById('ext-place-city').value;
    const title = document.getElementById('ext-place-title').value.trim();
    const story = document.getElementById('ext-place-story').value.trim().replace(/\n/g, '<br>');

    if (!title || !story) {
      alert('يرجى ملء اسم المزار والشرح التاريخي');
      return;
    }

    let list = getStoredPlaces();
    const item = { city, title, story };

    if (idx >= 0 && idx < list.length) {
      list[idx] = item;
    } else {
      list.unshift(item);
    }

    localStorage.setItem('omrah_places_store', JSON.stringify(list));
    if (typeof places !== 'undefined') places = list;
    clearPlaceForm();
    if (typeof renderPlaces === 'function') renderPlaces('all');
    setTimeout(attachPlaceActionButtons, 100);
    alert('تم حفظ المزار بنجاح!');
  }

  function clearPlaceForm() {
    document.getElementById('ext-place-idx').value = '-1';
    document.getElementById('ext-place-title').value = '';
    document.getElementById('ext-place-story').value = '';
    document.getElementById('ext-btn-save-place').innerText = 'حفظ المزار 📍';
  }

  function attachPlaceActionButtons() {
    const cards = document.querySelectorAll('#places-container .card');
    const list = getStoredPlaces();
    cards.forEach((card, idx) => {
      if (card.querySelector('.ext-ctrl-group')) return;
      const group = document.createElement('div');
      group.className = 'ext-ctrl-group';
      group.style.cssText = 'display:flex; gap:6px; margin-top:8px; padding-top:6px; border-top:1px solid rgba(255,255,255,0.1);';
      group.innerHTML = `
        <button style="background:#0284c7; color:#fff; border:none; border-radius:4px; padding:4px 8px; font-size:11px; cursor:pointer;">تعديل ✏️</button>
        <button style="background:#ef4444; color:#fff; border:none; border-radius:4px; padding:4px 8px; font-size:11px; cursor:pointer;">حذف 🗑️</button>
      `;
      group.children[0].onclick = function() {
        if (!list[idx]) return;
        document.getElementById('ext-place-idx').value = idx;
        document.getElementById('ext-place-title').value = list[idx].title || '';
        document.getElementById('ext-place-story').value = (list[idx].story || list[idx].content || '').replace(/<br\s*[\/]?>/gi, '\n');
        document.getElementById('ext-btn-save-place').innerText = 'تحديث وتعديل المزار 💾';
        document.getElementById('ext-place-form').scrollIntoView({ behavior: 'smooth' });
      };
      group.children[1].onclick = function() {
        if (!confirm('هل تريد حذف هذا المزار بالتأكيد؟')) return;
        list.splice(idx, 1);
        localStorage.setItem('omrah_places_store', JSON.stringify(list));
        if (typeof places !== 'undefined') places = list;
        if (typeof renderPlaces === 'function') renderPlaces('all');
        setTimeout(attachPlaceActionButtons, 100);
      };
      card.appendChild(group);
    });
  }

  // مزامنة البيانات المخزنة مع المصفوفات الرئيسية عند البداية
  const initLessons = getStoredLessons();
  if (initLessons.length > 0 && typeof lessons !== 'undefined') lessons = initLessons;
  const initPlaces = getStoredPlaces();
  if (initPlaces.length > 0 && typeof places !== 'undefined') places = initPlaces;

  // تهيئة عامة دورية للتأكد من تفعيل العناصر حتى مع تبديل التبويبات
  function loopInit() {
    setupBroadcastFeatures();
    setupArchiveButton();
    setupLessonsManagement();
    setupPlacesManagement();
  }

  window.addEventListener('DOMContentLoaded', loopInit);
  setInterval(loopInit, 1500);

})();
