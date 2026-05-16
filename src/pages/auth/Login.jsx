import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useGoogleLogin } from '@react-oauth/google';

const Login = ({ setToken, setRole }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    // ==================== EMAIL + PASSWORD ====================
    const onSubmitHandler = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${backendUrl}/api/auth/login`, { email, password });

            if (response.data.success) {
                const userRole = response.data.user.role;

                if (!['admin', 'artist'].includes(userRole)) {
                    toast.error("Bạn không có quyền truy cập Admin Tool!");
                    return;
                }

                // === CẬP NHẬT STATE (Quan trọng) ===
                setToken(response.data.token);
                setRole(userRole);
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('role', userRole);

                toast.success("Đăng nhập thành công!");
                // KHÔNG DÙNG window.location.href
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Đăng nhập thất bại");
        }
    };

    // ==================== GOOGLE LOGIN ====================
    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {

                const res = await axios.post(`${backendUrl}/api/auth/google`, {
                    accessToken: tokenResponse.access_token,
                });

                if (res.data.success) {
                    const userRole = res.data.user.role;  

                    if (!['admin', 'artist'].includes(userRole)) {
                        toast.error("Tài khoản này không có quyền truy cập Admin Tool");
                        return;
                    }

                    // Set cả token và role
                    setToken(res.data.token);
                    setRole(userRole);
                    localStorage.setItem('token', res.data.token);
                    localStorage.setItem('role', userRole);

                    toast.success("Đăng nhập Google thành công!");

                    // Chuyển trang theo role
                    if (userRole === 'admin') {
                        window.location.href = '/admin';
                    } else {
                        window.location.href = '/studio';
                    }
                }
            } catch (error) {
                console.error("Google Login Error:", error);
                toast.error("Đăng nhập Google thất bại");
            }
        },
        onError: () => toast.error("Đăng nhập Google thất bại"),
    });

    return (
        <main className="min-h-screen flex bg-[#131313] text-[#e5e2e1] font-sans">
            
            {/* ==================== PHẦN BÊN TRÁI (GIAO DIỆN ĐẸP) ==================== */}
            <section className="hidden lg:flex w-1/2 flex-col justify-between p-12 relative overflow-hidden border-r border-[#3d4a3d]/30">
                <div 
                    className="absolute inset-0 z-0 opacity-50 mix-blend-luminosity"
                    style={{ 
                        backgroundImage: "url('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop')", 
                        backgroundSize: 'cover', 
                        backgroundPosition: 'center' 
                    }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-b from-[#131313]/40 via-[#131313]/80 to-[#131313] z-0"></div>

                {/* Logo + Tên */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#53e076] rounded-full flex items-center justify-center text-[#003914]">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-black tracking-tight text-[#e5e2e1] uppercase">Creator Studio</h1>
                </div>

                {/* Nội dung chính */}
                <div className="relative z-10 max-w-xl">
                    <h2 className="text-6xl font-black leading-[1.1] mb-6 tracking-tight text-white drop-shadow-lg">
                        Empower your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#53e076] to-[#ebb2ff]">
                            sonic vision.
                        </span>
                    </h2>
                    <p className="text-lg text-[#bccbb9] max-w-md font-medium leading-relaxed">
                        Join the next generation platform designed for artists to upload, manage, and analyze their music.
                    </p>
                </div>

                <div className="relative z-10 text-sm text-[#869585] font-medium">
                    © 2026 Creator Studio Platform.
                </div>
            </section>

            {/* ==================== PHẦN FORM ĐĂNG NHẬP ==================== */}
            <section className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 xl:px-32 bg-[#131313]">
                <div className="w-full max-w-md mx-auto">
                    
                    <div className="mb-10">
                        <h2 className="text-3xl font-bold mb-2">Welcome back</h2>
                        <p className="text-[#bccbb9] text-sm">Sign in to access your dashboard</p>
                    </div>

                    {/* FORM EMAIL + PASSWORD */}
                    <form onSubmit={onSubmitHandler} className="flex flex-col gap-5">
                        <div>
                            <label className="text-sm font-semibold">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#201f1f] border border-[#3d4a3d] rounded-xl py-3 px-4 mt-2 focus:outline-none focus:border-[#53e076]"
                                placeholder="name@domain.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm font-semibold">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#201f1f] border border-[#3d4a3d] rounded-xl py-3 px-4 mt-2 focus:outline-none focus:border-[#53e076]"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#53e076] text-[#003914] font-bold py-3.5 rounded-full mt-4 hover:bg-[#1db954] transition-all"
                        >
                            Login
                        </button>
                    </form>

                    {/* PHẦN GOOGLE */}
                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-[#3d4a3d]"></div>
                        <span className="text-sm text-[#869585]">OR</span>
                        <div className="flex-1 h-px bg-[#3d4a3d]"></div>
                    </div>

                    <button
                        onClick={() => googleLogin()}
                        className="w-full flex items-center justify-center gap-3 bg-[#201f1f] border border-[#3d4a3d] hover:bg-[#2a2a2a] text-white font-semibold py-3 rounded-full transition-all"
                    >
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                        Continue with Google
                    </button>
                </div>
            </section>
        </main>
    );
};

export default Login;