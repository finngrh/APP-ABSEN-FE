import moment from "moment";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import TitleCard from "../../components/Cards/TitleCard";
import { showNotification } from "../common/headerSlice";
import Api from "../../api";
import Cookies from "js-cookie";
import swal from "sweetalert2";
import Select from "react-select";

const TopSideButtons = ({ openModal, ExportCSV }) => {
  return (
    <div className="flex space-x-2 ">
      <button
        className="btn btn-primary btn-sm"
        onClick={() => openModal(null)}
      >
        Add Dosen
      </button>
      <button
              className="btn btn-primary btn-sm"
              onClick={() =>
                document.getElementById("importExcelModal").showModal()
              }
            >
              Import Excel
            </button>
      <div className="dropdown dropdown-bottom dropdown-end">
        <button tabIndex={0} className="btn btn-secondary btn-sm">
          Import/Export
        </button>
        <ul
          tabIndex={0}
          className="dropdown-content menu bg-base-100 rounded-box w-52 p-2 shadow"
        >
          <li>
            <button className="dropdown-item" onClick={ExportCSV}>
              Export CSV
            </button>
          </li>
          <li>
           
          </li>
        </ul>
      </div>
    </div>
  );
};

function Leads() {
  const [leads, setLeads] = useState([]);
  const [matkul, setMatkul] = useState([]);
  const [selectedDosen, setSelectedDosen] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedMatkul, setSelectedMatkul] = useState([]);
  const [emailError, setEmailError] = useState("");
  const handleEmailError = (error) => {};
  const [nipError, setNipError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const token = Cookies.get("token");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const options = matkul.map((mk) => ({ value: mk.id, label: mk.nama }));

  useEffect(() => {
    Promise.all([fetchData(), fetchMatkul()]);
  }, []);

  const downloadTemplate = () => {
    const link = document.createElement("a");
    link.href = "/template-import-dosen.xlsx"; // Sesuaikan path file template
    link.setAttribute("download", "Template-import-dosen.xlsx");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      swal.fire("Error", "Pilih file sebelum mengunggah!", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    setIsLoading(true); // Start loading

    try {
      const response = await Api.post("import-users", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      swal.fire("Success", "Data dosen berhasil diimport!", "success");
      fetchData();
      document.getElementById("importExcelModal").close(); // Close modal
    } catch (error) {
      console.error("Error uploading file:", error);
      swal.fire("Error", "Gagal mengunggah file.", "error");
    } finally {
      setIsLoading(false);
      setSelectedFile(null);
    }
  };

  const ExportCSV = async () => {
    try {
      const response = await Api.get(`export-users`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      // Buat URL untuk blob
      const url = window.URL.createObjectURL(response.data);

      // Buat elemen <a> untuk mengunduh file
      const a = document.createElement("a");
      a.href = url;
      a.download = "data-dosen.xlsx"; // Nama file
      document.body.appendChild(a);
      a.click();

      // Hapus elemen <a> setelah download
      document.body.removeChild(a);

      console.log("Export CSV berhasil!");
    } catch (error) {
      console.error("Error fetching CSV:", error);
    }
  };

  const fetchData = async () => {
    try {
      const response = await Api.get(`dosens`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeads(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchMatkul = async () => {
    try {
      const response = await Api.get(`mata-kuliahs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMatkul(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchMatkul();
  }, []);

  const openModal = (dosen) => {
    setSelectedDosen(dosen);
    setSelectedMatkul(
      dosen
        ? dosen.mata_kuliahs.map((mk) => ({ value: mk.id, label: mk.nama }))
        : []
    );
    setEmailError("");
    setNipError("");
    setPasswordError("");
    document.getElementById("modal_dosen").showModal();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    data.mata_kuliah_ids = selectedMatkul.map((mk) => mk.value);

    setEmailError("");
    setNipError("");
    setPasswordError("");

    if (!selectedDosen && data.password.length < 8) {
      setPasswordError("Password harus minimal 8 karakter");
      return;
    }

    if (data.nip.length !== 16 || isNaN(data.nip)) {
      setNipError("NIP harus 16 angka");
      return;
    }

    try {
      if (selectedDosen) {
        await Api.put(`dosens/${selectedDosen.id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await Api.post("dosens", data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      document.getElementById("modal_dosen").close();
      fetchData();
      swal.fire("Success", "Data saved successfully", "success");
    } catch (error) {
      console.error("Error saving data:", error);
      console.log("Error response:", error.response.data.message);

      if (
        error.response?.data?.errors?.nip?.includes(
          "The nip has already been taken."
        )
      ) {
        setNipError("NIP sudah digunakan");
      }

      if (
        error.response?.data?.errors?.email?.includes(
          "The email has already been taken."
        )
      ) {
        setEmailError("Email sudah digunakan");
      }
    }
  };

  const deleteDosen = async (id) => {
    swal
      .fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        cancelButtonText: "No, keep it",
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          try {
            await Api.delete(`dosens/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            fetchData();
            swal.fire("Deleted!", "Your file has been deleted.", "success");
          } catch (error) {
            console.error("Error deleting data:", error);
          }
        }
      });
  };

  return (
    <>
      <TitleCard
        title="Data User"
        topMargin="mt-2"
        TopSideButtons={
          <TopSideButtons openModal={openModal} ExportCSV={ExportCSV} />
        }
      >
        <div className="overflow-x-auto w-full">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>NIP</th>
                <th>Mata Kuliah</th>
                <th>Email</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l, k) => (
                <tr key={k}>
                  <td>{l.name}</td>
                  <td>{l.nip}</td>
                  <td>
                    {l.mata_kuliahs.map((mk) => (
                      <div key={mk.id} className="badge badge-info mr-1 mb-1">
                        {mk.nama}
                      </div>
                    ))}
                  </td>
                  <td>{l.email}</td>
                  <td>{moment(l.updated_at).format("YYYY-MM-DD")}</td>
                  <td className="flex space-x-2">
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => deleteDosen(l.id)}
                    >
                      Delete
                    </button>
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={() => openModal(l)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TitleCard>

      {/* Modal */}
      <dialog id="modal_dosen" className="modal">
        <div className="modal-box rounded-xl shadow-lg">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-xl text-center">
            {selectedDosen ? "Edit Dosen" : "Tambah Dosen"}
          </h3>
          <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
            <div>
              <label className="form-label">NIP</label>
              <input
                type="text"
                name="nip"
                defaultValue={selectedDosen?.nip || ""}
                className={`input input-bordered w-full ${
                  nipError ? "border-red-500" : ""
                }`}
                placeholder="NIP"
                required
                pattern="\d{16}"
                title="NIP harus 16 angka"
              />
              {nipError && <p className="text-red-500">{nipError}</p>}
            </div>
            <div>
              <label className="form-label">Name</label>
              <input
                type="text"
                name="name"
                defaultValue={selectedDosen?.name || ""}
                className="input input-bordered w-full"
                placeholder="Name"
                required
              />
            </div>
            <div>
              <label className="form-label">Mata Kuliah</label>
              <Select
                options={options}
                isMulti
                value={selectedMatkul}
                onChange={setSelectedMatkul}
                className="basic-multi-select"
                classNamePrefix="select"
              />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                defaultValue={selectedDosen?.email || ""}
                className={`input input-bordered w-full ${
                  emailError ? "border-red-500" : ""
                }`}
                placeholder="Email"
                required
              />
              {emailError && <p className="text-red-500">{emailError}</p>}
            </div>
            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className={`input input-bordered w-full ${
                    passwordError ? "border-red-500" : ""
                  }`}
                  placeholder="Password (Min 8 karakter)"
                  minLength={selectedDosen ? 0 : 8}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {passwordError && <p className="text-red-500">{passwordError}</p>}
            </div>
            <input
              type="hidden"
              name="_method"
              value={selectedDosen ? "PUT" : "POST"}
            />
            <div className="modal-action">
              <button type="submit" className="btn btn-primary">
                Save
              </button>
            </div>
          </form>
        </div>
      </dialog>

      {/* Modal Import Excel */}
      <dialog id="importExcelModal" className="modal">
        <form method="dialog" className="modal-box">
          <h3 className="font-bold text-lg">Import Data Dosen</h3>
          <p className="py-4">Unggah file Excel untuk mengimport data dosen.</p>

          {/* Download Template */}
          <button
            type="button"
            className="btn bg-blue-500 text-white text-xs mb-3"
            onClick={downloadTemplate}
          >
            Download Template
          </button>

          {/* Input Upload File */}
          <input
            type="file"
            className="file-input file-input-bordered w-full"
            onChange={handleFileChange}
          />

          {/* Tombol Submit & Close */}
          <div className="modal-action">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleFileUpload}
              disabled={isLoading}
            >
              {isLoading ? "Uploading..." : "Submit"}
            </button>
            <button className="btn">Close</button>
          </div>
        </form>
      </dialog>
    </>
  );
}

export default Leads;
