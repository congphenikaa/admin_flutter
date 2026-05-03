import React from 'react'
import { Outlet } from 'react-router-dom'

const StudioLayout = ({setToken}) => {
  return (
    <div className="flex items-start min-h-screen bg-[#121212]">
      <div className="w-64 bg-[#1a1a1a] text-white p-4 min-h-screen">
        <div className="text-white text-2xl font-bold mb-10">
          Spotify Studio
        </div>
        <div className="text-gray-400 text-sm">
          Studio Sidebar Placeholder
        </div>
      </div>
      
      <div className="flex-1 h-screen overflow-y-scroll bg-[#121212]">
        <Outlet />
      </div>
    </div>
  )
}

export default StudioLayout
