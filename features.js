// 1. تحديد الفندق بالنقر على الخريطة
function pickHotelOnMap() {
  if (typeof map === 'undefined' || !map) {
    alert('يرجى التمرير للأسفل حتى تظهر الخريطة');
    return;
  }
  alert('👆 انقر الآن بإصبعك مباشرة على موقع الفندق في الخريطة لتحديده');
  const mapEl = document.getElementById('map');
  if (mapEl) mapEl.scrollIntoView({ behavior: 'smooth' });

  map.once('click', function(e) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;
    const city = (document.getElementById('guide-hotel-city') || {}).value || 'مكة';
    const nameInp = document.getElementById('guide-hotel-name') || document.querySelector('input[placeholder*="أبراج الكسوة"]');
    const hName = (nameInp && nameInp.value.trim()) ? nameInp.value.trim() : ('فندق الإقامة - ' + city);

    if (window.hotelPickMarker) map.removeLayer(window.hotelPickMarker);
    window.hotelPickMarker = L.marker([lat, lng]).addTo(map).bindPopup('🏨 ' + hName).openPopup();

    if (typeof serverHotels !== 'undefined') {
      serverHotels[city] = { name: hName, lat: lat, lng: lng };
    }
    if (typeof saveHotel === 'function') saveHotel();
    alert('✅ تم تثبيت موقع ' + hName + ' بنجاح!');
  });
}

// 2. زر إغلاق التعميم نهائياً وأرشيف التعميمات
function dismissCurrentBroadcast() {
  const b = document.getElementById('broadcast-banner');
  if (b) {
    b.style.display = 'none';
    const t = b.innerText.replace('✕', '').trim();
    if (t) localStorage.setItem('dismissed_broadcast_msg', t);
  }
}

// مراقبة التعميم لحفظه ومنع تكراره إذا تم إغلاقه
setInterval(function() {
  const b = document.getElementById('broadcast-banner');
  if (!b) return;
  const t = b.innerText.replace('✕', '').trim();
  if (t) {
    if (localStorage.getItem('dismissed_broadcast_msg') === t) {
      b.style.display = 'none';
    }
    let hist = [];
    try { hist = JSON.parse(localStorage.getItem('omrah_broadcast_list') || '[]'); } catch(e){}
    if (!hist.some(item => item.text === t)) {
      const now = new Date();
      hist.unshift({
        text: t,
        time: now.toLocaleTimeString('ar-DZ', {hour:'2-digit', minute:'2-digit'}),
        date: now.toLocaleDateString('ar-DZ')
      });
      localStorage.setItem('omrah_broadcast_list', JSON.stringify(hist));
    }
  }
}, 1000);

// زر عائم دائم لفتح سجل التعميمات
function renderArchiveButton() {
  if (document.getElementById('btn-float-archive')) return;
  const btn = document.createElement('button');
  btn.id = 'btn-float-archive';
  btn.innerHTML = '📜 سجل التعميمات';
  btn.style.cssText = 'position:fixed; bottom:15px; left:15px; z-index:99999; background:#0284c7; color:#fff; border:none; padding:8px 14px; border-radius:20px; font-weight:bold; font-size:12px; box-shadow:0 3px 10px rgba(0,0,0,0.4); cursor:pointer;';
  btn.onclick = function() {
    let hist = [];
    try { hist = JSON.parse(localStorage.getItem('omrah_broadcast_list') || '[]'); } catch(e){}
    let items = '<div style="color:#94a3b8; text-align:center; padding:15px;">لا توجد تعميمات سابقة</div>';
    if (hist.length > 0) {
      items = hist.map(h => `
        <div style="background:#0f172a; border-right:3px solid #ef4444; padding:8px 10px; border-radius:6px; margin-bottom:8px;">
          <div style="display:flex; justify-content:space-between; font-size:11px; color:#94a3b8; margin-bottom:4px;">
            <span>📅 ${h.date}</span>
            <span>⏱ ${h.time}</span>
          </div>
          <div style="color:#fff; font-size:13px; line-height:1.4;">${h.text}</div>
        </div>
      `).join('');
    }
    const modal = document.createElement('div');
    modal.id = 'archive-modal-view';
    modal.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:999999; display:flex; align-items:center; justify-content:center; padding:16px;';
    modal.innerHTML = `
      <div style="background:#1e293b; border-radius:10px; width:100%; max-width:460px; max-height:80vh; display:flex; flex-direction:column; border:1px solid #475569;">
        <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 14px; border-bottom:1px solid #334155;">
          <h4 style="color:#fff; margin:0; font-size:14px;">📢 سجل وأرشيف التعميمات</h4>
          <button onclick="document.getElementById('archive-modal-view').remove()" style="background:#ef4444; border:none; color:#fff; border-radius:4px; padding:3px 8px; cursor:pointer;">✕</button>
        </div>
        <div style="padding:12px; overflow-y:auto; flex:1;">${items}</div>
      </div>
    `;
    document.body.appendChild(modal);
  };
  document.body.appendChild(btn);
}

