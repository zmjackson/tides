import L, { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, TileLayer, Popup } from "react-leaflet";
import React from "react";
import { HotChocolate } from "../domain/domain";

export default function FavoritesMap() {
    // Default coordinates set to Oslo central station
    const position : LatLngExpression = [59.91174337077401, 10.750425582038146];
    const zoom : number = 15;

    const icon : L.DivIcon = L.divIcon({
        className: "hot-chocolate-icon",
        iconSize: [30, 30],
        iconAnchor: [0, 0],
        popupAnchor: [15, 0]
    });

    const list : HotChocolate[] = [
        {
            productName: "Varm belgisk sjokolade",
            englishProductName: "Belgian hot chocolate",
            vendor: "Steam kaffebar",
            location: "Jernbanetorget 1, Østbanehallen",
            lat: 59.91088362120013, 
            lon: 10.752799203777597
        },
        {
            productName: "Varm sjokolade",
            englishProductName: "Hot chocolate",
            vendor: "Kaffebrenneriet",
            location: "Karl Johans gate 7, Arkaden",
            lat: 59.91181003626315, 
            lon: 10.747782602301388
        },
        {
            productName: "Sjokolade på pinne",
            englishProductName: "Hot chocolate on a stick",
            vendor: "Espresso House",
            location: "Jernbanetorget 1, Østbanehallen",
            lat: 59.91201090441835, 
            lon: 10.751298468298101,
            description: "Seasonally available"
        }
    ];

    return (
        <MapContainer center={position} zoom={zoom} scrollWheelZoom={false}>
            <TileLayer
            attribution="&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {list.map((item, index) => 
    <Marker icon={icon} key={index} position={[item.lat, item.lon]} title={`${item.englishProductName} at ${item.vendor}`}>
        <Popup>
            <strong>{item.englishProductName} at {item.vendor}</strong><br />
            <p>Look for <strong>{item.productName}</strong> on the menu.</p>
            <p>{item.location}</p>
            {item.description && 
                <em>{item.description}</em>
            }
        </Popup>
    </Marker>
)}
        </MapContainer>
        )
};