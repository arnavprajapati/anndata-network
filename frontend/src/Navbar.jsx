import React, { useState } from 'react';
import { Activity, LogIn, ChevronDown, Menu, X, LayoutDashboard, LogOut } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import image1 from './assets/logo.jpg';

const navLinks = [
];

function Navbar({ onLoginClick, isLoggedIn, onLogout, userRole, userName }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
    const closeMobileMenu = () => setMobileMenuOpen(false);

    const dashboardPath = userRole === 'ngo' ? '/ngo-dashboard' : '/donor-dashboard';

    return (
        <nav className="bg-white fixed top-0 w-full z-[100] shadow-md border-b border-gray-100">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-20 py-3">
                <div className="flex items-center justify-between">

                    <Link to="/" className="flex items-center space-x-2 cursor-pointer group" onClick={closeMobileMenu}>
                        <div className="relative">
                            <img
                                src={image1}
                                alt="Logo"
                                className="w-10 h-14 object-contain group-hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                        <span className="text-2xl font-black text-[#333333] tracking-tighter group-hover:text-[#2D8659] transition-colors duration-300">
                            Annदाता
                        </span>
                    </Link>

                    <div className="hidden lg:flex items-center space-x-8">
                        {!isLoggedIn ? (
                            <div className="flex items-center space-x-6">
                                {navLinks.map((link) => (
                                    <NavLink 
                                        key={link.name} 
                                        to={link.href}
                                        className={({ isActive }) => 
                                            `text-sm font-bold uppercase tracking-wider transition duration-200 ${isActive ? 'text-[#2D8659]' : 'text-gray-600 hover:text-[#2D8659]'}`
                                        }
                                    >
                                        {link.name}
                                    </NavLink>
                                ))}
                                <button
                                    onClick={onLoginClick}
                                    className="py-2.5 px-6 text-white rounded-xl font-black text-sm bg-[#2D8659] hover:bg-black transition duration-300 flex items-center shadow-lg active:scale-95 transform cursor-pointer uppercase tracking-widest"
                                >
                                    <LogIn className="w-4 h-4 mr-2" />
                                    Login / Sign Up
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link 
                                    to={dashboardPath}
                                    className="flex items-center space-x-2 bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl hover:border-[#2D8659] transition group cursor-pointer"
                                >
                                    <div className="w-8 h-8 bg-[#2D8659] rounded-lg flex items-center justify-center text-white shadow-sm group-hover:rotate-12 transition-transform">
                                        <LayoutDashboard className="w-4 h-4" />
                                    </div>
                                    <div className="text-left leading-tight">
                                        <p className="text-xs font-black text-gray-800 uppercase tracking-tighter">{userName || 'User'}</p>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase">{userRole || 'Member'}</p>
                                    </div>
                                </Link>

                                <button
                                    onClick={onLogout}
                                    className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition duration-200 cursor-pointer border border-transparent hover:border-red-100"
                                    title="Logout"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={toggleMobileMenu}
                        className="lg:hidden p-2 rounded-lg bg-gray-50 text-gray-700 hover:text-[#2D8659] transition duration-200"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {mobileMenuOpen && (
                    <div className="lg:hidden mt-3 pb-6 border-t border-gray-100 pt-4 animate-in slide-in-from-top duration-300">
                        {!isLoggedIn ? (
                            <div className="space-y-4">
                                <button
                                    onClick={() => { onLoginClick(); closeMobileMenu(); }}
                                    className="w-full py-4 text-white rounded-2xl font-black bg-[#2D8659] shadow-xl flex items-center justify-center"
                                >
                                    <LogIn className="w-5 h-5 mr-2" />
                                    LOGIN / SIGN UP
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <Link 
                                    to={dashboardPath}
                                    onClick={closeMobileMenu}
                                    className="flex items-center space-x-4 bg-gray-50 p-4 rounded-2xl border border-gray-200"
                                >
                                    <div className="w-12 h-12 bg-[#2D8659] rounded-xl flex items-center justify-center text-white font-black text-xl">
                                        {userName?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-black text-gray-800 uppercase tracking-tight">{userName}</p>
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{userRole} PANEL</p>
                                    </div>
                                </Link>

                                <button
                                    onClick={() => { onLogout(); closeMobileMenu(); }}
                                    className="w-full py-4 text-red-600 rounded-2xl font-black bg-red-50 flex items-center justify-center border border-red-100"
                                >
                                    <LogOut className="w-5 h-5 mr-2" />
                                    LOGOUT
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;