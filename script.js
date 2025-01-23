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

const randomPhrases = function (str) {
  return function () {
    const randomIndex = Math.floor(Math.random() * str.length);
    return str[randomIndex];
  };
};

const phrases = randomPhrases([
  'You selected a new place to workout!',
  'New workout location selected 💪',
  'This looks like a good stop to break a sweat 🚴',
  'Sweat is just fat crying.',
  'Push yourself because no one else is going to do it for you.',
  "The only bad workout is the one that didn't happen.",
]);

if (navigator.geolocation)
  navigator.geolocation.getCurrentPosition(
    function (position) {
      const { latitude } = position.coords;
      const { longitude } = position.coords;

      const coords = [latitude, longitude];

      const map = L.map('map').setView(coords, 13);
      // console.log(map);

      L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      map.on('click', function (mapEvent) {
        console.log(mapEvent);
        const { lat, lng } = mapEvent.latlng;
        console.log(lat, lng);

        L.marker([lat, lng])
          .addTo(map)
          .bindPopup(
            L.popup({
              autoClose: false,
              closeOnClick: false,
              className: 'running-popup', //custom css class
            })
          )
          .setPopupContent(phrases())
          .openPopup();
      });
    },
    function () {
      alert('Could not locate your position');
    }
  );
