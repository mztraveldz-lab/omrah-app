// omrah_features.js - الميزات الميدانية الشاملة والمستقلة

(function() {
  console.log("Omrah Features Starting...");

  // --- 1. إصلاح زر الفندق: اختيار الفندق بالنقر/البحث على الخريطة وليس الموقع الحالي ---
  function fixHotelPickerButton() {
    // البحث عن زر "جعل موقعي الحالي هو الفندق"
    const buttons = Array.from(document.querySelectorAll('button'));
    const myLocBtn = buttons.find(b => b.innerText && b.innerText.includes('جعل موقعي الحالي هو الفندق'));

    if (myLocBtn && !myLocBtn.dataset.modified) {
      myLocBtn.dataset.modified = "true";
      myLocBtn.innerText = "📍 حدد الفندق من الخريطة";
      myLocBtn.style.background = "#0284c7";
      myLocBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();

        if (typeof map === 'undefined' || !map) {
          alert('يرجى التمرير لأسفل لفتح الخريطة');
          return;
        }

        // التمرير إلى الخريطة بسلاسة
        const mapDiv = document.getElementById('map');
        if (mapDiv) mapDiv.scrollIntoView({ behavior: 'smooth' });

        myLocBtn.innerText = "👆 انقر على موقع الفندق في الخريطة الآن...";
        myLocBtn.style.background = "#eab308";

        // التقاط النقرة القادمة فقط على الخريطة
        map.once('click', function(ev) {
          const lat = ev.latlng.lat;
          const lng = ev.latlng.lng;

          const citySel = document.querySelector('select');
          const city = citySel ? citySel.value : 'مكة';
          const nameInput = document.querySelector('input[placeholder*="أبراج الكسوة"]');
          const hotelName = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : ('فندق الإقامة - ' + city);

          // إزالة العلامة القديمة إن وجدت ووضع علامة الفندق الجديد
          if (window.selectedHotelMarker) {
            map.removeLayer(window.selectedHotelMarker);
          }
          window.selectedHotelMarker = L.marker([lat, lng]).addTo(map).bindPopup('🏨 ' + hotelName).openPopup();

          // حفظ الإحداثيات في كائن التطبيق
          if (typeof serverHotels !== 'undefined') {
            serverHotels[city] = { name: hotelName, lat: lat, lng: lng };
          }
          localStorage.setItem('custom_hotel_' + city, JSON.stringify({ name: hotelName, lat: lat, lng: lng }));

          myLocBtn.innerText = "✅ تم تحديد الفندق بنجاح";
          myLocBtn.style.background = "#10b981";
          alert('تم تحديد موقع ' + hotelName + ' على الخريطة بنجاح!');
        });
      };
    }
  }

  // --- 2. الشريط الأحمر: زر الإغلاق وأرشيف التعميمات بالتاريخ والوقت ---
  function setupBroadcastBar() {
    const banner = document.getElementById('broadcast-banner');
    if (!banner) return;

    if (!document.getElementById('close-broadcast-btn')) {
      const closeBtn = document.createElement('button');
      closeBtn.id = 'close-broadcast-btn';
      closeBtn.innerHTML = '✕';
      closeBtn.style.cssText = 'position:absolute; left:12px; top:50%; transform:translateY(-50%); background:rgba(0,0,0,0.35); border:none; color:#fff; border-radius:50%; width:26px; height:26px; cursor:pointer; font-weight:bold; font-size:12px; line-height:24px;';
      closeBtn.onclick = function(e) {
        e.stopPropagation();
        banner.style.display = 'none';
        localStorage.setItem('dismissed_banner_text', banner.innerText.replace('✕', '').trim());
      };
      banner.style.position = 'relative';
      banner.appendChild(closeBtn);
    }

    // التحقق من تكرار النص المغلق مسبقاً
    const cleanText = banner.innerText.replace('✕', '').trim();
    if (cleanText && cleanText === localStorage.getItem('dismissed_banner_text')) {
      banner.style.display = 'none';
    }

    // حفظ في الأرشيف مع التاريخ والوقت
    if (cleanText && cleanText.length > 3) {
      let archive = [];
      try { archive = JSON.parse(localStorage.getItem('omrah_broadcast_archive') || '[]'); } catch(e){}
      if (!archive.some(a => a.text === cleanText)) {
        const d = new Date();
        const time = d.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' });
        const date = d.toLocaleDateString('ar-DZ');
        archive.unshift({ text: cleanText, time: time, date: date });
        if (archive.length > 50) archive.pop();
        localStorage.setItem('omrah_broadcast_archive', JSON.stringify(archive));
      }
    }
  }

  // --- 3. زر عائم لفتح أرشيف وسجل التعميمات ---
  function setupArchiveFloatingBtn() {
    if (document.getElementById('btn-open-archive')) return;
    const btn = document.createElement('button');
    btn.id = 'btn-open-archive';
    btn.innerHTML = '📢 سجل التعميمات';
    btn.style.cssText = 'position:fixed; bottom:15px; left:15px; z-index:9999; background:#0284c7; color:#fff; border:none; padding:7px 14px; border-radius:20px; font-weight:bold; font-size:12px; box-shadow:0 3px 8px rgba(0,0,0,0.5); cursor:pointer;';
    btn.onclick = openArchiveModal;
    document.body.appendChild(btn);
  }

  function openArchiveModal() {
    let oldModal = document.getElementById('archive-modal-box');
    if (oldModal) oldModal.remove();

    let list = [];
    try { list = JSON.parse(localStorage.getItem('omrah_broadcast_archive') || '[]'); } catch(e){}

    let contentHtml = '<div style="color:#94a3b8; text-align:center; padding:20px;">لا توجد تعميمات سابقة بعد</div>';
    if (list.length > 0) {
      contentHtml = list.map(item => `
        <div style="background:#0f172a; border-right:3px solid #ef4444; padding:8px 10px; border-radius:6px; margin-bottom:8px;">
          <div style="display:flex; justify-content:space-between; font-size:11px; color:#94a3b8; margin-bottom:4px;">
            <span>📅 ${item.date}</span>
            <span>⏱ ${item.time}</span>
          </div>
          <div style="color:#f8fafc; font-size:13px; line-height:1.4;">${item.text}</div>
        </div>
      `).join('');
    }

    const modal = document.createElement('div');
    modal.id = 'archive-modal-box';
    modal.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:999999; display:flex; align-items:center; justify-content:center; padding:14px;';
    modal.innerHTML = `
      <div style="background:#1e293b; border-radius:10px; width:100%; max-width:460px; max-height:80vh; display:flex; flex-direction:column; border:1px solid #475569;">
        <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 14px; border-bottom:1px solid #334155;">
          <h4 style="color:#fff; margin:0; font-size:14px;">📢 أرشيف تعميمات الفوج</h4>
          <button onclick="document.getElementById('archive-modal-box').remove()" style="background:#ef4444; border:none; color:#fff; border-radius:6px; padding:3px 8px; cursor:pointer;">✕</button>
        </div>
        <div style="padding:12px; overflow-y:auto; flex:1;">${contentHtml}</div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // --- 4. نماذج إضافة وتعديل الدروس والمزارات ---
  function setupCrudForms() {
    // كرت إضافة الدروس
    const lContainer = document.getElementById('lessons-container');
    if (lContainer && !document.getElementById('box-add-lesson')) {
      const box = document.createElement('div');
      box.id = 'box-add-lesson';
      box.style.cssText = 'background:#1e293b; border:1px solid #38bdf8; border-radius:8px; padding:10px; margin-bottom:12px;';
      box.innerHTML = `
        <div style="color:#38bdf8; font-weight:bold; margin-bottom:6px; font-size:13px;">📝 إضافة درس جديد للحافلة</div>
        <input type="text" id="inp-lesson-title" placeholder="عنوان الدرس..." style="width:100%; box-sizing:border-box; padding:6px; background:#0f172a; color:#fff; border:1px solid #334155; border-radius:4px; margin-bottom:6px; font-size:12px;">
        <textarea id="inp-lesson-body" rows="3" placeholder="نص الدرس كاملاً..." style="width:100%; box-sizing:border-box; padding:6px; background:#0f172a; color:#fff; border:1px solid #334155; border-radius:4px; margin-bottom:6px; font-size:12px;"></textarea>
        <button id="btn-save-new-lesson" class="btn btn-primary" style="width:100%; padding:6px; font-size:12px;">حفظ ونشر الدرس 📢</button>
      `;
      lContainer.parentNode.insertBefore(box, lContainer);
      document.getElementById('btn-save-new-lesson').onclick = function() {
        const title = document.getElementById('inp-lesson-title').value.trim();
        const body = document.getElementById('inp-lesson-body').value.trim().replace(/\n/g, '<br>');
        if (!title || !body) return alert('يرجى كتابة العنوان والمحتوى');
        if (typeof lessons !== 'undefined') {
          lessons.unshift({ title, content: body, category: 'أخلاق', badge: 'badge-purple', time: '⏱ وقت الإلقاء: دقيقتان إلى 3 دقائق' });
          if (typeof renderLessons === 'function') renderLessons('all');
        }
        document.getElementById('inp-lesson-title').value = '';
        document.getElementById('inp-lesson-body').value = '';
        alert('تمت إضافة الدرس بنجاح!');
      };
    }

    // كرت إضافة المزارات والقصص
    const pContainer = document.getElementById('places-container');
    if (pContainer && !document.getElementById('box-add-place')) {
      const box = document.createElement('div');
      box.id = 'box-add-place';
      box.style.cssText = 'background:#1e293b; border:1px solid #10b981; border-radius:8px; padding:10px; margin-bottom:12px;';
      box.innerHTML = `
        <div style="color:#10b981; font-weight:bold; margin-bottom:6px; font-size:13px;">📍 إضافة مزار أو قصة جديدة</div>
        <div style="display:flex; gap:6px; margin-bottom:6px;">
          <select id="inp-place-city" style="background:#0f172a; color:#fff; border:1px solid #334155; border-radius:4px; padding:6px; font-size:12px;">
            <option value="مكة المكرمة والمشاعر">مكة المكرمة</option>
            <option value="المدينة المنورة">المدينة المنورة</option>
          </select>
          <input type="text" id="inp-place-title" placeholder="اسم المزار..." style="flex:1; padding:6px; background:#0f172a; color:#fff; border:1px solid #334155; border-radius:4px; font-size:12px;">
        </div>
        <textarea id="inp-place-story" rows="3" placeholder="قصة وسرد المزار..." style="width:100%; box-sizing:border-box; padding:6px; background:#0f172a; color:#fff; border:1px solid #334155; border-radius:4px; margin-bottom:6px; font-size:12px;"></textarea>
        <button id="btn-save-new-place" class="btn btn-primary" style="width:100%; padding:6px; font-size:12px; background:#059669;">حفظ المزار 📍</button>
      `;
      pContainer.parentNode.insertBefore(box, pContainer);
      document.getElementById('btn-save-new-place').onclick = function() {
        const city = document.getElementById('inp-place-city').value;
        const title = document.getElementById('inp-place-title').value.trim();
        const story = document.getElementById('inp-place-story').value.trim().replace(/\n/g, '<br>');
        if (!title || !story) return alert('يرجى ملء اسم المزار وقصته');
        if (typeof places !== 'undefined') {
          places.unshift({ city, title, story });
          if (typeof renderPlaces === 'function') renderPlaces('all');
        }
        document.getElementById('inp-place-title').value = '';
        document.getElementById('inp-place-story').value = '';
        alert('تمت إضافة المزار بنجاح!');
      };
    }
  }

  // فحص وتشغيل دوري مستمر لضمان العمل مع تبديل التبويبات
  setInterval(function() {
    fixHotelPickerButton();
    setupBroadcastBar();
    setupArchiveFloatingBtn();
    setupCrudForms();
  }, 1000);

})();
