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

let map;
let mapEvent;
let workouts = [];

const greenIcon = new L.Icon({
      iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
const orangeIcon = new L.Icon({
      iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

class Workout {
	date = new Date();
	id = (Date.now() + '').slice(-10);
	
	constructor(coords, distance, duration) {
		this.coords = coords;
		this.distance = distance;
		this.duration = duration;
	}
}

class Running extends Workout {
	type = 'Running';
	constructor(coords, distance, duration, cadence){
		super(coords, distance, duration);
		this.cadence = cadence;
		this.calcPace();
		this.setDescription();
	}
	calcPace(){
		this.pace1 = this.duration / this.distance;
		this.pace = this.pace1.toFixed(2);
		return this.pace;
	}
	setDescription(){
		this.description = `${this.type} on ${this.date.toDateString()}`;
	}
}

class Cycling extends Workout {
	type = 'Cycling';
	constructor(coords, distance, duration, elevationGain) {
		super(coords, distance, duration);
		this.elevation = elevationGain;
		this.calcSpeed();
		this.setDescription();
	}
	calcSpeed(){
		this.speed1 = this.distance / (this.duration/60);
		this.speed = this.speed1.toFixed(2);
		return this.speed;
	}
	setDescription(){
		this.description = `${this.type} on ${this.date.toDateString()}`;
	}
}

function running_html(workout){
	let html;
	html = `<li class="workout workout--running" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">🏃</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱️</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⚡</span>
            <span class="workout__value">${workout.pace}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>`;
	return html;
}

function cycling_html(workout){
	let html;
	html = `<li class="workout workout--cycling" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">🚴‍♀️‍</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱️</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⚡</span>
            <span class="workout__value">${workout.speed}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevation}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>`;
	return html;
}

function running_marker(lat,lng,workout){
	L.marker([lat,lng],{icon: greenIcon}).addTo(map)
			
	.bindPopup(L.popup({
				maxWidth:250,
				minWidth:100,
				autoClose:false,
				closeOnClick:false,
				className:'running-popup',
	})
	)
	.setPopupContent('Workout<br/>' + workout.description)
	.openPopup();
}

function cycling_marker(lat,lng,workout){
	L.marker([lat,lng], {icon:orangeIcon,}).addTo(map)
	.bindPopup(L.popup({
				maxWidth:250,
				minWidth:100,
				autoClose:false,
				closeOnClick:false,
				className:'cycling-popup',
			})
			)
	.setPopupContent('Workout<br/>' + workout.description)
	.openPopup();
}

navigator.geolocation.getCurrentPosition(
	function (position){
		//console.log(position);
		const latitude = position.coords.latitude;
		const longitude = position.coords.longitude;
		//console.log('https://www.google.com/maps/@'+latitude+','+longitude+',15z');
		const coords = [latitude, longitude];
		map = L.map('map').setView(coords, 13);
		//console.log(map);
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
		
		const data = JSON.parse(localStorage.getItem('workouts'));
		if (data) {
			workouts = data;
			console.log(data);
		}
		
		for (let workout of workouts) {
		let lat = workout.coords[0];
		let lng = workout.coords[1];
		let html;
		if (workout.type === 'Running'){
			html = running_html(workout);
			running_marker(lat,lng, workout);
		} else if (workout.type === 'Cycling'){
			html = cycling_html(workout);
			cycling_marker(lat,lng,workout);
		}
		form.insertAdjacentHTML('afterend',html);
	}
		
		map.on('click', function(mapE) {
			mapEvent=mapE;
			form.classList.remove('hidden');
			inputDistance.focus();
		})
	},
	function (){
		alert('Could not get position');
	}
);

//<span class="workout__icon">🚴‍</span>
//<span class="workout__icon">&#x26F0</span>


form.addEventListener('submit',function(){
	const lat= mapEvent.latlng.lat;
	const lng= mapEvent.latlng.lng;
	const type = inputType.value;
	for (let workout of workouts) {
	if (type === 'running'){
		running_marker(lat,lng, workout);
		}
	else{
		cycling_marker(lat,lng,workout);
		}
}});

form.addEventListener('submit', function(e){
	e.preventDefault();
	const type = inputType.value;
	const distance = Number(inputDistance.value);
	const duration = Number(inputDuration.value);
	const lat = mapEvent.latlng.lat;
	const lng = mapEvent.latlng.lng;
	let workout;
	let html;
	
	if (type === 'running'){
		const cadence = Number(inputCadence.value);
		
		workout = new Running([lat,lng],distance,duration,cadence);
	    html = running_html(workout);
	}
	
	if (type === 'cycling'){
		const elevation = Number(inputElevation.value);
		
		workout = new Cycling([lat,lng],distance,duration,elevation);
		html = cycling_html(workout);
	}
	
	workouts.push(workout);
	form.insertAdjacentHTML('afterend',html);
	localStorage.setItem('workouts', JSON.stringify(workouts));
	form.reset();
})

inputType.addEventListener('change',function(){
	inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
	inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
	console.log(document.getElementsByClassName('form__input')[3]);
    document.getElementsByClassName('form__input')[4].setAttribute("required","");
})

containerWorkouts.addEventListener('click', function (e){
	const workoutEl = e.target.closest(".workout");
	if (!workoutEl) return;
	const workout = workouts.find((work) => work.id === workoutEl.dataset.id);
	map.setView(workout.coords, 13, {
		animate:true,
		pan:{
			duration:1,
		},
	});
});
