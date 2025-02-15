import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Api from "../../api";
import Cookies from "js-cookie";
import L from "leaflet";
import TitleCard from "../../components/Cards/TitleCard";
import { toast } from "react-toastify";

// Fix for marker icons not appearing
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const RADIUS_ABSEN = 100;

const LocationMap = ({ lat, lon, userLat, userLon, radius_absen }) => {
    if (!lat || !lon) {
        return <p className="text-red-500">Koordinat tidak tersedia</p>;
    }

    return (
        <MapContainer center={[lat, lon]} zoom={15} style={{ height: "400px", width: "100%" }}>
            <TileLayer  
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Circle Radius */}
            <Circle center={[lat, lon]} radius={radius_absen} color="blue" fillOpacity={0.3} />

            {/* Marker Lokasi Absen */}
            <Marker position={[lat, lon]}>
                <Popup>Lokasi Absen</Popup>
            </Marker>
        </MapContainer>
    );
};

const TopSideButtons = ({ click }) => {
    return (
        <div className="inline-block float-right">
            <button className="btn px-6 btn-sm normal-case btn-primary" onClick={click}>
                Edit Radius
            </button>
        </div>
    );
};

function Charts() {
    const [location, setLocation] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const token = Cookies.get("token");

    const [lat, setLat] = useState(0);
    const [lon, setLon] = useState(0);
    const [radius, setRadius] = useState(100);

    const handleSave = async () => {
        try {
            const response = await Api.put(
                "location",
                { latitude: lat, longitude: lon, radius },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setLocation({ latitude: lat, longitude: lon, radius });
                document.getElementById("my_modal_3").close();
                toast.success("Lokasi berhasil disimpan");
            }
        } catch (error) {
            console.error("Gagal menyimpan lokasi:", error);
        }
    };

    // Ambil lokasi absen dari API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await Api.get(`location`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.data.success) {
                    const data = response.data.data;
                    setLocation(data);
                    setLat(data.latitude);
                    setLon(data.longitude);
                    setRadius(data.radius);
                } else {
                    console.error("Gagal mengambil data lokasi:", response.data.message);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [token]);

    // Ambil lokasi user saat ini
    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation({ latitude, longitude });
                },
                (error) => {
                    console.error("Gagal mendapatkan lokasi user:", error);
                }
            );
        }
    }, []);

    return (
        <>
            <TitleCard title={"Batas Radius Absen"} TopSideButtons={<TopSideButtons click={() => document.getElementById('my_modal_3').showModal()} />}>
                <div className="bg-white p-4 rounded-lg shadow-md">
                    {location && location.latitude && location.longitude ? (
                        <LocationMap lat={location.latitude} lon={location.longitude} radius_absen={location.radius} />
                    ) : (
                        <p className="text-gray-500">Memuat lokasi...</p>
                    )}

                    {location && location.radius && (
                        <>
                         <p className="text-gray-600 mt-4">
                            Radius absen diatur <span className="font-bold">{location.radius} meter</span> dari titik absen.
                        </p>
                           
                             <p className="text-gray-600 mt-4">
                            untuk lingkaran <span className="text-[#0000ff]">biru </span>pada peta di atas adalah radius absen yang telah diatur.
                         </p>
                         </>
                       
                    )}
                </div>
            </TitleCard>
            <dialog id="my_modal_3" className="modal">
                <div className="modal-box">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <h3 className="font-bold text-lg">Edit Lokasi Absen</h3>
                    <div className="form-control mt-4">
                        <label className="label"><span className="label-text">Latitude</span></label>
                        <input type="number" value={lat} onChange={(e) => setLat(parseFloat(e.target.value))} className="input input-bordered" />
                    </div>
                    <div className="form-control mt-4">
                        <label className="label"><span className="label-text">Longitude</span></label>
                        <input type="number" value={lon} onChange={(e) => setLon(parseFloat(e.target.value))} className="input input-bordered" />
                    </div>
                    <div className="form-control mt-4">
                        <label className="label"><span className="label-text">Radius (meter)</span></label>
                        <input type="number" value={radius} onChange={(e) => setRadius(parseInt(e.target.value))} className="input input-bordered" />
                    </div>
                    <div className="form-control mt-4">
                        <button type="button" onClick={handleSave} className="btn btn-primary">Simpan</button>
                    </div>
                </div>
            </dialog>
        </>
    );
}

export default Charts;
