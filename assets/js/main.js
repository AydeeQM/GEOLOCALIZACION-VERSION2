'use strict';

function initMap() {
    app.init();
}

const app = {
    setting: {
        map: undefined,
        setupGoogleMap: undefined,
        containerMap: undefined,
        currentPosition: {
            lat: 0,
            lng: 0
        },

        btnSearchPosition: undefined

    },

    init: function () {
        app.containerMap = document.getElementById("map"),
            app.currentPosition = {
                lat: -33.4724728,
                lng: -70.9100251
            }

        app.setupGoogleMap = {
            zoom: 10,
            center: app.currentPosition,
            mapTypeControl: false,
            zoomControl: false,
            streetViewControl: false
        }

        app.setting.map = new google.maps.Map(app.containerMap, app.setupGoogleMap); // FUNCTION GOOGLE MAP

        // FIRST INPUT ORIGIN
        let inputOrigin = document.getElementById('origen');
        let autocompleteOrigin = new google.maps.places.Autocomplete(inputOrigin);
        autocompleteOrigin.bindTo('bounds', app.setting.map);
        let detailsLocationOrigin = new google.maps.InfoWindow();
        let markerOrigin = app.createMarker(app.setting.map);

        app.crearListener(autocompleteOrigin, detailsLocationOrigin, markerOrigin);

        // SECOND INPUT DESTINATION
        let inputDestination = document.getElementById('destino');
        let autocompleteDestination = new google.maps.places.Autocomplete(inputDestination);
        autocompleteDestination.bindTo('bounds', app.setting.map);
        let detailsLocationDestination = new google.maps.InfoWindow();
        let markerDestination = app.createMarker(app.setting.map);

        app.crearListener(autocompleteDestination, detailsLocationDestination, markerDestination);

        //MY CURRENT LOCATION
        app.btnSearchPosition = $('#encuentrame').on('click', app.searchMyPosition);

        //ROUTE
        let directionsService = new google.maps.DirectionsService;
        let directionsDisplay = new google.maps.DirectionsRenderer;

        $("#ruta").on("click", function () {
            app.drawRoad(directionsService, directionsDisplay)
        });

        directionsDisplay.setMap(app.setting.map);

    },

    crearListener: function (autocomplete, detailsLocation, marker) {
        autocomplete.addListener('place_changed', function () {
            detailsLocation.close();
            marker.setVisible(false);
            let place = autocomplete.getPlace();
            app.markerLocation(place, detailsLocation, marker);
        });
    },

    searchMyPosition: function () {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(app.currentPositionCallbacks.locationAutomatic, app.currentPositionCallbacks.error);
        }
    },

    currentPositionCallbacks: {
        locationAutomatic: function (position) {
            app.currentPosition.lat = position.coords.latitude;
            app.currentPosition.lng = position.coords.longitude;

            markerOrigin.setPosition(new google.maps.LatLng(app.currentPosition.la, app.currentPosition.lng));
            app.setting.map.setCenter(app.currentPosition);
            app.setting.map.setZoom(17);

            markerOrigin.setVisible(true);

            detailsLocationOrigin.setContent('<div><strong>I am here!!</strong><br>');
            detailsLocationOrigin.open(app.setting.map, markerOrigin);
        },
        error: function () {
            alert('We have a problem with finding your location');
        }
    },

    markerLocation: function (place, detailsLocation, marker) {
        if (!place.geometry) {
            // Failure to find the right place
            window.alert("We did not find the place you indicated: '" + place.name + "'");
            return;
        }
        // If the place has a geometry, then present it on a map.
        if (place.geometry.viewport) {
            app.setting.map.fitBounds(place.geometry.viewport);
        } else {
            app.setting.map.setCenter(place.geometry.location);
            app.setting.map.setZoom(17);
        }

        marker.setPosition(place.geometry.location);
        marker.setVisible(true);

        let address = '';
        if (place.address_components) {
            address = [
                (place.address_components[0] && place.address_components[0].short_name || ''),
                (place.address_components[1] && place.address_components[1].short_name || ''),
                (place.address_components[2] && place.address_components[2].short_name || '')
                ].join(' ');
        }

        detailsLocation.setContent('<div><strong>' + place.name + '</strong><br>' + address);
        detailsLocation.open(app.setting.map, marker);
    },

    createMarker: function () {
        let icono = {
            url: 'http://icons.iconarchive.com/icons/sonya/swarm/128/Bike-icon.png',
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(35, 35)
        };

        let marker = new google.maps.Marker({
            map: app.setting.map,
            animation: google.maps.Animation.DROP,
            icon: icono,
            anchorPoint: new google.maps.Point(0, -29)
        });

        return marker;
    },

    drawRoad: function (directionsService, directionsDisplay) {
        let origin = document.getElementById("origen").value;
        let destination = document.getElementById('destino').value;

        if (destination != "" && destination != "") {
            directionsService.route({
                    origin: origin,
                    destination: destination,
                    travelMode: "DRIVING"
                },
                function (response, status) {
                    if (status === "OK") {
                        directionsDisplay.setDirections(response);
                    } else {
                        app.failRoute();
                    }
                });
        }
    },

    failRoute: function () {
        alert("You did not enter a valid source and destination");
    }

}
