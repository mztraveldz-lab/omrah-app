// omrah_features.js - الميزات الإضافية بدون المساس بكود التطبيق الأصلي

(function() {
  console.log("Omrah Features Loaded Successfully");

  // 1. نظام إغلاق الشريط الأحمر والاحتفاظ بسجل التعميمات
  function setupBroadcastFeatures() {
    const banner = document.getElementById('broadcast-banner');
    if (!banner) return;

    // إضافة زر الإغلاق للشريط إن لم يكن موجوداً
    if (!document.getElementById('btn-close-broadcast')) {
      const closeBtn = document.createElement('button');
      closeBtn.id = 'btn-close-broadcast';
      closeBtn.innerHTML = '✕';
      closeBtn.style.cssText = 'position:absolute; left:12px; top:50%; transform:translateY(-50%); background:rgba(0,0,0,0.3); border:none; color:#fff; border-radius:50%; width:26px; height:26px; cursor:pointer; font-weight:bold; font-size:12px;';
      closeBtn.onclick = function(e) {
        e.stopPropagation();
        banner.style.display = 'none';
        const currentText = banner.innerText;
        localStorage.setItem('dismissed_broadcast', currentText);
      };
      banner.style.position = 'relative';
      banner.appendChild(closeBtn);
    }

    // مراقبة تغيير نص التعميم لحفظه في السجل
    const observer = new MutationObserver(function() {
      const text = banner.innerText.replace('✕', '').trim();
      if (!text) return;

      const lastDismissed = localStorage.getItem('dismissed_broadcast');
      if (lastDismissed && lastDismissed.includes(text)) {
        banner.style.display = 'none';
      }

      // حفظ في الأرشيف مع الوقت والتاريخ
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
    const topBar = document.querySelector('.top-bar') || document.body;
    if (document.getElementById('btn-show-archive')) return;

    const archiveBtn = document.createElement('button');
    archiveBtn.id = 'btn-show-archive';
    archiveBtn.innerHTML = '📜 سجل التعميمات';
    archiveBtn.style.cssText = 'position:fixed; bottom:20px; left:20px; z-index:999; background:#0284c7; color:#fff; border:none; padding:8px 14px; border-radius:20px; font-weight:bold; font-size:12px; box-shadow:0 4px 10px rgba(0,0,0,0.4); cursor:pointer;';
    
    archiveBtn.onclick = function() {
      showArchiveModal();
    };
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

  // تشغيل التهيئة عند اكتمال تحميل الصفحة
  window.addEventListener('DOMContentLoaded', function() {
    setupBroadcastFeatures();
    setupArchiveButton();
  });

  // إعادة التحقق بعد فترة لضمان وجود العناصر التي تنشأ ديناميكياً
  setTimeout(function() {
    setupBroadcastFeatures();
    setupArchiveButton();
  }, 2000);

})();
