'use strict';

// prettier-ignore

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

class Workout {
  //feilds
  date = new Date();
  id = (Date.now() + '').slice(-10);
  clicks = 0;

  constructor(coords, distance, duration) {
    this.coords = coords; // [lat , lng]
    this.distance = distance; // in miles
    this.duration = duration; // in min
  }

  _setDateDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }

  click() {
    this.clicks++;
  }
}

class Running extends Workout {
  type = 'running'; // same as this.type = running
  constructor(coords, distance, duration, steps) {
    super(coords, distance, duration);
    this.steps = steps;
    this.clacPace();
    this._setDateDescription();
  }

  clacPace() {
    // min/mi
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevation) {
    super(coords, distance, duration);
    this.elevation = elevation;
    this.claclSpeed();
    this._setDateDescription();
  }

  claclSpeed() {
    // mi/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

///////////////////////////////////////////////////////
//Application arcitecture

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputSteps = document.querySelector('.form__input--steps');
const inputElevation = document.querySelector('.form__input--elevation');

class App {
  #map; //private properties defined only in this object
  #mapEvent;
  #workouts = [];
  #mapZoomLvl = 13;

  constructor() {
    //get data from local storage
    this._getLocalStorage();

    //get usuers position
    this._getPosition(); //constructor is executed when page loads

    // attach event handlers
    form.addEventListener('submit', this._newWorkout.bind(this)); //'this' on event handler function will always point to the DOM element
    //toggles steps and elevation based on the form type
    inputType.addEventListener('change', this._toggleWorkoutType);
    containerWorkouts.addEventListener('click', this._moveToMarker.bind(this));
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

    this.#map = L.map('map').setView(coords, this.#mapZoomLvl);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    //handles clicks on map
    this.#map.on('click', this._showForm.bind(this));

    this.#workouts.forEach(work => {
      this._renderWorkoutMarker(work);
    });
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus(); // focus() makes the mouse load here
  }

  _hideForm() {
    //empty inputs
    inputDistance.value =
      inputDuration.value =
      inputSteps.value =
      inputElevation.value =
        '';

    form.classList.add('hidden');
    console.log(form);
  }

  _toggleWorkoutType() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden'); //closest selects parents class
    inputSteps.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    const validInputsHelper = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp)); //... converts number to array, .every checks if the inputs pass the following condition
    const isPositiveHelper = (...inputs) => inputs.every(inp => inp > 0);

    e.preventDefault(); //prevents page from reloading. Form deauflt behavior reloads after submitting :(

    //get data from form
    const type = inputType.value;
    const distance = +inputDistance.value; // '+' converts string to number
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng; //destructuring returns object
    let workout;

    // if workout running --> create running object
    if (type === 'running') {
      const steps = +inputSteps.value;
      // check if data is valid
      if (
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(steps)
        !validInputsHelper(distance, duration, steps) ||
        !isPositiveHelper(distance, duration, steps)
      )
        return alert(
          'All inputs have to be filled in and with positive numbers'
        );

      workout = new Running([lat, lng], distance, duration, steps);
    }
    // if workout cycling --> create cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      // check if data is valid
      if (
        !validInputsHelper(distance, duration, elevation) ||
        !isPositiveHelper(distance, duration)
      )
        return alert(
          'All inputs have to be filled in and with positive numbers'
        );

      workout = new Cycling([lat, lng], distance, duration, elevation);
    }
    // add new object workout to array
    this.#workouts.push(workout);
    console.log(workout);

    //render workout on map as a marker
    this._renderWorkoutMarker(workout);

    //render workout on list
    this._renderWorkout(workout);

    //clears input feilds + hides form
    this._hideForm();

    // store workouts in local storage.
    this._setLocalStorage();
  }

  _renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`, //custom css class
        })
      )
      .setPopupContent(phrases())
      .openPopup();
  }

  _moveToMarker(e) {
    const workoutElement = e.target.closest('.workout');
    console.log(workoutElement);

    if (!workoutElement) return;

    const workout = this.#workouts.find(
      work => work.id === workoutElement.dataset.id
    );
    console.log(workout);

    //this is in leaflet documentation
    this.#map.setView(workout.coords, this.#mapZoomLvl, {
      animate: true,
      pan: {
        duration: 1,
      },
    });

    //using this public interface
    // workout.click();
  }

  _renderWorkout(workout) {
    let html = `
        <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
            }</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>`;

    if (workout.type === 'running')
      html += `<div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.steps}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>`;

    if (workout.type === 'cycling')
      html += `  <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevation}</span>
            <span class="workout__unit">m</span>
          </div>`;

    form.insertAdjacentHTML('afterend', html);
  }

  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts')); // parse turns JSON string into object
    console.log(data);

    if (!data) return;

    this.#workouts = data;

    this.#workouts.forEach(work => {
      this._renderWorkout(work);
    });
  }
}

const app = new App();
