import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

export const PRIMARY_RED = '#387ED1';
export const DARK_CHARCOAL = '#333333'

export const API_BASE_URL = import.meta.env.REACT_APP_API_BASE_URL ||
    (import.meta.env.MODE === 'production'
        ? 'https://anndata-network.onrender.com'
        : 'http://localhost:5000');


export const FormInput = ({ id, label, type = 'text', icon: Icon, value, onChange, required = false }) => (
    <div className="relative mb-6">
        <div
            className={`
                flex items-center border border-gray-300 rounded-lg shadow-sm overflow-hidden 
                transition duration-150 group
            `}
            style={{
                '--tw-ring-color': PRIMARY_RED
            }}
            onFocus={(e) => {
                const container = e.currentTarget;
                container.classList.add('ring-2', 'ring-offset-2', 'ring-[var(--tw-ring-color)]');
            }}
            onBlur={(e) => {
                const container = e.currentTarget;
                container.classList.remove('ring-2', 'ring-offset-2', 'ring-[var(--tw-ring-color)]');
            }}
        >
            <div className="pl-3 py-3">
                <Icon className="w-5 h-5 text-gray-400" />
            </div>
            <input
                id={id}
                name={id}
                type={type}
                placeholder={label}
                value={value}
                onChange={onChange}
                required={required}
                className="w-full p-3 focus:outline-none placeholder-gray-500 text-sm font-semibold"
            />
        </div>
    </div>
);

export const MessageDisplay = ({ message }) => (
    <div className={`p-4 mb-6 rounded-lg flex items-start ${message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
        }`}>
        {message.type === 'success' ? <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />}
        <p className="text-sm font-semibold leading-relaxed">{message.text}</p>
    </div>
);