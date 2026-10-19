// تحديد موقع الفندق بالنقر المباشر على الخريطة
let hotelPickerActive = false;
let hotelPickMarker = null;

function enableHotelMapPicker() {
  if (typeof map === 'undefined' || !map) {
    alert('يرجى فتح قسم الخريطة أولاً');
    return;
  }
  hotelPickerActive = true;
  const statusElem = document.getElementById('picker-status');
  const btnElem = document.getElementById('btn-pick-hotel');
  
  if (statusElem) statusElem.style.display = 'block';
  if (btnElem) {
    btnElem.style.background = '#eab308';
    btnElem.innerText = '⏳ انقر على موقع الفندق في الخريطة الآن...';
  }

  const mapContainer = document.getElementById('map');
  if (mapContainer) mapContainer.scrollIntoView({ behavior: 'smooth' });

  map.once('click', function(e) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;
    const cityInput = document.getElementById('guide-hotel-city');
    const nameInput = document.getElementById('guide-hotel-name');
    
    const city = cityInput ? cityInput.value : 'مكة';
    const hotelName = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : ('فندق الإقامة - ' + city);

    if (hotelPickMarker) {
      map.removeLayer(hotelPickMarker);
    }
    hotelPickMarker = L.marker([lat, lng]).addTo(map).bindPopup('🏨 ' + hotelName).openPopup();

    if (typeof serverHotels !== 'undefined') {
      serverHotels[city] = { name: hotelName, lat: lat, lng: lng };
    }

    if (typeof saveHotel === 'function') {
      saveHotel();
    }

    hotelPickerActive = false;
    if (statusElem) statusElem.style.display = 'none';
    if (btnElem) {
      btnElem.style.background = '#10b981';
      btnElem.innerText = '✅ تم تحديد الفندق (' + lat.toFixed(4) + ', ' + lng.toFixed(4) + ')';
    }
    alert('تم تعيين وحفظ موقع ' + hotelName + ' بنجاح من الخريطة!');
  });
}
