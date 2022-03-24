function kelvin2celsius(tempKelvins) {
	return Math.round(tempKelvins - 273.15);
}

function kelvin2fahrenheit(tempKelvins) {
	return Math.round((9/5) * (tempKelvins - 273) + 32);
}

function meterPerSecond2MilesPerHour(ms) {
	return Math.round(ms / 0.44704);
}

function meterPerSecond2KiloMetersPerHour(ms) {
	return Math.round(ms * 3.6);
}

function km2mi_r(lenKM){
	let lenMiles = lenKM / 1.609344;
	return Math.round(lenMiles);
}

function meter2kilometer(meters) {
	return Math.round(meters / 1000);
}

function meter2miles(meters) {
	return Math.round(meters / 1609.344);
}

function mbar2hPa_r(pressurembar){
	let pressurehPa = pressurembar;
	return Math.round(pressurehPa);
}

// from UTC to local time 00:00 A
function UTC2LocalTimes(utc) {
	return new Date(utc * 1000).toLocaleTimeString('en-US')
}

//number of minutes passed since the start of day
// 00:00 am
// 00:00 AM
function textTime2mins(timeString){
	let totalMinutes = 0;

	let timeStringSplit = timeString.split(" ");

	let time = timeStringSplit[0];
	let timeSplit = time.split(":");
	let hours = timeSplit[0];
	let minutes = timeSplit[1];

	let meridiem = timeStringSplit[1];

	if(meridiem === "am" || meridiem === "AM"){
		let h = parseInt(hours);
		h = h === 12 ? 0 : h;

		totalMinutes = (h * 60) + parseInt(minutes);
	}
	else if(meridiem === "pm" || meridiem === "PM"){
		totalMinutes = (parseInt(hours) * 60) + parseInt(minutes) + (12 * 60);
	}

	return totalMinutes;
}

function getCurrentTime(){
	let d = new Date();
	let hour = d.getHours();
	let meridiem = hour >= 12 ? "PM" : "AM";

	let currentTime = ((hour + 11) % 12 + 1) + ":" + d.getMinutes() + " " + meridiem;

	return currentTime;
}

function inHrsMins(timeInMins){
	let hrs = Math.round(timeInMins / 60) + " hrs";

	let mins = "";
	if(timeInMins % 60 !== 0){
		mins = " " + Math.round(timeInMins % 60) + " mins";
	}

	return hrs + mins;
}


function getDayProgress(time1, time2){
	let dayProgress = {}

	let sunUpMins = textTime2mins(time1);
	let sunDownMins = textTime2mins(time2);

	let currentTime = getCurrentTime();

	let currentTimeMins = textTime2mins(currentTime);

	if(currentTimeMins < sunUpMins){
		let sunUpIn = sunUpMins - currentTimeMins;
		let sunUpInTime = inHrsMins(sunUpIn);
		dayProgress = {
			"sunUp" : false,
			"sunDown" : false,
			"sunUpIn" : sunUpInTime
		};
	}
	else if(currentTimeMins > sunUpMins && currentTimeMins < sunDownMins){
		let dayProgressInPercent = Math.round((currentTimeMins / (sunDownMins - sunUpMins)) * 100);
		dayProgress = {
			"sunUp" : true,
			"sunDown" : false,
			"dayProgressInPercent" : dayProgressInPercent,
			"time" : currentTime
		};
	}
	else if(currentTimeMins > sunDownMins){
		let sinceSunDownMins = currentTimeMins - sunDownMins;
		let sinceSunDown = inHrsMins(sinceSunDownMins);
		dayProgress = {
			"sunUp" : true,
			"sunDown" : true,
			"sinceSunDown" : sinceSunDown
		};
	}

	return dayProgress;
}

function getRandInt(num){
	let rndArrLen = 1000;
	let rndArr = new Uint32Array(rndArrLen);
	window.crypto.getRandomValues(rndArr);

	let rndArrIndex =  Date.now() % (rndArrLen - 1);

	return rndArr[rndArrIndex] % num;
}

$('#toggleTemp').on('click', function () {
			$('#tempFieldF').toggleClass('hidden');
			$('#tempFieldC').toggleClass('hidden');
});


//get location and send them to
function getWeather(){
	if (!navigator.geolocation){
		console.log("<p>Geolocation is not supported by your browser</p>");
		return;
	}

	function success(position) {
		let latitude  = position.coords.latitude;
		let longitude = position.coords.longitude;
		loadWeather(latitude, longitude, OWM_A_KEY);
	};

	function error() {
		$("#error-diag").removeClass("hidden");
		$("#error-diag").html('<strong>Error!</strong> You need to "Share" your location when prompted. Refresh page to start again.');
	};

	let geoLocOptions = {
		enableHighAccuracy: true
	};

	navigator.geolocation.getCurrentPosition(success, error, geoLocOptions);
}

//when refresh button is clicked
$('#refreshTemp').on('click', getWeather);

//when the document loads
$(document).ready(getWeather);

