import React from 'react'
import { NavLink } from 'react-router-dom' 
import login_icon from '../assets/logout_icon.png'
import song_icon from '../assets/song_icon.png'
import artist_icon from '../assets/artist_icon.png'
import album_icon from '../assets/album_icon.png'
import category_icon from '../assets/category_icon.png'


const Sidebar = ({ setToken }) => { 

  const logout = () => {
    setToken(''); // Xóa token trong state
    localStorage.removeItem('token'); // Xóa token trong localStorage (để chắc chắn)
  }

  return (
    <div className='bg-[#003A10] min-h-screen pl-[4vw]'>
        <div className='text-white text-3xl font-bold mt-5 mb-10'>
            Spotify Admin
        </div>

        <div className='flex flex-col gap-5 mt-10'>
            <NavLink 
              to='/songs' 
              className={({isActive}) => `flex items-center gap-2.5 p-2 pr-[max(8vw,10px)] text-sm font-medium ${isActive ? 'bg-green-600 text-white' : 'bg-white text-gray-800 border border-black'}`}>
                <img src={song_icon} className='w-5' alt="" />
                <p className='hidden sm:block'>Quản lý Bài hát</p>
            </NavLink>

            <NavLink 
              to='/artists' 
              className={({isActive}) => `flex items-center gap-2.5 p-2 pr-[max(8vw,10px)] text-sm font-medium ${isActive ? 'bg-green-600 text-white' : 'bg-white text-gray-800 border border-black'}`}
            >
                <img src={artist_icon} className='w-5' alt="" /> 
                <p className='hidden sm:block'>Quản lý Nghệ sĩ</p>
            </NavLink>

            <NavLink 
              to='/albums' 
              className={({isActive}) => `flex items-center gap-2.5 p-2 pr-[max(8vw,10px)] text-sm font-medium ${isActive ? 'bg-green-600 text-white' : 'bg-white text-gray-800 border border-black'}`}
            >
                <img src={album_icon} className='w-5' alt="" /> 
                <p className='hidden sm:block'>Quản lý Album</p>
            </NavLink>

            <NavLink 
              to='/categories' 
              className={({isActive}) => `flex items-center gap-2.5 p-2 pr-[max(8vw,10px)] text-sm font-medium ${isActive ? 'bg-green-600 text-white' : 'bg-white text-gray-800 border border-black'}`}
            >
                <img src={category_icon} className='w-5' alt="" /> 
                <p className='hidden sm:block'>Quản lý Thể loại</p>
            </NavLink>
        </div>
        <div className='mt-10'>
            <button 
                onClick={logout}
                className='flex items-center gap-2.5 p-2 pr-[max(8vw,10px)] text-sm font-medium bg-white text-gray-800 border border-black cursor-pointer hover:bg-red-100 w-full sm:w-auto'
            >
                {/* Bạn có thể thay đổi icon bên dưới thành icon logout nếu có */}
                <img src={login_icon} className='w-5 rotate-180' alt="Logout" /> 
                <p className='hidden sm:block'>Đăng xuất</p>
            </button>
        </div>
    </div>
  )
}

export default Sidebar