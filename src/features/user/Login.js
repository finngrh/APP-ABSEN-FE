import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import Api from "../../api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
  const navigate = useNavigate();

  console.log(Cookies.get("token"));

  const checkInternetConnection = () => {
    return navigator.onLine;
  };

  const login = async (e) => {
    e.preventDefault();
    if (!checkInternetConnection()) {
      toast.error("Tidak ada koneksi internet. Periksa jaringan Anda dan coba lagi.");
      return;
    }

    setIsSubmitDisabled(true);
    try {
      const response = await Api.post("/auth/login", {
        email,
        password,
      });

      console.log("Response data:", response.data);

      if (response.status === 200 && response.data.access_token) {
        navigate("/app/dashboard");

        Cookies.set("token", response.data.access_token);
        Cookies.set("user", JSON.stringify(response.data.user));
        Cookies.set("permissions", JSON.stringify(response.data.permissions));

        console.log("Token:", Cookies.get("token"));
        console.log("User:", Cookies.get("user"));
        console.log("Permissions:", Cookies.get("permissions"));

        toast.success("Login Berhasil!");
      } else {
        toast.error("Status respons tidak terduga: " + response.status);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Terjadi kesalahan");
      console.error(error);
    } finally {
      setIsSubmitDisabled(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
        {/* Tambahkan Logo */}
        <div className="flex justify-center mb-4">
          <img src='/logo.png' alt="Logo" className="h-20" />
        </div>

        <h2 className="text-xl font-bold text-center text-gray-800 mb-6">Sistem Absen Dosen</h2>
        <form onSubmit={login} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan email"
              className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-400 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-400 focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isSubmitDisabled ? "Loading..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
