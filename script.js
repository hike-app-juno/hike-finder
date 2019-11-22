const hikeApp = {};

const routeKey = `Aia7N7IYQAD2wuOi_t3bwY9x9AqsymMip5UUZSY_OhyJF9uYSkjb3UkwFhIVP7nJ`
const geoKey = `51b65eec5dc1479abcc1262f017405a2`

let postalCode = " "

const totalTime = function (seconds){
    const hours = Math.floor(seconds/3600);
    const minutes = Math.round((seconds %= 3600)/60);
    return `${hours} h ${minutes} min`
};

const getCoordinates = function(postalCode) {

     postalCode = $("input").val();

    $.ajax({
        url:`http://dev.virtualearth.net/REST/v1/Locations/CA/-/${postalCode}/-/-`,
        method: "GET",
        dataTypes: 'json',
        data:{
            key: routeKey
        }
    }).then(function(data){
        const dLat = data.resourceSets[0].resources[0].point.coordinates[0];
        const dLong = data.resourceSets[0].resources[0].point.coordinates[1];
        console.log(dLat, dLong);

        $.when(getCoordinates)
        .then(function(){
            getHikes (dLat, dLong);
        })
    }).fail(function(error){
        console.log(error);
    });
};

const getRoute = function(dLat, dLong, aLat, aLong, resultIndex) {

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
            <p>Estimated Drive Time: ${totalTime(driveTimeSeconds)}</p>
            <p>With Traffic: ${totalTime(driveTrafficSeconds)}</p>
        `

        $("#hike-info-"+resultIndex).append(travelInfo);
}

$(function(){
    $("input[type='submit']").on("click", function(){
        $(".results").html(" ")
        getCoordinates(postalCode);
    })
});

//////////