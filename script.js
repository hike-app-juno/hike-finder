const hikeApp = {};

const routeKey = `Aia7N7IYQAD2wuOi_t3bwY9x9AqsymMip5UUZSY_OhyJF9uYSkjb3UkwFhIVP7nJ`
const geoKey = `51b65eec5dc1479abcc1262f017405a2`

let postalCode = " ";
let dLat = 0;
let dLong = 0;

// Function that runs to determine the amount of time to drive to the location
const totalTime = function (seconds){
    const hours = Math.floor(seconds/3600);
    const minutes = Math.round((seconds %= 3600)/60);
    if(hours > 0){
        return `${hours} h ${minutes} min`
    }else{
        return `${minutes} min`
    }
};

// Function to generate the lat & long coordinates based on the user input
hikeApp.getCoordinates = function(postalCode) {

    postalCode = $("input").val();

// First ajax call to obtain the coordinates based on postal code
    $.ajax({
        url:`https://dev.virtualearth.net/REST/v1/Locations/CA/-/${postalCode}/-/-`,
        method: "GET",
        dataTypes: 'json',
        data:{
            key: routeKey
        }
    }).then(function(data){
        dLat = data.resourceSets[0].resources[0].point.coordinates[0];
        dLong = data.resourceSets[0].resources[0].point.coordinates[1];

        $.when(hikeApp.getCoordinates)
        .then(function(){
            hikeApp.getHikes (dLat, dLong);
        })
    }).fail(function(error){
        swal({
            title: '404 Error',
            text: 'Page Not Found. Click the top left button to try another postal code or try again later!',
            icon: 'error',
            showOkButton: true,
            confirmButtonColor: '#0A0F3C',
            confirmButtonText: 'OK',
            cancelButtonText: 'No.'
        });
    });
};

// Ajax call to the Hike Finder API to find hikes based on lat and long coordinates
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
        if(hikeData.trails.length === 0){
            swal({
                title: 'Sorry!',
                text: 'No hikes were found in this area! Click the top left button to try another postal code.',
                icon: 'error',
                showOkButton: true,
                confirmButtonColor: '#0A0F3C',
                confirmButtonText: 'OK',
                cancelButtonText: 'No.'
            });
        }else{
            hikeApp.displayHikes(hikeData);
        }
    }).fail(function(error){
        swal({
            title: '404 Error',
            text: 'Page Not Found. Click the top left button to try another postal code or try again later!',
            icon: 'error',
            showOkButton: true,
            confirmButtonColor: '#0A0F3C',
            confirmButtonText: 'OK',
            cancelButtonText: 'No.'
        });
    });
}

// Function to display the data from the Hike Finder API
hikeApp.displayHikes = function (hikeData){
    for(i=0;i<hikeData.trails.length;i++){

        const hikeName = (hikeData.trails[i].name);
        const hikeSummary = (hikeData.trails[i].summary);
        const hikeLocation = (hikeData.trails[i].location);
        const hikeImage = function(){
            if(hikeData.trails[i].imgSmallMed === ""){
                return `styles/sass/assets/placeholder.jpg`
            }else{
                return hikeData.trails[i].imgSmallMed;
            }
        }
        const hikeWebsite = (hikeData.trails[i].url);
        const hikeStars = (hikeData.trails[i].stars);
        const aLat = hikeData.trails[i].latitude;
        const aLong = hikeData.trails[i].longitude;

        const hikeInfo = `
        <div id="hike-info-${[i]}">
            <a href=${hikeWebsite}>
                <img src="${hikeImage()}" alt="${hikeName}">
                <h2>${hikeName}</h2>
            </a>
            <p class="location">${hikeLocation}</p>
            <div class="stats-container">
                <div class="ascent-route-${[i]}">
                    <p><span class="sr-only">Ascent of hike:</span><i class="fas fa-mountain" title="Ascent of hike"></i>Ascent: ${hikeData.trails[i].ascent} m</p>
                    <h3>Get There In...</h3>
                </div>
                <div class="rating-drive-${[i]} info">
                    <p><span class="sr-only">Average user rating:</span><i class="fas fa-star" title="Average user rating"></i>${hikeStars} Stars</<i></p> 
                </div>
            </div>
            <blockquote>${hikeSummary}</blockquote>
        </div>`
        $(".results").append(hikeInfo);
        hikeApp.getRoute(dLat, dLong, aLat, aLong, i);
    };
};

