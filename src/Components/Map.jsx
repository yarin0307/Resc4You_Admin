import React, { useState, useEffect } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

function Map(props) {
    const [map, setMap] = useState(null);

    useEffect(() => {
        const loader = new Loader({
            apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
            version: 'weekly',
        });

        loader.load().then(() => {
            const newMap = new window.google.maps.Map(document.getElementById('map'), {
                center: { lat: props.lat, lng: props.lng },
                zoom: 15,
            });

            setMap(newMap);
            const marker = new window.google.maps.Marker({
                position: { lat: props.lat, lng: props.lng },
                map: newMap,
                title: 'Location',
            });
        });
    }, [props.lat, props.lng]);

    return (
        <div id="map" style={{ height: '400px' }}></div>
    );
}

export default Map;