// 3. نماذج وأزرار الإضافة والتعديل والحذف للدروس والمزارات
function renderCrudUI() {
  // إضافة درس
  const lCont = document.getElementById('lessons-container');
  if (lCont && !document.getElementById('box-new-lesson')) {
    const box = document.createElement('div');
    box.id = 'box-new-lesson';
    box.style.cssText = 'background:#1e293b; border:1px solid #38bdf8; border-radius:8px; padding:10px; margin-bottom:12px;';
    box.innerHTML = `
      <div style="color:#38bdf8; font-weight:bold; font-size:13px; margin-bottom:6px;">➕ إضافة درس جديد للحافلة</div>
      <input type="text" id="add-l-title" placeholder="عنوان الدرس..." style="width:100%; box-sizing:border-box; padding:6px; background:#0f172a; color:#fff; border:1px solid #334155; border-radius:4px; margin-bottom:6px; font-size:12px;">
      <textarea id="add-l-body" rows="3" placeholder="نص الدرس كاملاً..." style="width:100%; box-sizing:border-box; padding:6px; background:#0f172a; color:#fff; border:1px solid #334155; border-radius:4px; margin-bottom:6px; font-size:12px;"></textarea>
      <button id="btn-submit-l" class="btn btn-primary" style="width:100%; padding:6px; font-size:12px;">نشر وحفظ الدرس 📢</button>
    `;
    lCont.parentNode.insertBefore(box, lCont);
    document.getElementById('btn-submit-l').onclick = function() {
      const t = document.getElementById('add-l-title').value.trim();
      const b = document.getElementById('add-l-body').value.trim().replace(/\n/g, '<br>');
      if (!t || !b) return alert('يرجى ملء العنوان والنص');
      if (typeof lessons !== 'undefined') {
        lessons.unshift({ title: t, content: b, category: 'أخلاق', badge: 'badge-purple', time: '⏱ وقت الإلقاء: دقيقتان إلى 3 دقائق' });
        if (typeof renderLessons === 'function') renderLessons('all');
      }
      document.getElementById('add-l-title').value = '';
      document.getElementById('add-l-body').value = '';
      alert('تمت إضافة الدرس بنجاح!');
    };
  }

  // إضافة مزار
  const pCont = document.getElementById('places-container');
  if (pCont && !document.getElementById('box-new-place')) {
    const box = document.createElement('div');
    box.id = 'box-new-place';
    box.style.cssText = 'background:#1e293b; border:1px solid #10b981; border-radius:8px; padding:10px; margin-bottom:12px;';
    box.innerHTML = `
      <div style="color:#10b981; font-weight:bold; font-size:13px; margin-bottom:6px;">➕ إضافة قصة أو مزار جديد</div>
      <div style="display:flex; gap:6px; margin-bottom:6px;">
        <select id="add-p-city" style="padding:6px; background:#0f172a; color:#fff; border:1px solid #334155; border-radius:4px; font-size:12px;">
          <option value="مكة المكرمة والمشاعر">مكة المكرمة</option>
          <option value="المدينة المنورة">المدينة المنورة</option>
        </select>
        <input type="text" id="add-p-title" placeholder="اسم المزار..." style="flex:1; padding:6px; background:#0f172a; color:#fff; border:1px solid #334155; border-radius:4px; font-size:12px;">
      </div>
      <textarea id="add-p-story" rows="3" placeholder="سرد القصة والمكان بالتفصيل..." style="width:100%; box-sizing:border-box; padding:6px; background:#0f172a; color:#fff; border:1px solid #334155; border-radius:4px; margin-bottom:6px; font-size:12px;"></textarea>
      <button id="btn-submit-p" class="btn btn-primary" style="width:100%; padding:6px; font-size:12px; background:#059669;">حفظ المزار 📍</button>
    `;
    pCont.parentNode.insertBefore(box, pCont);
    document.getElementById('btn-submit-p').onclick = function() {
      const c = document.getElementById('add-p-city').value;
      const t = document.getElementById('add-p-title').value.trim();
      const s = document.getElementById('add-p-story').value.trim().replace(/\n/g, '<br>');
      if (!t || !s) return alert('يرجى ملء اسم المزار والقصة');
      if (typeof places !== 'undefined') {
        places.unshift({ city: c, title: t, story: s });
        if (typeof renderPlaces === 'function') renderPlaces('all');
      }
      document.getElementById('add-p-title').value = '';
      document.getElementById('add-p-story').value = '';
      alert('تم حفظ المزار بنجاح!');
    };
  }

  // أزرار الحذف في كروت الدروس والمزارات
  document.querySelectorAll('#lessons-container .card').forEach((c, idx) => {
    if (!c.querySelector('.del-l-btn')) {
      const btn = document.createElement('button');
      btn.className = 'del-l-btn';
      btn.innerText = 'حذف الدرس 🗑️';
      btn.style.cssText = 'margin-top:8px; padding:3px 8px; font-size:11px; background:#ef4444; color:#fff; border:none; border-radius:4px; cursor:pointer;';
      btn.onclick = function() {
        if (!confirm('حذف هذا الدرس؟')) return;
        if (typeof lessons !== 'undefined') {
          lessons.splice(idx, 1);
          if (typeof renderLessons === 'function') renderLessons('all');
        }
      };
      c.appendChild(btn);
    }
  });

  document.querySelectorAll('#places-container .card').forEach((c, idx) => {
    if (!c.querySelector('.del-p-btn')) {
      const btn = document.createElement('button');
      btn.className = 'del-p-btn';
      btn.innerText = 'حذف المزار 🗑️';
      btn.style.cssText = 'margin-top:8px; padding:3px 8px; font-size:11px; background:#ef4444; color:#fff; border:none; border-radius:4px; cursor:pointer;';
      btn.onclick = function() {
        if (!confirm('حذف هذا المزار؟')) return;
        if (typeof places !== 'undefined') {
          places.splice(idx, 1);
          if (typeof renderPlaces === 'function') renderPlaces('all');
        }
      };
      c.appendChild(btn);
    }
  });
}

setInterval(function() {
  renderArchiveButton();
  renderCrudUI();
}, 1000);
