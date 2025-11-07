import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Navigation.css';
import HomeIcon from '../../../assets/icons/home.svg';
import UserEditIcon from '../../../assets/icons/useredit.svg';
import BriefcaseIcon from '../../../assets/icons/briefcase.svg';
import RouteIcon from '../../../assets/icons/route.svg';
import PlaneIcon from '../../../assets/icons/plane.svg';
import CalendarCheckIcon from '../../../assets/icons/calendarcheck.svg';
import CreditCardIcon from '../../../assets/icons/creditcard.svg';
import MarkerPinIcon from '../../../assets/icons/markerpin.svg';
import LineChartUpIcon from '../../../assets/icons/linechartup.svg';

export default function Navigation() {
  const [userRole, setUserRole] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setUserRole(2);
    
    // Auto-collapse on smaller screens
    const handleResize = () => {
      if (window.innerWidth < 1200) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };
    
    // Check initial width
    handleResize();
    
    // Add listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update admin-container class when collapsed state changes
  useEffect(() => {
    const adminContainer = document.querySelector('.admin-container');
    if (adminContainer) {
      if (collapsed) {
        adminContainer.classList.add('sidebar-collapsed');
      } else {
        adminContainer.classList.remove('sidebar-collapsed');
      }
    }
  }, [collapsed]);

  const isAdmin = userRole === 2;

  return (
    <aside className={'sidebar ' + (collapsed ? 'collapsed' : '')} onClick={() => collapsed && setCollapsed(false)}>
      <div className='sidebar-collapse-area' onClick={(e) => e.stopPropagation()}>
        <button 
          className='collapse-btn-top MuiTouchRipple-root' 
          onClick={(e) => {
            e.stopPropagation();
            setCollapsed(!collapsed);
          }}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className='ripple-wrapper'>
            <svg 
              width='18' 
              height='18' 
              viewBox='0 0 24 24' 
              fill='none'
            >
              <path 
                d={collapsed ? 'M9 18L15 12L9 6' : 'M15 18L9 12L15 6'}
                stroke='currentColor' 
                strokeWidth='2' 
                strokeLinecap='round' 
                strokeLinejoin='round'
              />
            </svg>
          </span>
        </button>
      </div>
      <div className='sidebar-header' onClick={(e) => e.stopPropagation()}>
        <div className='logo'>
          <div className='logo-icon-wrapper'>
            <svg className='logo-icon-gradient' viewBox='0 0 22 22' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <defs>
                <linearGradient id='globeGradient' x1='0%' y1='0%' x2='0%' y2='100%'>
                  <stop offset='0%' stopColor='#6FC6A1' />
                  <stop offset='100%' stopColor='#4D40CA' />
                </linearGradient>
              </defs>
              <path 
                d='M1.68675 14.6451L3.59494 13.5435C3.6983 13.4839 3.8196 13.4631 3.9369 13.4851L7.6914 14.1878C7.99995 14.2455 8.28478 14.008 8.28338 13.6941L8.26876 10.4045C8.26836 10.3151 8.29193 10.2272 8.33701 10.15L10.2317 6.90621C10.3303 6.73739 10.3215 6.52658 10.2091 6.3666L7.01892 1.82568M18.0002 3.85905C12.5002 6.50004 15.5 10 16.5002 10.5C18.3773 11.4384 20.9876 11.5 20.9876 11.5C20.9958 11.3344 21 11.1677 21 11C21 5.47715 16.5228 1 11 1C5.47715 1 1 5.47715 1 11C1 16.5228 5.47715 21 11 21C11.1677 21 11.3344 20.9959 11.5 20.9877M15.7578 20.9398L12.591 12.591L20.9398 15.7578L17.2376 17.2376L15.7578 20.9398Z' 
                stroke='url(#globeGradient)' 
                strokeWidth='2' 
                strokeLinecap='round' 
                strokeLinejoin='round'
              />
            </svg>
          </div>
          {!collapsed && (
            <div className='logo-text'>
              <span className='logo-title'>Travel</span>
              <span className='logo-subtitle'>Adventure</span>
            </div>
          )}
        </div>
      </div>
      <nav className='nav-links'>
        <NavLink to='/dashboard' className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
          <img src={HomeIcon} alt='Dashboard' className='icon' />
          {!collapsed && <span>Dashboard</span>}
        </NavLink>
        <NavLink to='/customers' className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
          <img src={UserEditIcon} alt='Customers' className='icon' />
          {!collapsed && <span>Customers</span>}
        </NavLink>
        {isAdmin && <NavLink to='/staff' className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
          <img src={BriefcaseIcon} alt='Staff' className='icon' />
          {!collapsed && <span>Staffs</span>}
        </NavLink>}
        {isAdmin && <NavLink to='/travels' className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
          <img src={RouteIcon} alt='Routes' className='icon' />
          {!collapsed && <span>Routes</span>}
        </NavLink>}
        <NavLink to='/trips' className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
          <img src={PlaneIcon} alt='Trips' className='icon' />
          {!collapsed && <span>Trips</span>}
        </NavLink>
        <NavLink to='/bookings' className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
          <img src={CalendarCheckIcon} alt='Bookings' className='icon' />
          {!collapsed && <span>Bookings</span>}
        </NavLink>
        <NavLink to='/invoices' className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
          <img src={CreditCardIcon} alt='Invoices' className='icon' />
          {!collapsed && <span>Invoices</span>}
        </NavLink>
        {isAdmin && <NavLink to='/attractions' className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
          <img src={MarkerPinIcon} alt='Attractions' className='icon' />
          {!collapsed && <span>Attractions</span>}
        </NavLink>}
        {isAdmin && <NavLink to='/reports' className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
          <img src={LineChartUpIcon} alt='Statistics' className='icon' />
          {!collapsed && <span>Statistics</span>}
        </NavLink>}
      </nav>
    </aside>
  );
}
