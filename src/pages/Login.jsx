import React, { useState } from 'react';
import axios from 'axios';
import {toast} from 'react-toastify';

const Login = ({setToken}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${backendUrl}/api/auth/login`,{
                email,
                password
            });

            if(response.data.success) {
                // kiem tra admin
                // response.data.user.role lay tu api viet backend

                if(response.data.user.role !== 'admin') {
                    toast.error("Bạn không có quyền truy cập trang Admin!");
                    return ;
                }

                const token = response.data.token;
                localStorage.setItem('token', token);
                setToken(token);

                toast.success("Đăng nhập thành công!");
            }else {
                toast.error(response.data.message);
            }

        }catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Lỗi đăng nhập");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center w-full bg-gray-50">
            <div className="bg-white shadow-md rounded-lg px-8 py-6 max-w-md w-full">
                <h1 className='text-2xl font-bold mb-4 text-center'>Admin Panel</h1>
                <form onSubmit={onSubmitHandler}>
                    <div className='mb-4'>
                        <p className='text-sm font-medium text-gray-700 mb-2'>Email Address</p>
                        <input 
                        onChange={(e) => setEmail(e.target.value)} 
                        value={email}
                        className='rounded-md w-full px-3 py-2 border border-gray-300 outline-none focus:border-green-500' 
                        type="email" 
                        placeholder='your@email.com' 
                        required 
                        />
                    </div>

                    <div className='mb-4'>
                        <p className='text-sm font-medium text-gray-700 mb-2'>Password</p>
                        <input 
                        onChange={(e) => setPassword(e.target.value)} 
                        value={password}
                        className='rounded-md w-full px-3 py-2 border border-gray-300 outline-none focus:border-green-500' 
                        type="password" 
                        placeholder='Enter your password' 
                        required 
                        />
                    </div>

                    <button className='mt-2 w-full py-2 px-4 rounded-md text-white bg-black hover:bg-gray-800 transition-colors' type="submit">
                        Login
                    </button>
                </form>
            </div>
        </div>
    )


}

export default Login;