import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, MapPin, Globe } from 'lucide-react';
import { useLanguage, Language } from '../contexts/LanguageContext';

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();

  const navItems = [
    { path: '/', label: t.home, icon: MapPin },
    { path: '/hotels', label: t.ghats, icon: MapPin },
    { path: '/shuttle', label: t.accommodation, icon: MapPin },
    { path: '/temples', label: t.parkingShuttle, icon: MapPin },
    { path: '/temples', label: t.entryExit, icon: MapPin },
    { path: '/temples', label: t.temples, icon: MapPin },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <MapPin className="h-8 w-8 text-white" />
            <span className="text-white text-xl font-bold">
              {t.ujjainMahakumbh}
            </span>
          </div>

          {/* Desktop Navigation and Language Switcher */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Navigation Links */}
            <div className="flex space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-white text-orange-600 shadow-md'
                    : 'text-white hover:bg-orange-400 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
            </div>
            
            {/* Language Switcher */}
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-white" />
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-transparent text-white text-sm border border-white/30 rounded px-2 py-1 focus:outline-none focus:border-white"
              >
                <option value="en" className="text-gray-900">EN</option>
                <option value="hi" className="text-gray-900">हि</option>
                <option value="mr" className="text-gray-900">मर</option>
              </select>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Language Switcher */}
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-transparent text-white text-xs border border-white/30 rounded px-1 py-1 focus:outline-none focus:border-white"
            >
              <option value="en" className="text-gray-900">EN</option>
              <option value="hi" className="text-gray-900">हि</option>
              <option value="mr" className="text-gray-900">मर</option>
            </select>
            <button
              onClick={toggleMobileMenu}
              className="text-white hover:text-orange-200 transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen
            ? 'max-h-64 opacity-100'
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 bg-orange-600">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                location.pathname === item.path
                  ? 'bg-white text-orange-600'
                  : 'text-white hover:bg-orange-500'
              }`}
            >
              <div className="flex items-center space-x-2">
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;