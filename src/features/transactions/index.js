import React, { useState, useEffect } from "react";
import TitleCard from "../../components/Cards/TitleCard";
import Api from "../../api";
import Cookies from "js-cookie";

const TableUser = () => {
  const token = Cookies.get("token");

  // State untuk menyimpan daftar absensi
  const [trans, setTrans] = useState([]);

  // State untuk modal dan data yang akan ditampilkan
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [photoTab, setPhotoTab] = useState("check-in");
  const baseUrl = 'http://127.0.0.1:8000/storage/'
 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Api.get("absensi", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          setTrans(response.data.absensi);
          console.log("Data transaksi:", response.data);
        } else {
          console.error("Gagal mengambil data lokasi:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [token]);

  return (
    <>
      <TitleCard title="Recent Absen" topMargin="mt-2">
        <div className="overflow-x-auto w-full">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Waktu</th>
                <th>Tanggal</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {trans.map((l, k) => (
                <tr key={k}>
                  <td>
                    <p className="font-bold">{l.user?.name}</p>
                  </td>
                  <td>{l.user?.email}</td>
                  <td>
                    {new Date(l.time).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "Asia/Jakarta",
                    })}
                  </td>
                  <td>
                    {new Date(l.time).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </td>
                  <td className="flex space-x-2">
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={() => {
                        setSelectedRecord(l);
                        setIsModalOpen(true);
                      }}
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal untuk menampilkan detail absensi */}
        {isModalOpen && selectedRecord && (
          <dialog id="my_modal_3" className="modal modal-open">
            <div className="modal-box">
              <form method="dialog">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                >
                  ✕
                </button>
              </form>
              <h3 className="font-bold text-lg mb-2">Detail Absensi</h3>

              {/* Tab navigasi */}
              <div className="tabs">
                <a
                  className={`tab tab-lifted ${photoTab === "check-in" ? "tab-active border-b-2 border-blue-500" : ""}`}
                  onClick={() => setPhotoTab("check-in")}
                >
                  Foto
                </a>
                <a
                  className={`tab tab-lifted ${photoTab === "check-out" ? "tab-active border-b-2 border-blue-500" : ""}`}
                  onClick={() => setPhotoTab("check-out")}
                >
                  Posisi Absen
                </a>
              </div>

              {/* Konten berdasarkan tab */}
              <div className="mt-4">
                {photoTab === "check-in" ? (
                  <div className="flex justify-center">
                    {selectedRecord.selfie? (
                      <img
                        src={baseUrl + selectedRecord.selfie}
                        alt="Foto Check-in"
                        className="w-full max-w-sm rounded-lg shadow-md"
                      />
                    ) : (
                      <p className="text-gray-500">Foto Check-in tidak tersedia</p>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-64 mt-2">
                    {selectedRecord.latitude && selectedRecord.longitude ? (
                      <iframe
                        title="Google Maps"
                        width="100%"
                        height="100%"
                        style={{ border: 0, borderRadius: "8px" }}
                        loading="lazy"
                        allowFullScreen
                        src={`https://www.google.com/maps?q=${selectedRecord?.latitude},${selectedRecord?.longitude}&output=embed`}
                      />
                    ) : (
                      <p className="text-gray-500 text-center">Lokasi Check-in tidak tersedia</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </dialog>
        )}
      </TitleCard>
    </>
  );
};

export default TableUser;