// Function to determine the route/length of time to arrive at the hike destination
hikeApp.getRoute = function(dLat, dLong, aLat, aLong, resultIndex) {

const depart = dLat + ",%20" + dLong
const arrive = aLat + ",%20" + aLong
// Ajax call to get driving information
$.ajax({
    url:`https://dev.virtualearth.net/REST/V1/Routes/Driving?wp.0=${depart}&wp.1=${arrive}`,
    method: "GET",
    dataTypes: 'json',
    data:{
        avoid: "minimizeTolls",
        key: routeKey
        }
    }).then(function(result){

        hikeApp.displayRoute(result, resultIndex);

    }).fail(function(error){
        swal({
            title: '404 Error',
            text: 'Page Not Found. Click the top left button to try another postal code or try again later!',
            icon: 'error',
            showOkButton: true,
            confirmButtonColor: '#0A0F3C',
            confirmButtonText: 'OK',
            cancelButtonText: 'No.'
        });
    });
};

// Function to display route information based on the hike details displayed.
hikeApp.displayRoute = function (result, resultIndex){

        const driveDistance = Math.round(result.resourceSets[0].resources[0].travelDistance);
        const driveTrafficSeconds = result.resourceSets[0].resources[0].travelDurationTraffic;

        const distance = `<p><span class="sr-only">Distance from postal code to hike trail:</span><i class="fas fa-map-pin" title="Distance from postal code to hike trail"></i> Distance: ${driveDistance} km</<i></p>`
        const driveTime = `
            <p><span class="sr-only">Driving time from postal code to hike trail:</span><i class="fas fa-car-side" title="Driving time from postal code to hike trail"></i> ${totalTime(driveTrafficSeconds)}</span></p>
        `
        $(".rating-drive-"+resultIndex).append(driveTime);
        $(".ascent-route-"+resultIndex).append(distance);
}

// Function to run when 'enter new postal code' button is clicked
$('.go-home').on('click', hikeApp.home = function(){
	$('.leftMountain').toggleClass('fadeOutLeft');
    $('.rightMountain').toggleClass('fadeOutRight');
    $('input').attr('readonly', false); 
    $('input').val("")
    $(".go-home").css("opacity", 0);
    $("button[type='submit']").attr("disabled", false);
    $(".go-home button").attr('disabled', true);
	$('html, body').animate({
    scrollTop: $('html').offset().top
    }, 2000);
})

// Init method
hikeApp.init = function () {
    if($("input").val() === "" || $("input").val() === " "){
        swal({
            title: 'Oops..',
            text: 'Looks like you forgot to enter in a postal code!',
            icon:'error',
            showOkButton: true,
            confirmButtonColor: '#0A0F3C',
            confirmButtonText: 'OK',
            cancelButtonText: 'No.'
        });
    }else{

        $(".results").html(" ");
        $("button[type='submit']").attr("disabled", true);
        $('input').attr('readonly', true); 

        hikeApp.getCoordinates(postalCode);
        
        $('.leftMountain').toggleClass('fadeOutLeft');
        $('.rightMountain').toggleClass('fadeOutRight');
    
        $("footer").css("display", "block")
        $(".go-home").css("opacity", 1);
        $(".go-home button").removeAttr('disabled');
    
        $('html, body').animate({
        scrollTop: $('.results').offset().top
        }, 2000);
    }
};

// Doc ready
$(function(){
    //Instructions to user
    swal({
		title: 'Welcome!',
		text: 'Enter a Canadian or American postal code in the text bar and click the magnifying glass to get nearby hikes. Click \"New Postal Code\" in the top left corner once you\'re done with your results to start again.',
		type: 'success',
		showOkButton: true,
		confirmButtonColor: '#0A0F3C',
		confirmButtonText: 'Let\'s Go!',
		cancelButtonText: 'No.'
	});
    //On click , init app
    $("button[type='submit']").on("click", hikeApp.init);
});