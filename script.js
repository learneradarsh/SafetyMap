'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
let map, mapPosition;

if(navigator.geolocation) {
   navigator.geolocation.getCurrentPosition(function(position) {
       const coords = [position.coords.latitude, position.coords.longitude];
       map = L.map('map').setView(coords, 17);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

       map.on('click', function(mapPos) {
            mapPosition = mapPos;
            form.classList.remove('hidden');
        });
   }, function() {
       console.log('Could not get position');
   })
}

form.addEventListener('submit', function(event) {
    event.preventDefault();

    inputDistance.value = inputDuration.value = '';
    const {lat, lng} = mapPosition.latlng; 
            L.marker([lat, lng]).addTo(map)
            .bindPopup(L.popup({
                maxWidth: 250,
                minWidth: 100,
                autoClose: false,
                closeOnClick: false
            }))
            .setPopupContent('WorkOut')
            .openPopup();
});