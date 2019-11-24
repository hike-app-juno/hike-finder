const hikeApp = {};

const routeKey = `Aia7N7IYQAD2wuOi_t3bwY9x9AqsymMip5UUZSY_OhyJF9uYSkjb3UkwFhIVP7nJ`
const geoKey = `51b65eec5dc1479abcc1262f017405a2`

let postalCode = " "
let dLat = 0;
let dLong = 0;

const totalTime = function (seconds){
    const hours = Math.floor(seconds/3600);
    const minutes = Math.round((seconds %= 3600)/60);
    if(hours > 0){
        return `${hours} h ${minutes} min`
    }else{
        return `${minutes} min`
    }
};

hikeApp.getCoordinates = function(postalCode) {

    postalCode = $("input").val();


    $.ajax({
        url:`http://dev.virtualearth.net/REST/v1/Locations/CA/-/${postalCode}/-/-`,
        method: "GET",
        dataTypes: 'json',
        data:{
            key: routeKey
        }
    }).then(function(data){
        dLat = data.resourceSets[0].resources[0].point.coordinates[0];
        dLong = data.resourceSets[0].resources[0].point.coordinates[1];
        console.log(dLat, dLong);

        $.when(hikeApp.getCoordinates)
        .then(function(){
            hikeApp.getHikes (dLat, dLong);
        })
    }).fail(function(error){
        console.log(error);
    });
};

hikeApp.baseUrl = 'https://www.hikingproject.com/data/get-trails';
hikeApp.key = '200640927-0078512b6eac032c4ea121fea696b36f';

hikeApp.getHikes = function(dLat, dLong) {
    $.ajax({
        url: hikeApp.baseUrl, 
        method: 'GET',
        dataType: 'json',
        data: {
            key: hikeApp.key, 
            lat: dLat,
            lon: dLong
        }
    }).then( function(hikeData){
        hikeApp.displayHikes(hikeData);
    })
}

hikeApp.displayHikes = function (hikeData){
    for(i=0;i<hikeData.trails.length;i++){

        const hikeName = (hikeData.trails[i].name);
        const hikeSummary = (hikeData.trails[i].summary);
        const hikeLocation = (hikeData.trails[i].location);
        const hikeImage = (hikeData.trails[i].imgSmallMed)
        const hikeWebsite = (hikeData.trails[i].url)
        const hikeStars = (hikeData.trails[i].stars)
        const aLat = hikeData.trails[i].latitude;
        const aLong = hikeData.trails[i].longitude;

        const hikeInfo = `
        <div id="hike-info-${[i]}">
            <a href=${hikeWebsite}>
                <img src="${hikeImage}" alt="${hikeName}">
                <h2>${hikeName}</h2>
            </a>
            <div class="star-rating"><p>${hikeLocation}</p><p><i class="fas fa-star"></i>${hikeStars} Stars </p></div>
            <p><i class="fas fa-mountain"></i>Ascent: ${hikeData.trails[i].ascent}, Descent: ${hikeData.trails[i].descent}</p>
			<div class="route-${[i]}"></div>
            <blockquote class="summary">${hikeSummary}</blockquote>
        </div>`
        $(".results").append(hikeInfo);
        hikeApp.getRoute(dLat, dLong, aLat, aLong, i);
    };
};

hikeApp.getRoute = function(dLat, dLong, aLat, aLong, resultIndex) {

const depart = dLat + ",%20" + dLong
const arrive = aLat + ",%20" + aLong

$.ajax({
    url:`http://dev.virtualearth.net/REST/V1/Routes/Driving?wp.0=${depart}&wp.1=${arrive}`,
    method: "GET",
    dataTypes: 'json',
    data:{
        avoid: "minimizeTolls",
        key: routeKey
        }
    }).then(function(result){

        hikeApp.displayRoute(result, resultIndex);

    }).fail(function(error){
        console.log(error);
    });
};

hikeApp.displayRoute = function (result, resultIndex){

        const driveDistance = result.resourceSets[0].resources[0].travelDistance;
        const driveTimeSeconds = result.resourceSets[0].resources[0].travelDuration;
        const driveTrafficSeconds = result.resourceSets[0].resources[0].travelDurationTraffic;

        const travelInfo = `
            <p>Distance: ${driveDistance} km</p>
            <p><i class="fas fa-car-side"></i>Estimated Drive Time: ${totalTime(driveTimeSeconds)}</p>
            <p>With Traffic: ${totalTime(driveTrafficSeconds)}</p>
        `

        $(".route-"+resultIndex).append(travelInfo);
}

hikeApp.init = function () {
    $(".results").html(" ")
	
    hikeApp.getCoordinates(postalCode);

    $('.leftMountain').toggleClass('fadeOutLeft');
    $('.rightMountain').toggleClass('fadeOutRight');

    $('html, body').animate({
    scrollTop: $('.results').offset().top
    }, 2000);
};

$(function(){
    $("button[type='submit']").on("click", hikeApp.init)
	
});