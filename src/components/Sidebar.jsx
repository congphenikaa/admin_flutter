import React from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'

const Sidebar = () => {
  return (
    <div className='bg-[#003A10] min-h-screen pl-[4vw]'>
        <div className='text-white text-3xl font-bold mt-5 mb-10'>
            Spotify Admin
        </div>

        <div className='flex flex-col gap-5 mt-10'>
            {/* LINK DUY NHẤT: BÀI HÁT */}
            <NavLink to='/songs' className={({isActive}) => `flex items-center gap-2.5 p-2 pr-[max(8vw,10px)] text-sm font-medium ${isActive ? 'bg-green-600 text-white' : 'bg-white text-gray-800 border border-black'}`}>
                <img src={assets.song_icon} className='w-5' alt="" />
                <p className='hidden sm:block'>Quản lý Bài hát</p>
            </NavLink>

            {/* Sau này có thể thêm: Quản lý Album, Nghệ sĩ... */}
        </div>
    </div>
  )
}

export default Sidebar