function loadWeather(latitude, longitude, OWM_A_KEY){
		$.getJSON(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OWM_A_KEY}`, parseWeather);
}

function parseWeather(weatherData){
	const weather = {
		"temp": weatherData.main.temp,
		"low": weatherData.main.temp_min,
		"high": weatherData.main.temp_max,
		"wind" : {
			"speed": weatherData.wind.speed,
			"direction" : weatherData.wind.deg
		},
		"humidity" : weatherData.main.humidity,
		"pressure" : weatherData.main.pressure,
		"visibility" : weatherData.visibility,
		"sunrise": UTC2LocalTimes(weatherData.sys.sunrise),
		"sunset": UTC2LocalTimes(weatherData.sys.sunset),
		"city": weatherData.name,
		"country": weatherData.sys.country,
		"region": '',
		"currently": weatherData.weather[0].description,
		"code": weatherData.weather[0].id,
		"main": weatherData.weather[0].main,
	};

	displayWeather(weather);
}

function displayWeather(weather) {

		//temperatures

			//current
			temp = weather.temp;
			tempTextF = kelvin2fahrenheit(temp)+'&deg;'+ 'F';
			$("#tempFieldF").html(tempTextF);

			tempTextC = kelvin2celsius(temp)+'&deg;'+'C';
			$("#tempFieldC").html(tempTextC);

			//min
			minTemp = weather.low;
			minTempTextF = kelvin2fahrenheit(minTemp) +'&deg;'+ 'F';
			$("#minTempFieldF").html(minTempTextF);

			minTempTextC = kelvin2celsius(minTemp)+'&deg;'+'C';
			$("#minTempFieldC").html(minTempTextC);

			//max
			maxTemp = weather.high;
			maxTempTextF = kelvin2fahrenheit(maxTemp)+'&deg;'+ 'F';
			$("#maxTempFieldF").html(maxTempTextF);

			maxTempTextC = kelvin2celsius(maxTemp)+'&deg;'+'C';
			$("#maxTempFieldC").html(maxTempTextC);

		//wind
			//speed

			windSpeedMPH = meterPerSecond2MilesPerHour(weather.wind.speed);
			windSpeedKMH = meterPerSecond2KiloMetersPerHour(weather.wind.speed);

			windSpeedTextMPH =  windSpeedMPH + " " + "mph";
			windSpeedTextKMH =  windSpeedKMH + " " + "kmh";

			$("#windSpeedFieldMPH").html(windSpeedTextMPH);
			$("#windSpeedFieldKMH").html(windSpeedTextKMH);

			beaufortScale = {
				0: "Calm",
				1: "Light Air",
				2: "Light Breeze",
				3: "Gentle Breeze",
				4: "Moderate Breeze",
				5: "Fresh Breeze",
				6: "Strong Breeze",
				7: "Near Gale",
				8: "Fresh Gale",
				9: "Strong Gale",
				10: "Storm",
				11: "Violent Storm",
				12: "Hurricane Force"
			};

			if(windSpeedKMH < 1){
				beaufortScaleNumber = 0;
			}
			else if(windSpeedKMH >= 1 && windSpeedKMH <=5){
				beaufortScaleNumber = 1;
			}
			else if(windSpeedKMH >= 6 && windSpeedKMH <= 11){
				beaufortScaleNumber = 2;
			}
			else if(windSpeedKMH >= 12 && windSpeedKMH <= 19){
				beaufortScaleNumber = 3;
			}
			else if(windSpeedKMH >= 20 && windSpeedKMH <= 28){
				beaufortScaleNumber = 4;
			}
			else if(windSpeedKMH >= 29 && windSpeedKMH <= 38){
				beaufortScaleNumber = 5;
			}
			else if(windSpeedKMH >= 39 && windSpeedKMH <= 49){
				beaufortScaleNumber = 6;
			}
			else if(windSpeedKMH >= 50 && windSpeedKMH <= 61){
				beaufortScaleNumber = 7;
			}
			else if(windSpeedKMH >= 62 && windSpeedKMH <= 74){
				beaufortScaleNumber = 8;
			}
			else if(windSpeedKMH >= 75 && windSpeedKMH <= 88){
				beaufortScaleNumber = 9;
			}
			else if(windSpeedKMH >= 89 && windSpeedKMH <= 102){
				beaufortScaleNumber = 10;
			}
			else if(windSpeedKMH >= 103 && windSpeedKMH <= 117){
				beaufortScaleNumber = 11;
			}
			else if(windSpeedKMH >= 118){
				beaufortScaleNumber = 12;
			}

			beaufortWindScaleText = beaufortScale[beaufortScaleNumber];
			$("#beaufortWindScaleTextField").html(beaufortWindScaleText);

			beaufortWindScaleClass = "wi wi-wind-beaufort-" + beaufortScaleNumber;
			$("#beaufortWindScaleField").removeClass();
			$("#beaufortWindScaleField").addClass(beaufortWindScaleClass);

			//direction
			//https://en.wikipedia.org/wiki/File:Compass_Rose_English_North.svg

			const directionCodes = new Map();
			directionCodes.set(0, "N");
			directionCodes.set(23, "NNE");
			directionCodes.set(45, "NE");
			directionCodes.set(68, "ENE");
			directionCodes.set(90, "E");
			directionCodes.set(113, "ESE");
			directionCodes.set(135, "SE");
			directionCodes.set(158, "SSE");
			directionCodes.set(180, "S");
			directionCodes.set(203, "SSW");
			directionCodes.set(225, "SW");
			directionCodes.set(248, "WSW");
			directionCodes.set(270, "W");
			directionCodes.set(293, "WNW");
			directionCodes.set(313, "NW");
			directionCodes.set(336, "NNW");

			windAngle = weather.wind.direction;
			let windDirCode = null;

			for (const [key, value] of directionCodes) {
				if (windAngle <= key) {
					windDirCode = value;
					break;
				}
			}


			$("#windDirField").html(windDirCode);


			swingRange = 10;

			let angle1 = windAngle - swingRange;
			let angle2 = windAngle + swingRange;

			swingSpeed = (12/beaufortScaleNumber)*250;

			function rotateElememt(angle1, angle2, swingSpeed) {
				let $elem = $("#windDirSignField");

				$({deg: angle2}).animate({deg: angle1}, {
					duration: swingSpeed,
					step: function(now) {
						$elem.css({
							transform: 'rotate(' + now + 'deg)'
						});
					},
					complete: function(){
						rotateElememt(angle2, angle1, swingSpeed);
					}
				});
			}

			rotateElememt(angle1, angle2, swingSpeed);

		//humidity
			humidityText = weather.humidity;
			$("#humidityField").html(humidityText);

		//pressure
			// hPa = mbar
			pressurembar = weather.pressure;
			pressureTextmbar = Math.round(pressurembar) + " mbar";
			$("#pressureFieldmbar").html(pressureTextmbar);

			pressureTexthPa = Math.round(pressurembar) + " hPa";
			$("#pressureFieldhPa").html(pressureTexthPa);

		//visibility
			visibilityMiles = meter2miles(weather.visibility);
			visibilityTextMiles = visibilityMiles + " miles";
			$("#visibilityFieldMiles").html(visibilityTextMiles);

			visibilityKms = meter2kilometer(weather.visibility);
			visibilityTextKms = visibilityKms + " km";
			$("#visibilityFieldKms").html(visibilityTextKms);
		//sun
			sunriseText = weather.sunrise;
			$("#sunriseField").html(sunriseText);

			sunsetText = weather.sunset;
			$("#sunsetField").html(sunsetText);

			let dayProgress = getDayProgress(sunriseText, sunsetText);

			if(dayProgress.sunUp || dayProgress.sunDown){
				if(dayProgress.sunDown){
					$("#dayProgressBar").removeClass();
					$("#dayProgressBar").addClass("progress-bar progress-bar-info progress-bar-striped");
					$("#dayProgressBar").attr("aria-valuenow", "100");
					$("#dayProgressBar").attr("style", "width:100%");
					$("#dayProgressBar").html("Since Sunset : " + dayProgress.sinceSunDown);
				}
				else{
					$("#dayProgressBar").removeClass();
					$("#dayProgressBar").addClass("progress-bar progress-bar-warning progress-bar-striped");
					$("#dayProgressBar").attr("aria-valuenow", dayProgress.dayProgressInPercent);
					$("#dayProgressBar").attr("style", "width:" + dayProgress.dayProgressInPercent + "%");
					$("#dayProgressBar").html(dayProgress.time);
				}
			}
			else{
					$("#dayProgressBar").removeClass();
					$("#dayProgressBar").addClass("progress-bar progress-bar-success progress-bar-striped");
					$("#dayProgressBar").attr("aria-valuenow", "100");
					$("#dayProgressBar").attr("style", "width:100%");
					$("#dayProgressBar").html("Sunrise In : " + dayProgress.sunUpIn);
			}


		//location
			$("#city").html(weather.city);
			$("#region").html(weather.region);
			$("#country").html(weather.country);

			curWeatherText = weather.currently;
			$("#curWeather").html(curWeatherText);

			//https://chromypics.blogspot.in/
			let wPics = {
				'cloudy' : ['https://2.bp.blogspot.com/-56-7qUkdENk/V72UP6f48-I/AAAAAAAAABI/Y1OZkz05UbsFarmOG33Y-guz_-1ayTnGACEw/s1600/clouds-1571775.jpg',
					'https://3.bp.blogspot.com/-hkbqPzNLjn4/V72UQNv058I/AAAAAAAAABI/RIvCOI5jtyoVzyezoWnt1OTTa0qsfiFMACEw/s1600/sky-1149217.jpg',
					'https://4.bp.blogspot.com/-PueAlfT_fQ0/V72UQ_gbUoI/AAAAAAAAABI/8_HXya3LixA9pl0LJhDCxIFwKrHDaC8ggCEw/s1600/storm-466677.jpg',
					'https://4.bp.blogspot.com/-8KqtLySH6BM/V72UUlltUZI/AAAAAAAAABI/sfGl2xmSkKoM4PXOjSd8H-MyZ89hlciDgCEw/s1600/train-station-1400657.jpg'],
				'day-cloudy' : ['https://4.bp.blogspot.com/-iZEZtghbJxc/V72Un7rP6mI/AAAAAAAAABc/v7kiWE9N1_whFYXeuNbTFn7sBExqKxiIQCEw/s1600/cloudy-day-at-big-muddy-national-wildlife-refuge.jpg',
								'https://4.bp.blogspot.com/-yjY52dgksDM/V72UmlbchjI/AAAAAAAAABc/b2P5n_WEnh8jDAkc1p7xsGCoKwjYcbnqwCEw/s1600/cloudy-fall-day-on-lake.jpg',
								'https://4.bp.blogspot.com/-soiHd5bJ1cw/V72UmeFD9JI/AAAAAAAAABc/lYNNdx2w0YccMEoEjrbAoxjxgsgIXuAGQCEw/s1600/Oklahoma_City_cloudy_day.jpg',
								'https://2.bp.blogspot.com/-iiXcXUglLtY/V72UpUGjkwI/AAAAAAAAABc/N8nqxK_1VXsIF0R3WpcHSnJx8vDZpnFMACEw/s1600/sky-1438092.jpg'],
				'day-haze' : ['https://4.bp.blogspot.com/-lNTvrd4mJoc/V72Xgd9CzLI/AAAAAAAAAB4/RN3JBOTqe9gt7o3_L7RDOX-V2LfvQksJQCLcB/s1600/fog-1565694.jpg',
								'https://1.bp.blogspot.com/-9dbMjVZU1z0/V72XjMW3HxI/AAAAAAAAACA/B9rvCmYJ7vIVHtfHJCnBu6qZtApe8eStQCLcB/s1600/landscape-640668.jpg',
								'https://2.bp.blogspot.com/-5w4CKEqJPtY/V72Xh25TndI/AAAAAAAAAB8/o9HVEDr12mIspBlsqXcFoYUJDrNzPOf2QCLcB/s1600/landscape-731341.jpg'],
				'day-sunny' : ['https://3.bp.blogspot.com/-td2OOw4feE0/V72X3U8ZS4I/AAAAAAAAACQ/H4vXbhVCa-oTNv9qImIhqfB_cOTZ7Q2dQCLcB/s1600/jacksonville-florida-cityscape.jpg',
								'https://1.bp.blogspot.com/-dAb-7VNgOxc/V72X0z0IAfI/AAAAAAAAACI/oTdsw0mSXPY7QZMwp28PUZsGf77CIQgOgCLcB/s1600/leaves-241701.jpg',
								'https://4.bp.blogspot.com/-3JKBhtoAWFg/V72X1WPuF9I/AAAAAAAAACM/2nUY67BNWm0taWHwQ9rKNxfWv4xAgJX3ACLcB/s1600/rest-beach-summer-white-sand-sunny-day.jpg'],
				'dust' : ['https://4.bp.blogspot.com/-9G3nzvABHK4/V72YEB0XwtI/AAAAAAAAACU/-Zimfyus9-o_kI_T8RFD-aoXQZMCJpeCwCLcB/s1600/20090923_-_Dust_Storm_-_Surfers_Paradise_%2528looking_south%2529.JPG',
							'https://1.bp.blogspot.com/-mjWF8AwmAbc/V72YFgJM5lI/AAAAAAAAACY/3vUK_SRt8k461W9AjXB5DXzWdXxta0LdwCLcB/s1600/sandstorm-165332.jpg',
							'https://2.bp.blogspot.com/-bEtxhTobIgk/V72YJ24Oz3I/AAAAAAAAACc/sRLWc0uz2B0YW1Cnn6sTDFf_0NO_U8x4ACLcB/s1600/Sandstorm_of_Longjing_Township_%252CTaichung_County_in_Taiwan.jpg',
							],
				'fog' : ['https://1.bp.blogspot.com/--eqF3UKVFEQ/V72YdKz2pYI/AAAAAAAAACs/4DNoPn1gEkw1gFbZIRCGR_ZGWFvmNPSggCLcB/s1600/country-1209094.jpg',
							'https://2.bp.blogspot.com/-HdDLgEw-Iqg/V72YaNHdmbar/AAAAAAAAACk/xCeC-S9qjCA4Parn3vrP9SXgH_m8EVSIQCLcB/s1600/fishing-1245979.jpg',
							'https://1.bp.blogspot.com/-Uw04IYjFiBM/V72Yc5_b86I/AAAAAAAAACo/euK5zfsJrXUPpuZ9rc4j2J-qZOUjRT-9wCLcB/s1600/morning-mist-1535967.jpg',
							'https://1.bp.blogspot.com/-qVugWFozuHg/V72YfQ2n_WI/AAAAAAAAACw/hm9kYg0okks0eaza-JIIt_vs-gRYB9NhQCLcB/s1600/mountain-1542114.jpg',
							'https://3.bp.blogspot.com/-S9lbDEEjyQo/V72Yhs0_3_I/AAAAAAAAAC0/Sx2lL62-qrosoDRLhHcuREwLsNui9qbIACLcB/s1600/sunset-1209206.jpg'],
				'hail' : ['https://1.bp.blogspot.com/-idOE8joISkE/V72Y36fcpjI/AAAAAAAAAC8/VnsuXOe_GQcannaqb2ddwYpasbsVENHqgCLcB/s1600/bike-717795.jpg',
							'https://2.bp.blogspot.com/-SumVN6Koiyk/V72Y83vZJiI/AAAAAAAAADE/HxBD0oHBjjoIf5Ai3MLVeLLbnk85rsU6QCLcB/s1600/hail-189519.jpg',
							'https://3.bp.blogspot.com/-L45Lgzsi_lg/V72Y8Op0KPI/AAAAAAAAADA/oLOlGk35UJQmvJqXLXoe4WXv56gbiAlQwCLcB/s1600/hailstones-1338886.jpg'],
				'haze' : ['https://2.bp.blogspot.com/-uka5YbaOUHM/V72ZPk6UovI/AAAAAAAAADM/A1j8iyycMLcZBSyNCmYzqeYfSjVXtCStACLcB/s1600/fog-1565694.jpg',
							'https://2.bp.blogspot.com/-NZNduBl8UZw/V72ZRIVpXrI/AAAAAAAAADQ/-EXeLEN0So0K0keEqWTlDUAE-ipdLy5ggCLcB/s1600/landscape-640668.jpg',
							'https://2.bp.blogspot.com/-I7u0vRClnPQ/V72ZTVxrfeI/AAAAAAAAADU/GXFOl3eU4rgeCdRsTy6LyYPumDaFmIYwgCLcB/s1600/landscape-731341.jpg'],
				'hot' : ['https://4.bp.blogspot.com/-VGbA4mBTMDk/V72Zga7fzCI/AAAAAAAAADc/C8PC9TJmxQcsrCKJKgXjM3y8A46ZEAhiwCLcB/s1600/effects-of-climate-change.jpg',
							'https://3.bp.blogspot.com/-kpCy759576U/V72ZdA03YJI/AAAAAAAAADY/dXhAKrF9YAMAa88r7H_eV9Kd3SvadwQIgCLcB/s1600/Morroco-arid-climate.jpg',
							'https://3.bp.blogspot.com/-BZHmhSeMrFY/V72ZxoYdNVI/AAAAAAAAADk/i4-Xm4nbZrs8qGQurjHtCauZk_atSfqqwCLcB/s1600/Val-d%2527Orcia-landscape-1.jpg'],
				'hurricane' : ['https://4.bp.blogspot.com/-mYiSdRF7Cds/V72ah3zdC3I/AAAAAAAAADw/p3cV9LKTgBglDNA7fdSkNUP1E-pyEBtZwCLcB/s1600/hurricanes-927042.jpg',
								'https://2.bp.blogspot.com/-yvF80ZhHwC8/V72ag3-kjoI/AAAAAAAAADs/wqtXjvuzsnIL5Ldj4wq66EcpJVVOF7gugCLcB/s1600/key-west-86025.jpg'],
				'night-clear' : ['https://2.bp.blogspot.com/-5Vty9drR_5M/V72apcaQA8I/AAAAAAAAAD4/AqKfUP7gw6wl9Ovsx-z2nJcJR0vojl8GACLcB/s1600/architecture-2715.jpg',
									'https://1.bp.blogspot.com/-7mBJCB6hw_o/V72ap7p0liI/AAAAAAAAAD8/97oI-UupHJoV363pv862JAyHacvoszA5wCLcB/s1600/night-blue-half-moon.jpg',
									'https://2.bp.blogspot.com/-0H54G9fF_AQ/V72aqjQNTDI/AAAAAAAAAEA/Pk4NqCVSMTYnEJO_kLoCyM1PICRvzxaZQCLcB/s1600/night-sky-523892.jpg'],
				'night-cloudy' : ['https://3.bp.blogspot.com/-x1lLrlOcjss/V72bCxbvdbI/AAAAAAAAAEI/_jIVxyo33RQh3KFnvxkaoVcWFcCeyusTwCLcB/s1600/cloudy-sunset-166665.jpg',
									'https://1.bp.blogspot.com/-JQCGxoG-w0Y/V72bEQdUj7I/AAAAAAAAAEQ/YIDJQrU5fV07Yq-qF1zYnfXoJ64Ulp3_wCLcB/s1600/lake-384575.jpg',
									'https://1.bp.blogspot.com/-h8zvf31_oG8/V72bDcBUD5I/AAAAAAAAAEM/N2vA06q-omEaOaie0-q5vwaAWL1CUiHYQCLcB/s1600/london-1149144.jpg',
									'https://3.bp.blogspot.com/-bw0oBFg9zbw/V72bHmiEqgI/AAAAAAAAAEU/XQwrOCiBkGwUCjrOyxDsbUiIG8ylsr10ACLcB/s1600/texture-699695.jpg',
									'https://3.bp.blogspot.com/-37AgY4HZtgw/V72bIHDy_QI/AAAAAAAAAEY/RwBgOQYPT1sokrJvuyrNdj63sw6bAw52QCLcB/s1600/texture-699701.jpg'],
				'rain' : ['https://3.bp.blogspot.com/-d9CK9l5zLk4/V72bhFCKiNI/AAAAAAAAAEs/P-nLtA6eaWcRmyxdER3zx8GwQWOFkdevgCLcB/s1600/rain-122691.jpg',
							'https://1.bp.blogspot.com/-6Uln7ZENl68/V72bgf-RzlI/AAAAAAAAAEo/7iWNoc0u1mISmiyFtr0iYFfBXWT9VagMACLcB/s1600/rain-645797.jpg',
							'https://2.bp.blogspot.com/-DtAV6dvKMcg/V72bbV21jgI/AAAAAAAAAEk/4uMOrK_wGy0xH9koc3A23H_MVof672n1gCLcB/s1600/rain-1479303.jpg',
							'https://3.bp.blogspot.com/-YTXh_sbpnFw/V72bkaFTfKI/AAAAAAAAAEw/-eEYQ97Do5s4eKgUA-52VDQn71TqDFNhgCLcB/s1600/raining-828890.jpg'],
				'showers' : ['https://1.bp.blogspot.com/-NcPvdcQfYQw/V72b1vi97gI/AAAAAAAAAE4/uDzEqzvWtmUZ6MAPodioDBFoHbn9OkkAgCLcB/s1600/rain-1030813_960_720.jpg',
								'https://2.bp.blogspot.com/-T7EYd3dnPQQ/V72b2ZARooI/AAAAAAAAAE8/lDZCO6mxNHIYa3lUW5q4Rp4UVu5mg73fQCLcB/s1600/Snow_shower_on_Dartmoor.jpg'],
				'sleet' : ['https://2.bp.blogspot.com/-yEE18FURCYE/V72nBnuKyzI/AAAAAAAAAHQ/UfJj3TLFBMgPW07NrkVcR8A1rK3GiD7kACLcB/s1600/2013-01-24_02_28_48_Freezing_rain_and_sleet_in_Elko%252C_Nevada.JPG',
							'https://4.bp.blogspot.com/-T7YOkg-4wO4/V72nEgNpvHI/AAAAAAAAAHU/8o_bEPrwXa4hHAMi0iC5XnaNizwGx0dMwCLcB/s1600/2016-02-15_17_16_34_Freezing_rain_and_sleet_on_a_car_window_in_Sterling%252C_Virginia.jpg',
							'https://2.bp.blogspot.com/-AGeujdMGNNI/V72m-RSbEfI/AAAAAAAAAHM/VI-T6ginAV4_fiJzg0EJK1dM5_iWH4ugQCLcB/s1600/Sleet_on_the_ground.jpg'],
				'smoke' : ['https://3.bp.blogspot.com/--ZUKBLJWmok/V72cMtxAf2I/AAAAAAAAAFA/r59j5yRnijIP-gA7whrhZnZnvJ4BGAkKQCLcB/s1600/214-1209994488PhzD.jpg',
							'https://1.bp.blogspot.com/-k0Ob13ObCrA/V72cOGSQ_oI/AAAAAAAAAFE/8Xwdl5HBhgANPbRF-6dmEF1SS8L7GNPlwCLcB/s1600/pexels-photo-24842.jpg',
							'https://3.bp.blogspot.com/-Q07Qf3H9RLw/V72cOGH_XHI/AAAAAAAAAFI/t9C8UqyhIik1jRRomVy00L6F2clZKZvcACLcB/s1600/SMOKE_HAZE_PITTSBURGH_PENNSYLVANIA.jpg'],
				'snow' : ['https://4.bp.blogspot.com/-r4jFPyeDYLA/V72cc2eHM_I/AAAAAAAAAFQ/oYuCwQdJKigKwauwNxGt_pXjaVBYoBSJQCLcB/s1600/snowfall-201496.jpg',
							'https://2.bp.blogspot.com/-VcwI9lo_cI8/V72cfUha_fI/AAAAAAAAAFY/zuXwNHcYqDcXll8-Q1JhvDXxOuIsA-K3gCLcB/s1600/Snowing_in_Griva.JPG',
							'https://2.bp.blogspot.com/-uawLafuJMuQ/V72cegwAifI/AAAAAAAAAFU/BO8thsSzuQQEfbid2T3rmPHJAtt0QWhKQCLcB/s1600/Wintersnow.jpg'],
				'storm' : ['https://4.bp.blogspot.com/-ax0SRRUawds/V72ct45JMqI/AAAAAAAAAFk/uf0tK4RoPUYGfIj9srhvG482hjpXgC0ggCLcB/s1600/storm-407963.jpg',
							'https://4.bp.blogspot.com/-DoIkF4JJJHs/V72cs3ZflhI/AAAAAAAAAFg/UKXpoYU3vq4rdv9oI8JqPSDS6Ohm88SkQCLcB/s1600/storm-426789.jpg',
							'https://4.bp.blogspot.com/-ltAgiUTBGEQ/V72crxXiXII/AAAAAAAAAFc/Edwx03LX11YN2ttyFlr59mebu_UBWBVigCLcB/s1600/storm-918589.jpg',
							'https://4.bp.blogspot.com/-ltAgiUTBGEQ/V72crxXiXII/AAAAAAAAAFc/Edwx03LX11YN2ttyFlr59mebu_UBWBVigCLcB/s1600/storm-918589.jpg',
							'https://4.bp.blogspot.com/-2ZpPkfqnkrs/V72c_LLNkKI/AAAAAAAAAFs/2E3t_dvSEuEjB294WFSyNprHLOdsl6jDwCLcB/s1600/clouds-1345270.jpg'],
				'thunderstorm' : ['https://1.bp.blogspot.com/-7I6MUm3hyDg/V72dLfogo9I/AAAAAAAAAF0/D9ydugh8ao46ET8GxRsm925A0BLQhytKgCLcB/s1600/barn-1364280.jpg',
									'https://3.bp.blogspot.com/-dFcu7ZWs0Ys/V72dLYxCiwI/AAAAAAAAAF4/bGQ2EfbTV7wGK_F3sR2B0fp8vBSXeMmkQCLcB/s1600/flash-731488.jpg',
									'https://4.bp.blogspot.com/-4aDhBw9j24k/V72dI9fCsvI/AAAAAAAAAFw/mBHH9tuj7YExAdV02WQ0tem4KOtVetzowCLcB/s1600/flash-1455285.jpg',
									'https://2.bp.blogspot.com/--uDVsGQdTYY/V72dLwpZOzI/AAAAAAAAAF8/Eu0JE9Q8ELA2ujFECyejwkYelHpCQ5jRgCLcB/s1600/lightning-bolt-768801.jpg'],
				'tornado' : ['https://4.bp.blogspot.com/-GoVrmStXPE4/V72dhw3WYhI/AAAAAAAAAGI/dvstbBWbn0ogYIQIRRcKhJLJFnPBW0mbQCLcB/s1600/7258011540_1811c8be6a_o.jpg',
								'https://4.bp.blogspot.com/-edLR8c2Yo-s/V72dhINIzcI/AAAAAAAAAGE/rh2SIDVi-aU-TOcT__jLfNQT55EPE3rMgCLcB/s1600/14702063480_0c6684caab_o.jpg',
								'https://2.bp.blogspot.com/-S1g_0bteKF8/V72dje3NUUI/AAAAAAAAAGM/TlBB-pRKcdobpgSM0t53OZQO7d0eDZHrgCLcB/s1600/14805076801_7552063141_o.jpg',
								'https://4.bp.blogspot.com/-juy9-uWYO08/V72dols62aI/AAAAAAAAAGY/tf6CWB4nRhcDqc9JBHLsJO3eB_Ble9tagCLcB/s1600/NOAA_two_tornadoes.jpg',
								'https://4.bp.blogspot.com/-UT0IFR4zWNk/V72dlNQygDI/AAAAAAAAAGQ/_cjBrEYW364cOKzdDWKQxv5e322k9bI5ACLcB/s1600/tornado-459265.jpg',
								'https://1.bp.blogspot.com/-V5PdMcqBbwo/V72dneZvhQI/AAAAAAAAAGU/KQC_fP9pZ8A0Bp9T3ewrrxsBlfrEpDEJgCLcB/s1600/tornado-572504.jpg'],
				'windy' : ['https://4.bp.blogspot.com/-T2WxaKFmMfk/V72d1mZQQ_I/AAAAAAAAAGo/0_HURIuUbXgJLPhPM2RwporAF8UaRAFpgCLcB/s1600/palm-tree-1374868.jpg',
							'https://3.bp.blogspot.com/-SLrPj_ACtrQ/V72d0plPkBI/AAAAAAAAAGg/oCxhU6EmoV4d5JYGMtc1sBFTpkpTgaR_ACLcB/s1600/grass-371221.jpg',
							'https://2.bp.blogspot.com/-pGvdl9wHBqk/V72d00KQ0QI/AAAAAAAAAGk/s2JLzKajE1wwCFK6x8EbSmHvlxr9ED6DgCLcB/s1600/laundry-456112.jpg']
			};

	const wPicCode =  {
		"Thunderstorm": "thunderstorm",
		"Drizzle": "sprinkle",
		"Rain": "rain",
		"Snow": "snow",
		"Mist": "na",
		"Smoke": "smoke",
		"Haze": "dust",
		"Dust": "dust",
		"Fog": "fog",
		"Sand": "na",
		"Ash": "na",
		"Squall": "na",
		"Tornado": "tornado",
		"Clear": "na",
		"Clouds": "cloudy"
	}

			let wCodeClass = null;

			//set weather icon and  background
			let wBGPicIndex = wPicCode[weather.main];
			if(wBGPicIndex === "na"){
				const date = new Date();
				const hours = date.getHours();
				const index = hours < 18 ? 'day-sunny' : 'night-clear';
				let wBGPicList = wPics[index];
				let wBGPicListLen = wBGPicList.length;
				let wBGPIC = wBGPicList[getRandInt(wBGPicListLen-1)];
				$("html").css('background-image', 'url("' + wBGPIC + '")');

				wCodeClass = 'weatherSign wi wi-' + index;
			} else {
					let wBGPicList = wPics[wBGPicIndex.toLowerCase()];
					let wBGPicListLen = wBGPicList.length;
					let wBGPIC = wBGPicList[getRandInt(wBGPicListLen-1)];
					$("html").css('background-image', 'url("' + wBGPIC + '")');

					wCodeClass = 'weatherSign wi wi-' + wPicCode[weather.main];
			}


			$("#wCode").removeClass();
			$("#wCode").addClass(wCodeClass);

			//set panel color accrd to temperature in celcius
			curTemp = kelvin2celsius(temp);

			if(curTemp >= 15 && curTemp <= 30){
				$('#weatherPanel').removeClass();
				$('#weatherPanel').addClass('panel panel-success');
			}
			else if(curTemp < 15){
				$('#weatherPanel').removeClass();
				$('#weatherPanel').addClass('panel panel-info');
			}
			else if(curTemp > 30 && curTemp < 40){
				$('#weatherPanel').removeClass();
				$('#weatherPanel').addClass('panel panel-warning');
			}
			else if(curTemp > 40){
				$('#weatherPanel').removeClass();
				$('#weatherPanel').addClass('panel panel-danger');
			}

			$("#weatherPanel").removeClass("hidden");
			$("#loading-diag").addClass("hidden");

}

function errorWeather(error) {
      $("#error-diag").removeClass("hidden");
      $("#error-diag").html('<strong>Error!</strong> Unable to get weather information. Refresh page and try again.');
}

$("[id='tempUnits']").bootstrapSwitch();
$('#tempUnits').bootstrapSwitch('state', true);
$('#tempUnits').bootstrapSwitch('size', 'mini');

//https://jsfiddle.net/sumw4/13/

$("#tempUnits").on('switchChange.bootstrapSwitch', function(event, data){
	//true = celcius; false = faranheit
	if(data === true){
		$(".unitF").addClass("hidden");
		$(".unitC").removeClass("hidden");
	}
	else if(data === false){
		$(".unitC").addClass("hidden");
		$(".unitF").removeClass("hidden");
	}
});

$("[id='windSpeedUnits']").bootstrapSwitch();
$('#windSpeedUnits').bootstrapSwitch('state', true);
$('#windSpeedUnits').bootstrapSwitch('size', 'mini');

$("#windSpeedUnits").on('switchChange.bootstrapSwitch', function(event, data){
	//true = kmh; false = mph
	if(data === true){
		$(".unitMPH").addClass("hidden");
		$(".unitKMH").removeClass("hidden");
	}
	else if(data === false){
		$(".unitKMH").addClass("hidden");
		$(".unitMPH").removeClass("hidden");
	}
});

$("[id='visibilityDistanceUnits']").bootstrapSwitch();
$('#visibilityDistanceUnits').bootstrapSwitch('state', true);
$('#visibilityDistanceUnits').bootstrapSwitch('size', 'mini');

$("#visibilityDistanceUnits").on('switchChange.bootstrapSwitch', function(event, data){
	//true = kms; false = miles
	if(data === true){
		$(".unitMiles").addClass("hidden");
		$(".unitKms").removeClass("hidden");
	}
	else if(data === false){
		$(".unitKms").addClass("hidden");
		$(".unitMiles").removeClass("hidden");
	}
});

$("[id='pressureUnits']").bootstrapSwitch();
$('#pressureUnits').bootstrapSwitch('state', true);
$('#pressureUnits').bootstrapSwitch('size', 'mini');

$("#pressureUnits").on('switchChange.bootstrapSwitch', function(event, data){
	//true = hPa; false = mbar
	if(data === true){
		$(".unitmbar").addClass("hidden");
		$(".unithPa").removeClass("hidden");
	}
	else if(data === false){
		$(".unithPa").addClass("hidden");
		$(".unitmbar").removeClass("hidden");
	}
});

$("#copyWeatherInfo").on('click', function(){
	wsTemp = $("#tempFieldF").hasClass("hidden") ? $("#tempFieldC").text() : $("#tempFieldF").text();
	wsPlace = $("#city").text();
	wsCurrently = $("#curWeather").text();
	wsBeaufortWindText = $("#beaufortWindScaleTextField").text();

	weatherSnippet = wsTemp + " in " + wsPlace + ". " + wsCurrently + ". " + wsBeaufortWindText + ".";

	let $weatherSnippetTextNode = $("<input>");
	$("body").append($weatherSnippetTextNode);
	$weatherSnippetTextNode.val(weatherSnippet).select();
	document.execCommand("copy");
	$weatherSnippetTextNode.remove();
});
