import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Login = ({ setToken }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${backendUrl}/api/auth/login`, {
                email,
                password
            });

            if (response.data.success) {
                const userRole = response.data.user.role;

                if (userRole !== 'admin' && userRole !== 'artist') {
                    toast.error("Bạn không có quyền truy cập!");
                    return;
                }

                const token = response.data.token;
                localStorage.setItem('token', token);
                localStorage.setItem('role', userRole);
                setToken(token);

                toast.success("Đăng nhập thành công!");

                if (userRole === 'admin') {
                    window.location.href = '/admin';
                } else if (userRole === 'artist') {
                    window.location.href = '/studio';
                }
            } else {
                toast.error(response.data.message);
            }

        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Lỗi đăng nhập");
        }
    }

    return (
        <main className="min-h-screen flex bg-[#131313] text-[#e5e2e1] font-sans selection:bg-[#53e076] selection:text-[#003914]">
            
            {/* LEFT SPLIT: Branding & Artwork với Hình ảnh thật */}
            <section className="hidden lg:flex w-1/2 flex-col justify-between p-12 relative overflow-hidden border-r border-[#3d4a3d]/30">
                
                {/* Background Image mang phong cách Music Studio */}
                <div 
                    className="absolute inset-0 z-0 opacity-50 mix-blend-luminosity"
                    style={{ 
                        backgroundImage: "url('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop')", 
                        backgroundSize: 'cover', 
                        backgroundPosition: 'center' 
                    }}
                ></div>
                
                {/* Dark Gradient Overlay để làm nổi bật chữ */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#131313]/40 via-[#131313]/80 to-[#131313] z-0"></div>

                {/* Abstract Background Elements (Hiệu ứng Neon) */}
                <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-[#53e076]/30 blur-[120px] pointer-events-none z-0"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#ebb2ff]/20 blur-[100px] pointer-events-none z-0"></div>
                
                {/* Grid Pattern overlay */}
                <div className="absolute inset-0 opacity-[0.05] z-0" style={{ backgroundImage: 'linear-gradient(#e5e2e1 1px, transparent 1px), linear-gradient(90deg, #e5e2e1 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
                
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#53e076] rounded-full flex items-center justify-center text-[#003914]">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-black tracking-tight text-[#e5e2e1] uppercase">Creator Studio</h1>
                </div>

                <div className="relative z-10 max-w-xl">
                    <h2 className="text-6xl font-black leading-[1.1] mb-6 tracking-tight text-white drop-shadow-lg">
                        Empower your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#53e076] to-[#ebb2ff] drop-shadow-none">
                            sonic vision.
                        </span>
                    </h2>
                    <p className="text-lg text-[#bccbb9] max-w-md font-medium leading-relaxed drop-shadow-md">
                        Join the next generation platform designed for artists to upload, manage, and analyze their music with AI-powered insights.
                    </p>
                </div>

                <div className="relative z-10 text-sm text-[#869585] font-medium">
                    © 2026 Creator Studio Platform.
                </div>
            </section>

            {/* RIGHT SPLIT: Form đăng nhập chuẩn UI Kit */}
            <section className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 xl:px-32 relative z-10 bg-[#131313]">
                <div className="w-full max-w-md mx-auto">
                    
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-12">
                        <div className="w-10 h-10 bg-[#53e076] rounded-full flex items-center justify-center text-[#003914]">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                            </svg>
                        </div>
                        <h1 className="text-xl font-black tracking-tight text-[#e5e2e1] uppercase">Creator Studio</h1>
                    </div>

                    <div className="mb-10">
                        <h2 className="text-3xl font-bold mb-2 text-[#e5e2e1]">Welcome back</h2>
                        <p className="text-[#bccbb9] font-medium text-sm">Enter your credentials to access your dashboard.</p>
                    </div>

                    <form onSubmit={onSubmitHandler} className="flex flex-col gap-5">
                        
                        {/* Email Input */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-[#e5e2e1]" htmlFor="email">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-[#869585] group-focus-within:text-[#53e076] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                    </svg>
                                </div>
                                <input 
                                    id="email"
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-[#201f1f] text-[#e5e2e1] placeholder-[#bccbb9]/50 border border-[#3d4a3d] rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-[#53e076] focus:ring-1 focus:ring-[#53e076]/50 transition-all" 
                                    style={{ boxShadow: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.05)' }}
                                    placeholder="name@domain.com" 
                                    required 
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-semibold text-[#e5e2e1]" htmlFor="password">Password</label>
                                <a className="text-sm font-medium text-[#53e076] hover:text-[#1db954] transition-colors" href="#">Forgot password?</a>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-[#869585] group-focus-within:text-[#53e076] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                    </svg>
                                </div>
                                <input 
                                    id="password"
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[#201f1f] text-[#e5e2e1] placeholder-[#bccbb9]/50 border border-[#3d4a3d] rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-[#53e076] focus:ring-1 focus:ring-[#53e076]/50 transition-all" 
                                    style={{ boxShadow: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.05)' }}
                                    placeholder="••••••••" 
                                    required 
                                />
                            </div>
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center gap-3 mt-2">
                            <input 
                                className="w-5 h-5 rounded border-[#3d4a3d] bg-[#201f1f] text-[#53e076] focus:ring-[#53e076] focus:ring-offset-0 focus:ring-offset-transparent cursor-pointer" 
                                id="remember" 
                                type="checkbox" 
                            />
                            <label className="text-sm text-[#bccbb9] cursor-pointer" htmlFor="remember">
                                Remember me for 30 days
                            </label>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col gap-4 pt-2">
                            <button 
                                type="submit" 
                                className="w-full bg-[#53e076] text-[#003914] font-bold py-4 rounded-full text-base shadow-[0_0_20px_rgba(83,224,118,0.3)] hover:scale-[1.02] hover:bg-[#1db954] active:scale-[0.98] transition-all"
                            >
                                Login
                            </button>
                            <button 
                                type="button" 
                                className="w-full bg-transparent border border-white/20 text-[#e5e2e1] font-bold py-4 rounded-full text-base hover:bg-white/5 transition-all"
                            >
                                Register as Artist
                            </button>
                        </div>
                    </form>

                    {/* Footer */}
                    <footer className="text-center mt-12">
                        <p className="text-sm text-[#869585]">
                            By continuing, you agree to Creator Studio's{' '}
                            <a className="text-[#e5e2e1] hover:text-[#53e076] transition-colors" href="#">Terms of Service</a> and{' '}
                            <a className="text-[#e5e2e1] hover:text-[#53e076] transition-colors" href="#">Privacy Policy</a>.
                        </p>
                    </footer>
                </div>
            </section>

        </main>
    );
}

export default Login;