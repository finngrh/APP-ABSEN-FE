import routes from '../routes/sidebar'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { XMarkIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import swal from 'sweetalert2';
import Api from '../api';

function LeftSidebar() {
    const location = useLocation();
    const navigate = useNavigate();

    const logout = async (e) => {
        e.preventDefault();
        const result = await swal.fire({
            title: "Logout?",
            text: "Anda yakin ingin keluar?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Ya",
            cancelButtonText: "Batal",
        });

        if (result.isConfirmed) {
            try {
                await Api.post("/logout");

                Cookies.remove("user");
                Cookies.remove("token");

                toast.success("Logout Berhasil!", { position: "top-right" });
                navigate("/");
            } catch (error) {
                toast.error("Gagal logout, coba lagi!", { position: "top-right" });
            }
        }
    };

    const closeSidebar = () => {
        document.getElementById('left-sidebar-drawer').click();
    };

    return (
        <div className="drawer-side z-30">
            <label htmlFor="left-sidebar-drawer" className="drawer-overlay"></label>
            <ul className="menu pt-3 w-60 bg-white dark:bg-gray-900 min-h-full text-gray-700 dark:text-gray-300 shadow">
                
                {/* Close Button */}
                <button 
                    className="absolute top-3 right-3 p-1 bg-gray-200 dark:bg-gray-700 rounded-full lg:hidden hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                    onClick={closeSidebar}
                >
                    <XMarkIcon className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                </button>

                {/* Logo */}
                <li className="mb-3 flex items-center space-x-2 px-3">
                    <img className=" h-16" src="/logo.png" alt="Logo" />
                    <span className="text-sm font-semibold text-gray-800 dark:text-white">Sistem Absen Dosen</span>
                </li>

                {/* Menu Items */}
                {routes.map((route, k) => (
                    <li key={k}>
                        <NavLink
                            end
                            to={route.path}
                            className={({ isActive }) => `
                                flex items-center px-3 py-2 rounded-md transition-all
                                ${isActive ? '' : 'hover:bg-gray-200 dark:hover:bg-gray-800'}
                            `}
                        >
                            {route.icon}
                            <span className="ml-2">{route.name}</span>
                        </NavLink>
                    </li>
                ))}

                {/* Logout Button */}
                <button
                    onClick={logout}
                    className="flex items-center w-full px-3 py-2 mt-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all"
                >
                    <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                    Logout
                </button>
            </ul>
        </div>
    );
}

export default LeftSidebar;
