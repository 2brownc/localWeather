function kelvin2celsius(tempKelvins) {
  return Math.round(tempKelvins - 273.15);
}

function kelvin2fahrenheit(tempKelvins) {
  return Math.round((9 / 5) * (tempKelvins - 273) + 32);
}

function meterPerSecond2MilesPerHour(ms) {
  return Math.round(ms / 0.44704);
}

function meterPerSecond2KiloMetersPerHour(ms) {
  return Math.round(ms * 3.6);
}

function km2mi_r(lenKM) {
  let lenMiles = lenKM / 1.609344;
  return Math.round(lenMiles);
}

function meter2kilometer(meters) {
  return Math.round(meters / 1000);
}

function meter2miles(meters) {
  return Math.round(meters / 1609.344);
}

function mbar2hPa_r(pressurembar) {
  let pressurehPa = pressurembar;
  return Math.round(pressurehPa);
}

// from UTC to local time 00:00 A
function UTC2LocalTimes(utc) {
  return new Date(utc * 1000).toLocaleTimeString("en-US");
}

//number of minutes passed since the start of day
// 00:00 am
// 00:00 AM
function textTime2mins(timeString) {
  let totalMinutes = 0;

  let timeStringSplit = timeString.split(" ");

  let time = timeStringSplit[0];
  let timeSplit = time.split(":");
  let hours = timeSplit[0];
  let minutes = timeSplit[1];

  let meridiem = timeStringSplit[1];

  if (meridiem === "am" || meridiem === "AM") {
    let h = parseInt(hours);
    h = h === 12 ? 0 : h;

    totalMinutes = h * 60 + parseInt(minutes);
  } else if (meridiem === "pm" || meridiem === "PM") {
    totalMinutes = parseInt(hours) * 60 + parseInt(minutes) + 12 * 60;
  }

  return totalMinutes;
}

function getCurrentTime() {
  let d = new Date();
  let hour = d.getHours();
  let meridiem = hour >= 12 ? "PM" : "AM";

  let currentTime =
    ((hour + 11) % 12) + 1 + ":" + d.getMinutes() + " " + meridiem;

  return currentTime;
}

function inHrsMins(timeInMins) {
  let hrs = Math.round(timeInMins / 60) + " hrs";

  let mins = "";
  if (timeInMins % 60 !== 0) {
    mins = " " + Math.round(timeInMins % 60) + " mins";
  }

  return hrs + mins;
}

function getDayProgress(time1, time2) {
  let dayProgress = {};

  let sunUpMins = textTime2mins(time1);
  let sunDownMins = textTime2mins(time2);

  let currentTime = getCurrentTime();

  let currentTimeMins = textTime2mins(currentTime);

  if (currentTimeMins < sunUpMins) {
    let sunUpIn = sunUpMins - currentTimeMins;
    let sunUpInTime = inHrsMins(sunUpIn);
    dayProgress = {
      sunUp: false,
      sunDown: false,
      sunUpIn: sunUpInTime,
    };
  } else if (currentTimeMins > sunUpMins && currentTimeMins < sunDownMins) {
    let dayProgressInPercent = Math.round(
      (currentTimeMins / (sunDownMins - sunUpMins)) * 100
    );
    dayProgress = {
      sunUp: true,
      sunDown: false,
      dayProgressInPercent: dayProgressInPercent,
      time: currentTime,
    };
  } else if (currentTimeMins > sunDownMins) {
    let sinceSunDownMins = currentTimeMins - sunDownMins;
    let sinceSunDown = inHrsMins(sinceSunDownMins);
    dayProgress = {
      sunUp: true,
      sunDown: true,
      sinceSunDown: sinceSunDown,
    };
  }

  return dayProgress;
}

function getRandInt(num) {
  let rndArrLen = 1000;
  let rndArr = new Uint32Array(rndArrLen);
  window.crypto.getRandomValues(rndArr);

  let rndArrIndex = Date.now() % (rndArrLen - 1);

  return rndArr[rndArrIndex] % num;
}

$("#toggleTemp").on("click", function () {
  $("#tempFieldF").toggleClass("hidden");
  $("#tempFieldC").toggleClass("hidden");
});

