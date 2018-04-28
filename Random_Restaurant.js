//DOM element
let distance = document.querySelector('#distance');
let distanceValue = document.querySelector('#distanceValue');
let start = document.querySelector('#start');
let answer = document.querySelector('.answer h1');
let phone = document.querySelector('.phone div');
let address = document.querySelector('.address div');
let change = document.querySelector('.change');
let loading = document.querySelector('.loading');
let left = document.querySelector('.left');
let main = document.querySelector('.main');
let leftBar = document.querySelector('ul');
let leftBarItem = document.querySelectorAll('li');


let myLatLng, map, service;
let getDetailList = [];
let restaurantList = [];
let intervalID;
let progress = document.querySelector('.progress');
let flag = true;

function setMap() {
	map = new google.maps.Map(document.querySelector('.map'), {
		zoom: 15
	});
	service = new google.maps.places.PlacesService(map);
}

function findNearRestaurant(LatLng, dis) {
	console.log('3.findNearRestaurant');
	let request = {
		location: LatLng,
		radius: `${dis}`,
		type: ['restaurant'],
		openNow: true
	}
	service.radarSearch(request, handleSerch);
};

function handleSerch(results, status) {
	console.log('4.handleSerch');
		if (status == google.maps.places.PlacesServiceStatus.OK) {
			getDetailList.length = 0;
			restaurantList.length = 0;
			handleProgress();
			results.forEach(result => {
				let request = {
					placeId: result.place_id
				}
				getDetailList.push(request);
			});
			//prevent api flow limit
			console.log('5.getName');
			intervalID = setInterval(function() {
				if (restaurantList.length < getDetailList.length) {
					service.getDetails(getDetailList[restaurantList.length], handleRestaurant);
					handleProgress();
					loading.style.display = 'block';
				} else {
					handleProgress();
					loading.style.display = 'none';
					clearInterval(intervalID);
					randomPick(restaurantList);
					handleLeftBar();
					console.log('Done:stopinterval');
				}
			}, 500);
		} else {
			console.log('radar search failed!');
			if (status == google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
				changeAnswer('所有店家都休息中');
				console.warn(status);
			} else {
				console.error(status);
			}
		}
}

function handleProgress() {
	if (getDetailList.length === 0) {
		progress.style.flexBasis = '0%';
		loading.style.display = 'block';
	} else {
		let basis = (restaurantList.length/getDetailList.length)*100;
		progress.style.flexBasis = basis+'%';
	}
}

function handleRestaurant(results, status) {
	if (status == google.maps.places.PlacesServiceStatus.OK) {
		let info = {
			id: results.place_id,
			name: results.name,
			address: results.formatted_address,
			phone: results.formatted_phone_number,
		}
		restaurantList.push(info);
	} else {
		console.error('get detail failed!');
		console.log(status);
	}
}

function getPosition(dis) {
	//Geolocation API
	console.log('2.getPosition');
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition((position) => {
  			myLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
  			map.setCenter(myLatLng);
  			findNearRestaurant(myLatLng, dis);
		}, function() {
  			console.log('fail!');
		});
	} else {
		console.error('get position failed!')
	}
}

function randomPick(restaurant) {
	let random = Math.round(Math.random()*restaurant.length);
	if (random === restaurant.length) {
		random = 0;
	}
	changeAnswer(restaurant[random].name, restaurant[random].phone, restaurant[random].address);
}

function changeAnswer(ans_, phone_ = '', address_ = '') {
	answer.innerHTML = ans_;
	phone.innerHTML = phone_;
	address.innerHTML = address_;
}

function handleSlider() {
	distanceValue.innerHTML = ` ${this.value} `;
}

function clearLeftBar() {
	leftBar.innerHTML = '<li class="title" id="title">營業中餐廳</li>';
}

function handleLeftBar() {
	for (let i = 0; i < restaurantList.length; i++) {
		newListItem = document.createElement('li');
		newListItem.id = i;
		newListItem.innerText = restaurantList[i].name;
		leftBar.appendChild(newListItem);
	}
	setLeftHeight();
	leftBarClick();
}

function setLeftHeight() {
	if (window.innerWidth <= 540) {
		left.style.top = (main.clientHeight*1.1)+'px';
		left.style.height = 'auto';
		if (window.innerHeight-main.clientHeight*1.1 > left.clientHeight) {
			left.style.height = (window.innerHeight-main.clientHeight*1.1)+'px';
		}
	} else {
		left.style.top = '0';
		if (main.clientHeight > window.innerHeight) {
			left.style.height = main.clientHeight+'px';
		} else {
			left.style.height = window.innerHeight+'px';
		}
	}
}

function leftBarClick() {
	leftBarItem = document.querySelectorAll('li');
	leftBarItem.forEach((item) => {
		item.addEventListener('click', () => {
			if (item.id === 'title') {
			} else {
				changeAnswer(restaurantList[item.id].name, restaurantList[item.id].phone, restaurantList[item.id].address);
			}
		});
	});
}

setMap();
leftBarClick();
setLeftHeight();
distance.addEventListener('change', handleSlider);
distance.addEventListener('mousemove', handleSlider);
window.addEventListener('resize', setLeftHeight);
window.addEventListener("orientationchange", setLeftHeight);
change.addEventListener('click', () => {
	randomPick(restaurantList);
});
start.addEventListener('click', () => {
	clearInterval(intervalID);
	console.log('Restart:stopinterval', intervalID);
		console.log('1.addEventListener');
		changeAnswer('搜尋中');
		clearLeftBar();
	getPosition(distance.value);
});