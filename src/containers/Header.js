import { themeChange } from 'theme-change'
import React, {  useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import BellIcon  from '@heroicons/react/24/outline/BellIcon'
import Bars3Icon  from '@heroicons/react/24/outline/Bars3Icon'
import MoonIcon from '@heroicons/react/24/outline/MoonIcon'
import SunIcon from '@heroicons/react/24/outline/SunIcon'
import { openRightDrawer } from '../features/common/rightDrawerSlice';
import { RIGHT_DRAWER_TYPES } from '../utils/globalConstantUtil'

import { NavLink,  Routes, Link , useLocation} from 'react-router-dom'


function Header(){

    const [currentTheme, setCurrentTheme] = useState(localStorage.getItem("theme"))
    const [showProfileModal, setShowProfileModal] = useState(false)

    useEffect(() => {
        themeChange(false)
        if(currentTheme === null){
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ) {
                setCurrentTheme("dark")
            }else{
                setCurrentTheme("light")
            }
        }
        // 👆 false parameter is required for react project
      }, [])
    return(
        // navbar fixed  flex-none justify-between bg-base-300  z-10 shadow-md
        
        <>
            <div className="navbar sticky top-0 bg-base-100  z-10 shadow-md ">

                {/* Menu toogle for mobile view or small screen */}
                <div className="flex-1">
                    <label htmlFor="left-sidebar-drawer" className="btn  drawer-button lg:hidden">
                    <Bars3Icon className="h-5 inline-block w-5"/></label>
                 
                </div>

                {/* Profile and Theme Toggle */}
                <div className="flex-none gap-2">
                    <div className="dropdown dropdown-end">
                        <label tabIndex={0} className="btn btn-ghost btn-circle avatar" onClick={() => setShowProfileModal(true)}>
                            <div className="w-10 rounded-full">
                                <img src="https://placeimg.com/80/80/people" alt="profile"/>
                            </div>
                        </label>
                    </div>
                </div>

                {showProfileModal && (
                    <div className="modal modal-open z-100">
                        <div className="modal-box">
                            <h3 className="font-bold text-lg">Profile</h3>
                            <p className="py-4">User profile details go here.</p>
                            <div className="modal-action">
                                <button className="btn" onClick={() => setShowProfileModal(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                )}
            
            </div>

        </>
    )
}

export default Header