//get location and send them to
function getWeather() {
  if (!navigator.geolocation) {
    console.log("<p>Geolocation is not supported by your browser</p>");
    return;
  }

  function success(position) {
    let latitude = position.coords.latitude;
    let longitude = position.coords.longitude;
    loadWeather(latitude, longitude, OWM_A_KEY);
  }

  function error() {
    $("#error-diag").removeClass("hidden");
    $("#error-diag").html(
      '<strong>Error!</strong> You need to "Share" your location when prompted. Refresh page to start again.'
    );
  }

  let geoLocOptions = {
    enableHighAccuracy: true,
  };

  navigator.geolocation.getCurrentPosition(success, error, geoLocOptions);
}

//when refresh button is clicked
$("#refreshTemp").on("click", getWeather);

//when the document loads
$(document).ready(getWeather);

function loadWeather(latitude, longitude, OWM_A_KEY) {
  $.getJSON(
    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OWM_A_KEY}`,
    parseWeather
  );
}

function parseWeather(weatherData) {
  const weather = {
    temp: weatherData.main.temp,
    low: weatherData.main.temp_min,
    high: weatherData.main.temp_max,
    wind: {
      speed: weatherData.wind.speed,
      direction: weatherData.wind.deg,
    },
    humidity: weatherData.main.humidity,
    pressure: weatherData.main.pressure,
    visibility: weatherData.visibility,
    sunrise: UTC2LocalTimes(weatherData.sys.sunrise),
    sunset: UTC2LocalTimes(weatherData.sys.sunset),
    city: weatherData.name,
    country: weatherData.sys.country,
    region: "",
    currently: weatherData.weather[0].description,
    code: weatherData.weather[0].id,
    main: weatherData.weather[0].main,
  };

  displayWeather(weather);
}

function displayWeather(weather) {
  //temperatures

  //current
  temp = weather.temp;
  tempTextF = kelvin2fahrenheit(temp) + "&deg;" + "F";
  $("#tempFieldF").html(tempTextF);

  tempTextC = kelvin2celsius(temp) + "&deg;" + "C";
  $("#tempFieldC").html(tempTextC);

  //min
  minTemp = weather.low;
  minTempTextF = kelvin2fahrenheit(minTemp) + "&deg;" + "F";
  $("#minTempFieldF").html(minTempTextF);

  minTempTextC = kelvin2celsius(minTemp) + "&deg;" + "C";
  $("#minTempFieldC").html(minTempTextC);

  //max
  maxTemp = weather.high;
  maxTempTextF = kelvin2fahrenheit(maxTemp) + "&deg;" + "F";
  $("#maxTempFieldF").html(maxTempTextF);

  maxTempTextC = kelvin2celsius(maxTemp) + "&deg;" + "C";
  $("#maxTempFieldC").html(maxTempTextC);

  //wind
  //speed

  windSpeedMPH = meterPerSecond2MilesPerHour(weather.wind.speed);
  windSpeedKMH = meterPerSecond2KiloMetersPerHour(weather.wind.speed);

  windSpeedTextMPH = windSpeedMPH + " " + "mph";
  windSpeedTextKMH = windSpeedKMH + " " + "kmh";

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
    12: "Hurricane Force",
  };

  if (windSpeedKMH < 1) {
    beaufortScaleNumber = 0;
  } else if (windSpeedKMH >= 1 && windSpeedKMH <= 5) {
    beaufortScaleNumber = 1;
  } else if (windSpeedKMH >= 6 && windSpeedKMH <= 11) {
    beaufortScaleNumber = 2;
  } else if (windSpeedKMH >= 12 && windSpeedKMH <= 19) {
    beaufortScaleNumber = 3;
  } else if (windSpeedKMH >= 20 && windSpeedKMH <= 28) {
    beaufortScaleNumber = 4;
  } else if (windSpeedKMH >= 29 && windSpeedKMH <= 38) {
    beaufortScaleNumber = 5;
  } else if (windSpeedKMH >= 39 && windSpeedKMH <= 49) {
    beaufortScaleNumber = 6;
  } else if (windSpeedKMH >= 50 && windSpeedKMH <= 61) {
    beaufortScaleNumber = 7;
  } else if (windSpeedKMH >= 62 && windSpeedKMH <= 74) {
    beaufortScaleNumber = 8;
  } else if (windSpeedKMH >= 75 && windSpeedKMH <= 88) {
    beaufortScaleNumber = 9;
  } else if (windSpeedKMH >= 89 && windSpeedKMH <= 102) {
    beaufortScaleNumber = 10;
  } else if (windSpeedKMH >= 103 && windSpeedKMH <= 117) {
    beaufortScaleNumber = 11;
  } else if (windSpeedKMH >= 118) {
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

  swingSpeed = (12 / beaufortScaleNumber) * 250;

  function rotateElememt(angle1, angle2, swingSpeed) {
    let $elem = $("#windDirSignField");

    $({ deg: angle2 }).animate(
      { deg: angle1 },
      {
        duration: swingSpeed,
        step: function (now) {
          $elem.css({
            transform: "rotate(" + now + "deg)",
          });
        },
        complete: function () {
          rotateElememt(angle2, angle1, swingSpeed);
        },
      }
    );
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

  if (dayProgress.sunUp || dayProgress.sunDown) {
    if (dayProgress.sunDown) {
      $("#dayProgressBar").removeClass();
      $("#dayProgressBar").addClass(
        "progress-bar progress-bar-info progress-bar-striped"
      );
      $("#dayProgressBar").attr("aria-valuenow", "100");
      $("#dayProgressBar").attr("style", "width:100%");
      $("#dayProgressBar").html("Since Sunset : " + dayProgress.sinceSunDown);
    } else {
      $("#dayProgressBar").removeClass();
      $("#dayProgressBar").addClass(
        "progress-bar progress-bar-warning progress-bar-striped"
      );
      $("#dayProgressBar").attr(
        "aria-valuenow",
        dayProgress.dayProgressInPercent
      );
      $("#dayProgressBar").attr(
        "style",
        "width:" + dayProgress.dayProgressInPercent + "%"
      );
      $("#dayProgressBar").html(dayProgress.time);
    }
  } else {
    $("#dayProgressBar").removeClass();
    $("#dayProgressBar").addClass(
      "progress-bar progress-bar-success progress-bar-striped"
    );
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

  let wPics = {
    "cloudy": [
      "assets/images/clouds-1571775.jpg",
      "assets/images/sky-1149217.jpg",
      "assets/images/storm-466677.jpg",
      "assets/images/train-station-1400657.jpg",
    ],
    "day-cloudy": [
      "assets/images/cloudy-day-at-big-muddy-national-wildlife-refuge.jpg",
      "assets/images/cloudy-fall-day-on-lake.jpg",
      "assets/images/Oklahoma_City_cloudy_day.jpg",
      "assets/images/sky-1438092.jpg",
    ],
    "day-haze": [
      "assets/images/fog-1565694.jpg",
      "assets/images/landscape-640668.jpg",
      "assets/images/landscape-731341.jpg",
    ],
    "day-sunny": [
      "assets/images/jacksonville-florida-cityscape.jpg",
      "assets/images/leaves-241701.jpg",
      "assets/images/rest-beach-summer-white-sand-sunny-day.jpg",
    ],
    "dust": [
      "assets/images/Dust_Storm_Surfers_Paradise.jpg",
      "assets/images/sandstorm-165332.jpg",
      "assets/images/Sandstorm_of_Longjing_Township_Taiwan.jpg",
    ],
    "fog": [
      "assets/images/4DNoPn1gEkw1gFbZIRCGR_ZGWFvmNPSggCLcB/s1600/country-1209094.jpg",
      "assets/images/fishing-1245979.jpg",
      "assets/images/morning-mist-1535967.jpg",
      "assets/images/mountain-1542114.jpg",
      "assets/images/sunset-1209206.jpg",
    ],
    "hail": [
      "assets/images/bike-717795.jpg",
      "assets/images/hail-189519.jpg",
      "assets/images/hailstones-1338886.jpg",
    ],
    "haze": [
      "assets/images/fog-1565694.jpg",
      "assets/images/landscape-640668.jpg",
      "assets/images/landscape-731341.jpg",
    ],
    "hot": [
      "assets/images/effects-of-climate-change.jpg",
      "assets/images/Morroco-arid-climate.jpg",
      "assets/images/Orcia-landscape-1.jpg",
    ],
    "hurricane": [
      "assets/images/hurricanes-927042.jpg",
      "assets/images/key-west-86025.jpg",
    ],
    "night-clear": [
      "assets/images/architecture-2715.jpg",
      "assets/images/night-blue-half-moon.jpg",
      "assets/images/night-sky-523892.jpg",
    ],
    "night-cloudy": [
      "assets/images/cloudy-sunset-166665.jpg",
      "assets/images/lake-384575.jpg",
      "assets/images/london-1149144.jpg",
      "assets/images/texture-699695.jpg",
      "assets/images/texture-699701.jpg",
    ],
    "rain": [
      "assets/images/rain-122691.jpg",
      "assets/images/rain-645797.jpg",
      "assets/images/rain-1479303.jpg",
      "assets/images/raining-828890.jpg",
    ],
    "showers": [
      "assets/images/rain-1030813_960_720.jpg",
      "assets/images/Snow_shower_on_Dartmoor.jpg",
    ],
    "sleet": [
      "assets/images/Freezing_rain_and_sleet_in_Elko_Nevada.jpg",
      "assets/images/Freezing_rain_and_sleet_on_a_car_window_in_Sterling_Virginia.jpg",
      "assets/images/Sleet_on_the_ground.jpg",
    ],
    "smoke": [
      "assets/images/214-1209994488PhzD.jpg",
      "assets/images/pexels-photo-24842.jpg",
      "assets/images/SMOKE_HAZE_PITTSBURGH_PENNSYLVANIA.jpg",
    ],
    "snow": [
      "assets/images/snowfall-201496.jpg",
      "assets/images/Snowing_in_Griva.JPG",
      "assets/images/Wintersnow.jpg",
    ],
    "storm": [
      "assets/images/storm-407963.jpg",
      "assets/images/storm-426789.jpg",
      "assets/images/storm-918589.jpg",
      "assets/images/storm-918589.jpg",
      "assets/images/clouds-1345270.jpg",
    ],
    "thunderstorm": [
      "assets/images/barn-1364280.jpg",
      "assets/images/flash-731488.jpg",
      "assets/images/flash-1455285.jpg",
      "assets/images/lightning-bolt-768801.jpg",
    ],
    "tornado": [
      "assets/images/7258011540_1811c8be6a_o.jpg",
      "assets/images/14702063480_0c6684caab_o.jpg",
      "assets/images/14805076801_7552063141_o.jpg",
      "assets/images/s1600/NOAA_two_tornadoes.jpg",
      "assets/images/tornado-459265.jpg",
      "assets/images/tornado-572504.jpg",
    ],
    "windy": [
      "assets/images/palm-tree-1374868.jpg",
      "assets/images/grass-371221.jpg",
      "assets/images/laundry-456112.jpg",
    ],
  };

  const wPicCode = {
    Thunderstorm: "thunderstorm",
    Drizzle: "sprinkle",
    Rain: "rain",
    Snow: "snow",
    Mist: "na",
    Smoke: "smoke",
    Haze: "dust",
    Dust: "dust",
    Fog: "fog",
    Sand: "na",
    Ash: "na",
    Squall: "na",
    Tornado: "tornado",
    Clear: "na",
    Clouds: "cloudy",
  };

  let wCodeClass = null;

  //set weather icon and  background
  let wBGPicIndex = wPicCode[weather.main];
  if (wBGPicIndex === "na") {
    const date = new Date();
    const hours = date.getHours();
    const index = hours < 18 ? "day-sunny" : "night-clear";
    let wBGPicList = wPics[index];
    let wBGPicListLen = wBGPicList.length;
    let wBGPIC = wBGPicList[getRandInt(wBGPicListLen - 1)];
    $("body").css({"background-image": 'url("' + wBGPIC + '")', 'background-color' : ''});

    wCodeClass = "weatherSign wi wi-" + index;
  } else {
    let wBGPicList = wPics[wBGPicIndex.toLowerCase()];
    let wBGPicListLen = wBGPicList.length;
    let wBGPIC = wBGPicList[getRandInt(wBGPicListLen - 1)];
    $("body").css({"background-image": 'url("' + wBGPIC + '")', 'background-color' : ''});

    wCodeClass = "weatherSign wi wi-" + wPicCode[weather.main];
  }

  $("#wCode").removeClass();
  $("#wCode").addClass(wCodeClass);

  //set panel color accrd to temperature in celcius
  curTemp = kelvin2celsius(temp);

  if (curTemp >= 15 && curTemp <= 30) {
    $("#weatherPanel").removeClass();
    $("#weatherPanel").addClass("panel panel-success");
  } else if (curTemp < 15) {
    $("#weatherPanel").removeClass();
    $("#weatherPanel").addClass("panel panel-info");
  } else if (curTemp > 30 && curTemp < 40) {
    $("#weatherPanel").removeClass();
    $("#weatherPanel").addClass("panel panel-warning");
  } else if (curTemp > 40) {
    $("#weatherPanel").removeClass();
    $("#weatherPanel").addClass("panel panel-danger");
  }

  $("#weatherPanel").removeClass("hidden");
  $("#loading-diag").addClass("hidden");
}

function errorWeather(error) {
  $("#error-diag").removeClass("hidden");
  $("#error-diag").html(
    "<strong>Error!</strong> Unable to get weather information. Refresh page and try again."
  );
}

$("[id='tempUnits']").bootstrapSwitch();
$("#tempUnits").bootstrapSwitch("state", true);
$("#tempUnits").bootstrapSwitch("size", "mini");

//https://jsfiddle.net/sumw4/13/

$("#tempUnits").on("switchChange.bootstrapSwitch", function (event, data) {
  //true = celcius; false = faranheit
  if (data === true) {
    $(".unitF").addClass("hidden");
    $(".unitC").removeClass("hidden");
  } else if (data === false) {
    $(".unitC").addClass("hidden");
    $(".unitF").removeClass("hidden");
  }
});

$("[id='windSpeedUnits']").bootstrapSwitch();
$("#windSpeedUnits").bootstrapSwitch("state", true);
$("#windSpeedUnits").bootstrapSwitch("size", "mini");

$("#windSpeedUnits").on("switchChange.bootstrapSwitch", function (event, data) {
  //true = kmh; false = mph
  if (data === true) {
    $(".unitMPH").addClass("hidden");
    $(".unitKMH").removeClass("hidden");
  } else if (data === false) {
    $(".unitKMH").addClass("hidden");
    $(".unitMPH").removeClass("hidden");
  }
});

$("[id='visibilityDistanceUnits']").bootstrapSwitch();
$("#visibilityDistanceUnits").bootstrapSwitch("state", true);
$("#visibilityDistanceUnits").bootstrapSwitch("size", "mini");

$("#visibilityDistanceUnits").on(
  "switchChange.bootstrapSwitch",
  function (event, data) {
    //true = kms; false = miles
    if (data === true) {
      $(".unitMiles").addClass("hidden");
      $(".unitKms").removeClass("hidden");
    } else if (data === false) {
      $(".unitKms").addClass("hidden");
      $(".unitMiles").removeClass("hidden");
    }
  }
);

$("[id='pressureUnits']").bootstrapSwitch();
$("#pressureUnits").bootstrapSwitch("state", true);
$("#pressureUnits").bootstrapSwitch("size", "mini");

$("#pressureUnits").on("switchChange.bootstrapSwitch", function (event, data) {
  //true = hPa; false = mbar
  if (data === true) {
    $(".unitmbar").addClass("hidden");
    $(".unithPa").removeClass("hidden");
  } else if (data === false) {
    $(".unithPa").addClass("hidden");
    $(".unitmbar").removeClass("hidden");
  }
});

$("#copyWeatherInfo").on("click", function () {
  wsTemp = $("#tempFieldF").hasClass("hidden")
    ? $("#tempFieldC").text()
    : $("#tempFieldF").text();
  wsPlace = $("#city").text();
  wsCurrently = $("#curWeather").text();
  wsBeaufortWindText = $("#beaufortWindScaleTextField").text();

  weatherSnippet =
    wsTemp +
    " in " +
    wsPlace +
    ". " +
    wsCurrently +
    ". " +
    wsBeaufortWindText +
    ".";

  let $weatherSnippetTextNode = $("<input>");
  $("body").append($weatherSnippetTextNode);
  $weatherSnippetTextNode.val(weatherSnippet).select();
  document.execCommand("copy");
  $weatherSnippetTextNode.remove();
});
