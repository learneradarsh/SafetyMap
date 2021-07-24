'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerAlerts = document.querySelector('.warnings');
const inputRiskType = document.querySelector('.form__input--type');
const inputTime = document.querySelector('.form__input--time');
const inputIssue = document.querySelector('.form__input--issue');
const resetDataBtn = document.querySelector('#resetData');
let map, mapPosition;
const mapZoomLevel = 17;

const dataStore = [];

const loadMap = () => {
  navigator.geolocation.getCurrentPosition(
    function (position) {
      const coords = [position.coords.latitude, position.coords.longitude];
      map = L.map('map').setView(coords, mapZoomLevel);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      map.on('click', function (mapPos) {
        mapPosition = mapPos;
        form.classList.remove('hidden');
      });
      const isLocalStrDataExist = _getAlertListFromLocalStr();
      if (isLocalStrDataExist) {
        dataStore.push(...isLocalStrDataExist);
        dataStore.forEach(data => {
          renderAlertsOnSideBar(data);
          createSpotOnMap(data);
        });
      }
    },
    function () {
      console.log('Could not get position');
    }
  );
};

const createSpotOnMap = alertData => {
  inputTime.value = inputIssue.value = '';
  L.marker([...alertData.coords])
    .addTo(map)
    .bindPopup(
      L.popup({
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: alertData.risk === 'high' ? 'high-popup' : 'mediate-popup',
      })
    )
    .setPopupContent(
      `
        ${alertData.risk} - ${alertData.timeSlot}
        Description: ${alertData.issue}
    `
    )
    .openPopup();
};

const renderAlertsOnSideBar = alert => {
  let html = `
    <li class="warning warning--${alert.risk}" data-id="${alert.id}">
    <h2 class="warning__title">👉${alert.issue}</h2>
    <div class="warning__details">
      <span class="warning__icon">${
        alert.risk === 'high' ? '🔴 High' : '🚫Mid'
      }</span>
      <span class="warning__value">⏱${alert.timeSlot}</span>
    </div>
  </li>
    `;

  form.insertAdjacentHTML('afterend', html);
};

const moveToWarningPointer = e => {
  const warningEl = e.target.closest('.warning');
  if (warningEl === null) return;
  const warning = dataStore.find(w => w.id == warningEl.dataset.id);

  map.setView(warning.coords, mapZoomLevel, {
    animate: true,
    pan: {
      duration: 1,
    },
  });
};

const _storeDataInLocalStr = alertList => {
  localStorage.setItem('alertList', JSON.stringify(alertList));
};

const _getAlertListFromLocalStr = () => {
  const data = JSON.parse(localStorage.getItem('alertList'));
  if (!data) return;
  return data;
};

const _resetData = () => {
  localStorage.removeItem('alertList');
  window.location.reload();
};

form.addEventListener('submit', function (event) {
  event.preventDefault();
  if (
    inputRiskType.value === '' ||
    inputIssue.value === '' ||
    inputTime.value === ''
  ) {
    alert('Please fill all info');
    return;
  }
  const locationData = {
    id: Date.now(),
    risk: inputRiskType.value,
    timeSlot: inputTime.value,
    issue: inputIssue.value,
    dateAndTime: Date.now(),
    coords: [mapPosition.latlng.lat, mapPosition.latlng.lng],
  };
  dataStore.push(locationData);
  _storeDataInLocalStr(dataStore);
  createSpotOnMap(locationData);
  renderAlertsOnSideBar(locationData);
  form.classList.add('hidden');
});

containerAlerts.addEventListener('click', moveToWarningPointer);

resetDataBtn.addEventListener('click', _resetData);

const runApplication = () => {
  if (navigator.geolocation) {
    loadMap();
  }
};

runApplication();
