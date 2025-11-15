import React, { useState } from 'react';
import { Activity, LogIn, ChevronDown, Menu, X, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import image1 from './assets/logo.jpg'
const navLinks = [
    // { name: "Donate", href: "/donate", hasDropdown: false },
    // { name: "Our Impact", href: "/impact", hasDropdown: false },
    // { name: "Testimonials", href: "/testimonial", hasDropdown: false },
    // { name: "About Us", href: "/about", hasDropdown: false },
];

const NavItem = ({ name, href, hasDropdown, onClick }) => (
    <Link
        to={href}
        onClick={onClick}
        className="text-gray-700 hover:text-[#387ED1] font-semibold text-base transition duration-200 flex items-center space-x-1 whitespace-nowrap group relative"
    >
        <span className="relative">
            {name}
            <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-[#387ED1] transition-all duration-300 group-hover:w-full"></span>
        </span>
        {hasDropdown && <ChevronDown className="w-4 h-4 mt-0.5 ml-1 group-hover:rotate-180 transition-transform duration-300" />}
    </Link>
);

function Navbar({ onLoginClick, isLoggedIn, onLogout, userRole, userName }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
    const closeMobileMenu = () => setMobileMenuOpen(false);

    return (
        <nav className="bg-white fixed top-0 w-full z-50 shadow-md border-b border-gray-200">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-20 py-4">
                <div className="flex items-center justify-between">

                    <Link to="/" className="flex items-center space-x-2 cursor-pointer group" onClick={closeMobileMenu}>
                        <div className="relative">
                            <img
                                src={image1}
                                alt="Logo"
                                className="w-10 h-16 bg-amber-400 object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            <Activity className="w-4 h-4 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" strokeWidth={3} />
                        </div>
                        <span className="text-3xl font-extrabold text-[#333333] group-hover:text-[#387ED1] transition-colors duration-300">
                            Annदाता

                        </span>
                    </Link>

                    <div className="hidden lg:flex items-center space-x-8">
                        {!isLoggedIn && (
                            <>
                                {navLinks.map((link) => (
                                    <NavItem key={link.name} {...link} />
                                ))}
                            </>
                        )}

                        {isLoggedIn ? (
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg">
                                    <div className="w-8 h-8 bg-[#387ED1] rounded-full flex items-center justify-center text-white font-bold">
                                        {userName?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-gray-800">{userName || 'User'}</p>
                                        <p className="text-xs text-gray-500 capitalize">{userRole || 'Member'}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={onLogout}
                                    className="py-2 px-6 text-white rounded-lg font-bold bg-gray-600 hover:bg-gray-700 transition duration-200 flex items-center shadow-md active:scale-95 transform cursor-pointer"
                                >
                                    <LogIn className="w-5 h-5 mr-2 rotate-180" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={onLoginClick}
                                className="py-2.5 px-6 text-white rounded-lg font-bold bg-[#387ED1] hover:bg-black transition duration-200 flex items-center shadow-md active:scale-95 transform cursor-pointer"
                            >
                                <LogIn className="w-5 h-5 mr-2" />
                                <span>Login / Sign Up</span>
                            </button>
                        )}
                    </div>

                    <button
                        onClick={toggleMobileMenu}
                        className="lg:hidden p-2 text-gray-700 hover:text-[#387ED1] transition duration-200"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {mobileMenuOpen && (
                    <div className="lg:hidden mt-4 pb-4 border-t border-gray-200 pt-4 animate-slideDown">
                        {!isLoggedIn && (
                            <div className="space-y-3 mb-4">
                                {navLinks.map((link) => (
                                    <NavItem key={link.name} {...link} onClick={closeMobileMenu} />
                                ))}
                            </div>
                        )}

                        {isLoggedIn ? (
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3 bg-gray-100 p-3 rounded-lg">
                                    <div className="w-10 h-10 bg-[#387ED1] rounded-full flex items-center justify-center text-white font-bold text-lg">
                                        {userName?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800">{userName || 'User'}</p>
                                        <p className="text-sm text-gray-500 capitalize">{userRole || 'Member'}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        onLogout();
                                        closeMobileMenu();
                                    }}
                                    className="w-full py-3 text-white rounded-lg font-bold bg-gray-600 hover:bg-gray-700 transition duration-200 flex items-center justify-center shadow-md cursor-pointer"
                                >
                                    <LogIn className="w-5 h-5 mr-2 rotate-180" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => {
                                    onLoginClick();
                                    closeMobileMenu();
                                }}
                                className="w-full py-3 text-white rounded-lg font-bold bg-[#387ED1] hover:bg-[#a9303c] transition duration-200 flex items-center justify-center shadow-md"
                            >
                                <LogIn className="w-5 h-5 mr-2" />
                                <span>Login / Sign Up</span>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;