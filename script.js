'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputSteps = document.querySelector('.form__input--steps');
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

let map, mapEvent; // turns 'in block' defined functions into global functions

class App {
  #map; //private property defined only in this object
  #mapEvent;
  constructor() {
    this._getPosition(); //constructor is executed when page loads

    form.addEventListener('submit', this._newWorkout.bind(this)); //'this' on event handler function will always point to the DOM element

    //toggles steps and elevation based on the form type
    inputType.addEventListener('change', this._toggleWorkoutType.bind(this));
  }
  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this), //needs to be treated as a method call not a function call
        function () {
          alert('Could not get your position');
        }
      );
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    //handles clicks on map
    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus(); // focus() makes the mouse load here
  }

  _toggleWorkoutType() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden'); //closest selects parents class
    inputSteps.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    e.preventDefault(); //prevents page from reloading. Form deauflt behavior reloads after submitting :(

    //clears input feilds
    inputDistance.value =
      inputDuration.value =
      inputSteps.value =
      inputElevation.value =
        '';

    //displays marker
    const { lat, lng } = this.#mapEvent.latlng;
    console.log(lat, lng);

    L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          autoClose: false,
          closeOnClick: false,
          className: 'running-popup', //custom css class
        })
      )
      .setPopupContent(phrases())
      .openPopup();
  }
}

const app = new App();
