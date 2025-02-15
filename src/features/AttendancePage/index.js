import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import Api from "../../api";
import Cookies from "js-cookie";

const AttendancePage = () => {
  const [name, setName] = useState("");
  const [attendanceList, setAttendanceList] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showLocationError, setShowLocationError] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [lat, setLat] = useState(0);
  const [lon, setLon] = useState(0);
  const [radius, setRadius] = useState(100);
  const token = Cookies.get("token");
  const [userLat, setLatUser] = useState(0);
  const [userLon, setLonUser] = useState(0);
  const [absen, setAbsen] = useState([]);
  const [absenCek, setAbsenCek] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Api.get("location", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          console.log("Response data:", response.data);
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

    const fetchAbsen = async () => {
      try {
        const response = await Api.get("absensi", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          setAbsen(response.data.absensi);
          console.log(response.data.absensi);
        } else {
          console.error("Gagal mengambil data absen:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching absen data:", error);
      }
    };

    const checkAbsen = async () => {
      try {
        const response = await Api.get("absensi/update-status", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          setAbsenCek(response.data);
          console.log(response.data);
        } else {
          console.error("Gagal mengambil data absen:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching absen data:", error);
      }
    };

    fetchData();
    checkAbsen();
    fetchAbsen();
  }, [token]);

  const addAbsen = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("latitude", userLat);
      formData.append("longitude", userLon);

      if (photo) {
        const base64Data = photo.split(",")[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "image/jpeg" });
        formData.append("selfie", blob, "photo.jpg");
      } else {
        toast.error("Foto selfie diperlukan untuk absen.");
        setLoading(false);
        return;
      }

      const response = await Api.post("/absensi", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        toast.success("Absen berhasil disimpan");
        setPhoto(null);
        setShowModal(false);

        // Update the attendance list with the new entry
        setAbsen([...absen, response.data.absensi]);
      } else {
        console.error("Error adding absen:", response.data.message.errors);
        toast.error("Gagal menyimpan absen: " + response.data.message);
      }
    } catch (error) {
      toast.error("Terjadi kesalahan: " + error.message);
      console.error(
        "Error adding absen:",
        error.response ? error.response.data.errors : error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetCamera = () => {
    setPhoto(null);
    startCamera();
  };

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((deviceInfos) => {
      const videoDevices = deviceInfos.filter(
        (device) => device.kind === "videoinput"
      );
      setDevices(videoDevices);
      if (videoDevices.length > 0) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    });
  }, []);

  const handleCapturePhoto = () => {
    const video = videoRef.current;
    const context = canvasRef.current.getContext("2d");

    // Draw the video stream into the canvas using its natural dimensions
    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    // Convert the canvas content to a data URL
    const dataUrl = canvasRef.current.toDataURL("image/jpeg");
    setPhoto(dataUrl);
  };

  const startCamera = () => {
    navigator.mediaDevices
      .getUserMedia({ video: { deviceId: selectedDeviceId } })
      .then((stream) => {
        const video = videoRef.current;
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          video.play();

          // Set canvas size to match the video stream's actual dimensions
          canvasRef.current.width = video.videoWidth;
          canvasRef.current.height = video.videoHeight;
        };
      })
      .catch((err) => {
        toast.error(
          "Tidak dapat mengakses kamera. Pastikan Anda memberi izin."
        );
      });
  };

  useEffect(() => {
    if (showModal) {
      startCamera();
    }
  }, [showModal, selectedDeviceId]);

  const handleAttendanceClick = () => {
    const userLat = -6.5858929;
    const userLon = 106.7585084417909;
    const distance = calculateDistance(userLat, userLon, lat, lon);
    setLatUser(userLat);
    setLonUser(userLon);
    if (distance > radius) {
      setShowLocationError(true);
    } else {
      setShowLocationError(false);
      setShowModal(true);
    }
  };

  // const handleAttendanceClick = () => {
  //   navigator.geolocation.getCurrentPosition(
  //     (position) => {
  //       const userLat = position.coords.latitude;
  //       const userLon = position.coords.longitude;
  //       const distance = calculateDistance(userLat, userLon, lat, lon);
  //       setLatUser(userLat);
  //       setLonUser(userLon);
  //       if (distance > radius) {
  //         setShowLocationError(true);
  //       } else {
  //         setShowLocationError(false);
  //         setShowModal(true);
  //       }
  //     },
  //     (error) => {
  //       console.error("Error getting user location:", error);
  //       toast.error("Tidak dapat mengakses lokasi. Pastikan Anda memberi izin.");
  //     }
  //   );
  // };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c * 1000; // Distance in meters
    return distance;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  console.log(absenCek.success);

  return (
    <>
      <div className="bg-white shadow-md rounded-lg w-100  mx-auto mt-5 p-6 transition-transform transform ">
        <div className="bg-white shadow-md rounded-lg w-full sm:w-1/3 mx-auto mt-5 p-6 transition-transform transform hover:scale-105">
          <h1 className="text-3xl font-bold text-center text-gray-800">
            Absen
          </h1>
          <p className="text-gray-500 text-center mt-2">
            Klik tombol di bawah untuk absen
          </p>

          <div className="flex justify-center mt-6">
            <button
              className={`flex items-center justify-center gap-2 px-6 py-6 rounded-full shadow-lg transition-all duration-200
    ${
      absenCek?.success
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-blue-600 hover:bg-blue-700 active:scale-95 text-white"
    }
  `}
              onClick={handleAttendanceClick}
              disabled={absenCek?.success}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-9"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                />
              </svg>
              {absenCek?.success ? "Sudah Absen" : "Absen Sekarang"}
            </button>
          </div>

          <p className="text-center text-sm text-gray-400 mt-2">
            Pastikan Anda berada di lokasi yang benar sebelum melakukan absen.
          </p>
        </div>

        <div className="w-full sm:w-2/3 mx-auto mt-8 overflow-x-auto">
          <h2 className="text-xl font-semibold text-gray-700 text-center mb-4">
            Daftar Kehadiran
          </h2>
          <table className="w-full border-collapse shadow-md rounded-lg overflow-hidden">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="p-3 text-left">Nama</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Jam Absen</th>
                <th className="p-3 text-center">Tanggal Absen</th>
              </tr>
            </thead>
            <tbody>
              {absen.map((mk) => (
                <tr
                  key={mk.id}
                  className="border-b hover:bg-gray-100 transition"
                >
                  <td className="p-3">{mk.user?.name}</td>
                  <td
                    className={`p-3 text-center ${
                      mk.status === "Hadir"
                        ? "text-green-600"
                        : mk.status === "Terlambat"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {mk.status}
                  </td>
                  <td className="p-3 text-center">
                    {new Date(mk.time).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "Asia/Jakarta",
                    })}
                  </td>
                  <td className="p-3 text-center">
                    {new Date(mk.time).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showLocationError && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#1c2229] p-6 rounded-lg shadow-lg w-1/2 md:w-1/3 relative">
            <button
              onClick={() => setShowLocationError(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-400 text-2xl cursor-pointer"
            >
              ✕
            </button>
            <h2 className="font-bold text-lg md:text-3xl dark:text-white">
              Error
            </h2>
            <p className="text-lg font-semibold mb-4">
              Posisi Anda jauh dari lokasi yang diperbolehkan.
            </p>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white dark:bg-[#1c2229] p-6 rounded-xl shadow-2xl w-11/12 md:w-1/3 relative transition-transform transform scale-95 animate-scaleUp backdrop-blur-md border border-gray-200 dark:border-gray-700">
            {/* Tombol Close */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-400 text-2xl cursor-pointer transition"
            >
              ✕
            </button>

            {/* Header */}
            <h2 className="font-bold text-xl md:text-3xl text-center dark:text-white">
              Silahkan Lakukan Absen
            </h2>

            {/* Deskripsi */}

            {/* Pilihan Kamera */}
            <label
              htmlFor="camera-select"
              className="block mt-4 text-gray-700 dark:text-white"
            >
              Pilih Kamera:
            </label>
            <select
              id="camera-select"
              className="mt-2 p-2 w-full bg-gray-100 text-black dark:bg-gray-700 rounded-md cursor-pointer focus:ring focus:ring-blue-300"
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              value={selectedDeviceId}
            >
              {devices.map((device, index) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${index + 1}`}
                </option>
              ))}
            </select>

            {/* Kamera dan Foto Preview */}
            {photo ? (
              <>
                <img
                  src={photo}
                  alt="Preview"
                  className="mt-4 w-full h-full object-cover rounded-lg shadow-md cursor-pointer transition hover:scale-105"
                />
                <button
                  onClick={handleResetCamera}
                  className="mt-4 p-2 w-full bg-gray-100 dark:bg-gray-700 text-black rounded-md shadow-md hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                >
                  Ambil Ulang <i className="fa-solid fa-camera ml-2"></i>
                </button>
              </>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  className="mt-4 w-full h-full object-cover rounded-lg shadow-md cursor-pointer"
                ></video>
                <button
                  onClick={handleCapturePhoto}
                  className="mt-4 p-2 w-full bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 transition"
                >
                  Ambil Foto <i className="fa-solid fa-camera ml-2"></i>
                </button>
                <canvas
                  ref={canvasRef}
                  className="hidden"
                  width={640}
                  height={480}
                ></canvas>
              </>
            )}

            {/* Tombol Simpan */}
            <div className="flex justify-center">
              <button
                className="mt-4 p-2 w-full md:w-[200px] bg-green-500 text-white rounded-md shadow-md text-2xl text-bold hover:bg-green-600 transition"
                onClick={addAbsen}
                disabled={loading}
              >
                {loading ? "Loading..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AttendancePage;
