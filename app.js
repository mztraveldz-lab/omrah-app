// عنوان سيرفر التتبع المباشر (VPS)
const SERVER_URL = "http://169.58.26.43:3000";

let map;
let userMarker;
let pilgrimMarkers = {};

// بيانات المستخدم المحفوظة
let currentUser = JSON.parse(localStorage.getItem('omrah_user') || 'null');

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    if (!currentUser) {
        showRegisterModal();
    } else {
        startTracking();
    }

    if (document.getElementById('map')) {
        map = L.map('map').setView([21.4225, 39.8262], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© MZ Travel'
        }).addTo(map);
    }
}

// طلب اسم ورقم المعتمر عند أول فتح
function showRegisterModal() {
    const name = prompt("مرحباً بك في رفيق المعتمر\nالرجاء إدخال اسمك الكريم:");
    if (name) {
        const phone = prompt("الرجاء إدخال رقم هاتفك (أو الواتساب):") || "";
        currentUser = {
            id: 'user_' + Date.now(),
            name: name,
            phone: phone
        };
        localStorage.setItem('omrah_user', JSON.stringify(currentUser));
        
        fetch(`${SERVER_URL}/api/pilgrims/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentUser)
        }).catch(err => console.log('تعذر الاتصال بالسيرفر'));

        startTracking();
    }
}

// بدء إرسال الموقع الجغرافي دورياً للسيرفر
function startTracking() {
    if (!navigator.geolocation) {
        alert("تحديد الموقع غير مدعوم في هذا الجهاز");
        return;
    }

    navigator.geolocation.getCurrentPosition(sendLocation, handleError, { enableHighAccuracy: true });
    
    // إرسال التحديث كل 20 ثانية للسيرفر
    setInterval(() => {
        navigator.geolocation.getCurrentPosition(sendLocation, handleError, { enableHighAccuracy: true });
    }, 20000);
}

function sendLocation(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    if (map) {
        if (!userMarker) {
            userMarker = L.marker([lat, lng]).addTo(map).bindPopup("موقعي الحالي").openPopup();
            map.setView([lat, lng], 16);
        } else {
            userMarker.setLatLng([lat, lng]);
        }
    }

    if (currentUser) {
        fetch(`${SERVER_URL}/api/pilgrims/location`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: currentUser.id,
                name: currentUser.name,
                phone: currentUser.phone,
                lat: lat,
                lng: lng
            })
        }).catch(err => console.log('خطأ في إرسال الموقع'));
    }
}

function handleError(error) {
    console.warn(`خطأ في تحديد الموقع: ${error.message}`);
}

// زر الطوارئ SOS
function triggerSOS() {
    if (!navigator.geolocation) {
        window.open(`https://wa.me/213555000000?text=${encodeURIComponent("نداء استغاثة من معتمر!")}`);
        return;
    }

    navigator.geolocation.getCurrentPosition((pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const name = currentUser ? currentUser.name : "معتمر";
        const msg = `🚨 *نداء استغاثة عاجل (SOS)*\nالاسم: ${name}\nالموقع المباشر:\nhttps://maps.google.com/?q=${lat},${lng}`;
        window.open(`https://wa.me/213555000000?text=${encodeURIComponent(msg)}`);
    });
}

// دخول المرشد بالرمز 7788
function openGuideDashboard() {
    const pin = prompt("أدخل رمز المرشد السري:");
    if (pin === "7788") {
        alert("مرحباً بك أيها المرشد. جاري جلب مواقع المعتمرين المتصلين...");
        fetchPilgrimsForGuide();
        setInterval(fetchPilgrimsForGuide, 10000);
    } else {
        alert("رمز المرور غير صحيح!");
    }
}

// جلب وتحديث مواقع كل المعتمرين على خريطة المرشد
function fetchPilgrimsForGuide() {
    fetch(`${SERVER_URL}/api/pilgrims`)
        .then(res => res.json())
        .then(pilgrims => {
            pilgrims.forEach(p => {
                if (!p.lat || !p.lng) return;

                if (pilgrimMarkers[p.id]) {
                    pilgrimMarkers[p.id].setLatLng([p.lat, p.lng]);
                } else {
                    const marker = L.marker([p.lat, p.lng], {
                        title: p.name
                    }).addTo(map);
                    marker.bindPopup(`<b>${p.name}</b><br>هاتف: ${p.phone || 'غير مسجل'}`);
                    pilgrimMarkers[p.id] = marker;
                }
            });
        })
        .catch(err => console.log("خطأ في جلب بيانات المعتمرين"));
}
