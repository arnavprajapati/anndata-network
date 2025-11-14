import React from 'react';
import { Activity, LogIn, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const navLinks = [
    { name: "Donate", href: "/donate", hasDropdown: true },
    { name: "Our Impact", href: "/impact", hasDropdown: false },
    { name: "Testimonial", href: "/testimonial", hasDropdown: false },
    { name: "About", href: "/about", hasDropdown: true },
];

const NavItem = ({ name, href, hasDropdown }) => (
    <Link
        to={href}
        className="text-[#333333] hover:text-[#CC3D4B] font-semibold text-lg transition duration-150 flex items-center space-x-1 whitespace-nowrap"
    >
        <span>{name}</span>
        {hasDropdown && <ChevronDown className="w-4 h-4 mt-0.5 ml-1" />}
    </Link>
);


function Navbar({ onLoginClick }) { // Added onLoginClick prop
    return (
        <nav className="bg-white fixed top-0 w-full z-20 shadow-sm border-b border-gray-100">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-20 py-4">
                <div className="flex items-center justify-between">

                    <Link to="/" className="flex items-center space-x-2 cursor-pointer">
                        <Activity className="w-8 h-8 text-[#333333]" />
                        <span className="text-3xl font-extrabold text-[#333333]">Anndata</span>
                    </Link>

                    <div className="flex items-center space-x-8">

                        <div className="hidden lg:flex items-center space-x-6">
                            {navLinks.map((link) => (
                                <NavItem key={link.name} {...link} />
                            ))}
                        </div>

                        {/* Changed Link to a button and use the handler */}
                        <button
                            onClick={onLoginClick}
                            className="py-2 px-6 text-white rounded font-bold bg-[#CC3D4B] transition duration-150 flex items-center shadow-md whitespace-nowrap hover:bg-[#a9303c] active:scale-[0.98]"
                        >
                            <LogIn className="w-5 h-5 mr-1" />
                            <span>Login</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;