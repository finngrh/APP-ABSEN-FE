import DashboardStats from './components/DashboardStats'
import TableUser from './components/TableUser'


import UserGroupIcon  from '@heroicons/react/24/outline/UserGroupIcon'
import UsersIcon  from '@heroicons/react/24/outline/UsersIcon'
import CircleStackIcon  from '@heroicons/react/24/outline/CircleStackIcon'
import CreditCardIcon  from '@heroicons/react/24/outline/CreditCardIcon'
import { useDispatch } from 'react-redux'
import { useEffect, useState } from 'react'
import Api from '../../api'
import Cookies from 'js-cookie'







function Dashboard(){

    const token = Cookies.get("token");
    const [dashboard, setDashboard] = useState([]);
    const statsData = [
        {title : "Statistik Harian", value : dashboard.count_hari_ini, icon : <UserGroupIcon className='w-8 h-8'/>, description : ""},
        {title : "Statistik Mingguan", value : dashboard.count_mingguan, icon : <UserGroupIcon className='w-8 h-8'/>, description : ""},
        {title : "Statistik Bulanan", value : dashboard.count_bulanan, icon : <UserGroupIcon className='w-8 h-8'/>, description : "Berdasarkan Bulan Sekarang"},
    ]
    

    const dispatch = useDispatch()

        useEffect(() => {
            const fetchData = async () => {
              try {
                const response = await Api.get('dashboard', {
                  headers: { Authorization: `Bearer ${token}` },
                });
        
                if (response.data.success) {
                    setDashboard(response.data.data);
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
 


    return(
        <>
     
           
        
        {/** ---------------------- Different stats content 1 ------------------------- */}
            <div className="grid lg:grid-cols-4 mt-2 md:grid-cols-2 grid-cols-1 gap-6">
                {
                    statsData.map((d, k) => {
                        return (
                            <DashboardStats key={k} {...d} colorIndex={k}/>
                        )
                    })
                }
            </div>

            <div className="grid-cols-1 gap-6">
                <TableUser />
            </div>


        </>
    )
}

export default Dashboard