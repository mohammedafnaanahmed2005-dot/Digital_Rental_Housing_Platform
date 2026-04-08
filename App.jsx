import React, { useState, useEffect, useMemo } from 'react';
import {
  Sun, Moon, Search, MessageCircle, LayoutDashboard, Home, CheckCircle,
  Clock, TrendingUp, DollarSign, Download, Filter, X, ChevronRight,
  MapPin, BedDouble, Calendar, Send, FileText, Smartphone, Menu
} from 'lucide-react';
import { listings as initialListings } from './data/listings';

// Simple Router Hook
const useHash = () => {
  const [hash, setHash] = useState(window.location.hash || '#home');
  useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  return hash;
};

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [listings, setListings] = useState(initialListings);
  const [reservations, setReservations] = useState(JSON.parse(localStorage.getItem('reservations') || '[]'));
  const [filter, setFilter] = useState({
    priceRange: [5000, 100000],
    bhk: 'All',
    sort: 'popular',
    search: ''
  });
  const [userPattern, setUserPattern] = useState(JSON.parse(localStorage.getItem('searchPattern') || '[]'));

  // Modals & Panels
  const [activeProperty, setActiveProperty] = useState(null); // For Reservation
  const [showReceipt, setShowReceipt] = useState(null); // For Receipt display
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin') === 'true');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // App Routing
  const currentPath = useHash();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Derived State: Filtered Listings
  const filteredListings = useMemo(() => {
    let result = listings.filter(item => {
      const matchPrice = item.rent >= filter.priceRange[0] && item.rent <= filter.priceRange[1];
      const matchBhk = filter.bhk === 'All' || item.bhk === filter.bhk;
      const matchSearch = item.name.toLowerCase().includes(filter.search.toLowerCase()) ||
        item.location.toLowerCase().includes(filter.search.toLowerCase());
      return matchPrice && matchBhk && matchSearch;
    });

    if (filter.sort === 'price-low') result.sort((a, b) => a.rent - b.rent);
    if (filter.sort === 'price-high') result.sort((a, b) => b.rent - a.rent);
    if (filter.sort === 'newest') result.sort((a, b) => b.id - a.id);

    return result;
  }, [listings, filter]);

  // Derived Stats for Admin
  const stats = useMemo(() => {
    const total = reservations.length;
    const confirmed = reservations.filter(r => r.status === 'Confirmed').length;
    const pending = reservations.filter(r => r.status === 'Pending').length;
    const revenue = reservations.reduce((acc, curr) => acc + (curr.status === 'Confirmed' ? curr.rent : 0), 0);
    return { total, confirmed, pending, revenue };
  }, [reservations]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  const handleReserve = (bookingDetails) => {
    const newReservation = {
      ...bookingDetails,
      id: `NH-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      status: 'Pending',
      dateSubmmited: new Date().toLocaleDateString()
    };
    const updated = [...reservations, newReservation];
    setReservations(updated);
    localStorage.setItem('reservations', JSON.stringify(updated));

    // Save search pattern for AI recommendation
    const newPattern = Array.from(new Set([...userPattern, bookingDetails.property.bhk])).slice(-3);
    setUserPattern(newPattern);
    localStorage.setItem('searchPattern', JSON.stringify(newPattern));

    setShowReceipt(newReservation);
    setActiveProperty(null);
  };

  const updateReservationStatus = (id, status) => {
    const updated = reservations.map(r => r.id === id ? { ...r, status } : r);
    setReservations(updated);
    localStorage.setItem('reservations', JSON.stringify(updated));
  };

  const exportCSV = () => {
    const headers = "Booking ID,Tenant,Property,Location,Move-in,Rent,Status\n";
    const rows = reservations.map(r => `${r.id},${r.tenant.name},${r.property.name},${r.property.location},${r.moveInDate},${r.rent},${r.status}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reservations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Auth Handling
  const handleAdminLogin = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    if (fd.get('username') === 'admin' && fd.get('password') === 'nesthyd123') {
      setIsAdmin(true);
      localStorage.setItem('isAdmin', 'true');
      setShowAdminLogin(false);
      window.location.hash = '#admin';
    } else {
      alert("Invalid credentials. Try admin / nesthyd123");
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('isAdmin');
    window.location.hash = '#home';
  };

  return (
    <div className="app">
      {/* NAVIGATION */}
      <nav className="navbar">
        <div className="container nav-content">
          <div className="logo" onClick={() => window.location.hash = '#home'}>
            <span className="logo-icon">NH</span>
            <span className="logo-text">NestHyd</span>
          </div>

          <div className={`nav-links ${showMobileMenu ? 'active' : ''}`}>
            <a href="#home" onClick={() => setShowMobileMenu(false)}>Home</a>
            <a href="#listings" onClick={() => setShowMobileMenu(false)}>Listings</a>
            <a href="#how-it-works" onClick={() => setShowMobileMenu(false)}>How It Works</a>
            <button
              className="btn-link-nav"
              onClick={() => {
                if (isAdmin) window.location.hash = '#admin';
                else setShowAdminLogin(true);
                setShowMobileMenu(false);
              }}
            >
              <LayoutDashboard size={18} /> Admin
            </button>
          </div>

          <div className="nav-actions">
            <button onClick={toggleTheme} className="theme-toggle">
              {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
            </button>
            <button className="mobile-toggle" onClick={() => setShowMobileMenu(!showMobileMenu)}>
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      <main>
        {(currentPath === '#home' || currentPath === '') && (
          <HomeSection
            filteredListings={filteredListings}
            filter={filter}
            setFilter={setFilter}
            setActiveProperty={setActiveProperty}
            userPattern={userPattern}
          />
        )}
        {currentPath === '#admin' && isAdmin && (
          <AdminSection
            reservations={reservations}
            stats={stats}
            updateStatus={updateReservationStatus}
            exportCSV={exportCSV}
            onLogout={handleLogout}
          />
        )}
        {currentPath === '#admin' && !isAdmin && (
          <div className="container section-padding text-center">
            <h2>Access Denied</h2>
            <p>Please login as an admin to view this page.</p>
            <button className="btn-primary mt-4" onClick={() => setShowAdminLogin(true)}>Admin Login</button>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="footer section-padding">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-info">
              <h3>NestHyd</h3>
              <p>The premium rental platform for Hyderabad's finest living spaces. Find your perfect home in the City of Pearls.</p>
            </div>
            <div>
              <h4>Neighborhoods</h4>
              <ul>
                <li>Banjara Hills</li>
                <li>Jubilee Hills</li>
                <li>Gachibowli</li>
                <li>Hitech City</li>
              </ul>
            </div>
            <div>
              <h4>Support</h4>
              <ul>
                <li>Contact Us</li>
                <li>FAQs</li>
                <li>Tenants Guide</li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 NestHyd. Built with Excellence for Hyderabad.</p>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {showAdminLogin && (
        <div className="modal-overlay">
          <div className="modal-content admin-login">
            <button className="close-btn" onClick={() => setShowAdminLogin(false)}><X /></button>
            <h2>Admin Access</h2>
            <p className="login-hint">Demo: admin / nesthyd123</p>
            <form onSubmit={handleAdminLogin}>
              <div className="input-group">
                <label>Username</label>
                <input name="username" type="text" className="input-styled" required placeholder="admin" />
              </div>
              <div className="input-group">
                <label>Password</label>
                <input name="password" type="password" className="input-styled" required placeholder="nesthyd123" />
              </div>
              <button type="submit" className="btn-primary w-full">Enter Dashboard</button>
            </form>
          </div>
        </div>
      )}

      {activeProperty && (
        <ReservationModal
          property={activeProperty}
          onClose={() => setActiveProperty(null)}
          onConfirm={handleReserve}
        />
      )}

      {showReceipt && (
        <div className="modal-overlay">
          <div className="modal-content receipt-modal">
            <button className="close-btn" onClick={() => setShowReceipt(null)}><X /></button>
            <Receipt reservation={showReceipt} />
            <div className="modal-actions" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button className="btn-primary w-full" onClick={() => window.print()}>
                <Download size={18} /> Download Receipt
              </button>
              <button className="btn-outline w-full" onClick={() => setShowReceipt(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Chat */}
      <WhatsAppWidget />
    </div>
  );
}

// SUB-COMPONENTS
function HomeSection({ filteredListings, filter, setFilter, setActiveProperty, userPattern }) {
  return (
    <>
      <section className="hero">
        <div className="container hero-content fade-in">
          <h1>Find Your Perfect Home in the <span className="highlight">City of Pearls</span></h1>
          <p>Connecting landlords and tenants across Hyderabad's finest neighborhoods — from Banjara Hills villas to Madhapur apartments.</p>

          <div className="hero-search-bar">
            <div className="search-group">
              <MapPin size={20} className="icon" />
              <input
                type="text"
                placeholder="Search area..."
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              />
            </div>
            <div className="search-group separator">
              <BedDouble size={20} className="icon" />
              <select
                value={filter.bhk}
                onChange={(e) => setFilter({ ...filter, bhk: e.target.value })}
              >
                <option value="All">BHK Type</option>
                <option value="1BHK">1 BHK</option>
                <option value="2BHK">2 BHK</option>
                <option value="3BHK">3 BHK</option>
                <option value="4BHK">4 BHK</option>
              </select>
            </div>
            <button className="search-btn"><Search size={22} /></button>
          </div>
        </div>
      </section>

      <section className="listings-section section-padding" id="listings">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="title">Featured Properties</h2>
              <p className="subtitle">Handpicked homes in prime Hyderabad locations</p>
            </div>
            <div className="filter-controls">
              <select className="input-styled" value={filter.sort} onChange={(e) => setFilter({ ...filter, sort: e.target.value })}>
                <option value="popular">Most Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>

          <div className="advanced-filters">
            <div className="price-slider-container">
              <label>Price Range: ₹{filter.priceRange[0].toLocaleString()} - ₹{filter.priceRange[1].toLocaleString()}</label>
              <input
                type="range"
                min="5000"
                max="100000"
                step="1000"
                value={filter.priceRange[1]}
                onChange={(e) => setFilter({ ...filter, priceRange: [5000, parseInt(e.target.value)] })}
                className="slider"
              />
            </div>
            <div className="filter-chips">
              <button className="chip active">Parking</button>
              <button className="chip">Pet Friendly</button>
              <button className="chip">Furnished</button>
            </div>
          </div>

          <div className="grid-listings">
            {filteredListings.map((property, idx) => (
              <ListingCard
                key={property.id}
                property={property}
                index={idx}
                onReserve={() => setActiveProperty(property)}
                isRecommended={userPattern.includes(property.bhk)}
              />
            ))}
          </div>
          {filteredListings.length === 0 && (
            <div className="no-results" style={{ padding: '4rem 0' }}>
              <Search size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p>No properties found matching your criteria.</p>
              <button onClick={() => setFilter({ priceRange: [5000, 100000], bhk: 'All', sort: 'popular', search: '' })} className="btn-link" style={{ marginTop: '1rem' }}>Clear Filters</button>
            </div>
          )}
        </div>
      </section>

      <section className="how-it-works section-padding" id="how-it-works">
        <div className="container">
          <h2 className="text-center title">How It Works</h2>
          <div className="steps-grid">
            <div className="step-card fade-in stagger-1">
              <div className="step-icon"><Search size={32} /></div>
              <h3>Browse</h3>
              <p>Find your ideal home from our curated list of prime Hyderabad locations.</p>
            </div>
            <div className="step-card fade-in stagger-2">
              <div className="step-icon"><Calendar size={32} /></div>
              <h3>Reserve</h3>
              <p>Schedule a visit and provide your details to initiate the process.</p>
            </div>
            <div className="step-card fade-in stagger-3">
              <div className="step-icon"><Home size={32} /></div>
              <h3>Move In</h3>
              <p>Finalize the details and get ready to live in your dream home.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function ListingCard({ property, index, onReserve, isRecommended }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`card property-card fade-in stagger-${(index % 6) + 1}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="card-image-wrapper">
        <img src={isHovered ? property.interiorImage : property.exteriorImage} alt={property.name} className="property-image" />
        <div className="property-badge">{property.availability}</div>
        {isRecommended && <div className="ai-badge">AI Recommended</div>}
        <div className="property-price">₹{property.rent.toLocaleString()}<span>/mo</span></div>
      </div>
      <div className="card-body">
        <div className="property-meta">
          <span className="location"><MapPin size={16} /> {property.location}</span>
          <span className="bhk">{property.bhk} • {property.type}</span>
        </div>
        <h3 className="property-title">{property.name}</h3>
        <button className="btn-primary w-full" onClick={onReserve}>Rent Now</button>
      </div>
    </div>
  );
}

function ReservationModal({ property, onClose, onConfirm }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', moveInDate: '', duration: '12',
    employment: '', emergencyContact: '', idType: 'Aadhar'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 1) setStep(2);
    else {
      onConfirm({
        property,
        tenant: formData,
        moveInDate: formData.moveInDate,
        rent: property.rent
      });
    }
  };

  const updateForm = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  return (
    <div className="modal-overlay">
      <div className="modal-content reservation-flow">
        <button className="close-btn" onClick={onClose}><X /></button>

        <div className="flow-header">
          <h2>{step === 1 ? 'Schedule a Visit' : 'Tenant Application'}</h2>
          <p className="subtitle">{property.name} • {property.location}</p>
          <div className="step-indicator">
            <div className={`dot ${step === 1 ? 'active' : ''}`}>1</div>
            <div className="line"></div>
            <div className={`dot ${step === 2 ? 'active' : ''}`}>2</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flow-form">
          {step === 1 ? (
            <div className="form-step">
              <div className="input-group">
                <label>Preferred Visit Date & Time</label>
                <input type="datetime-local" className="input-styled" required />
              </div>
              <div className="grid-2">
                <div className="input-group">
                  <label>Full Name</label>
                  <input type="text" className="input-styled" required placeholder="John Doe" value={formData.name} onChange={e => updateForm('name', e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Phone Number</label>
                  <input type="tel" className="input-styled" required placeholder="+91 9988776655" value={formData.phone} onChange={e => updateForm('phone', e.target.value)} />
                </div>
              </div>
              <div className="input-group">
                <label>Email Address</label>
                <input type="email" className="input-styled" required placeholder="john@example.com" value={formData.email} onChange={e => updateForm('email', e.target.value)} />
              </div>
              <div className="grid-2">
                <div className="input-group">
                  <label>Move-in Date</label>
                  <input type="date" className="input-styled" required value={formData.moveInDate} onChange={e => updateForm('moveInDate', e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Duration (Months)</label>
                  <select className="input-styled" value={formData.duration} onChange={e => updateForm('duration', e.target.value)}>
                    <option value="11">11 Months</option>
                    <option value="12">12 Months</option>
                    <option value="24">24 Months</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn-primary w-full mt-4">Next: Application Details <ChevronRight size={18} /></button>
            </div>
          ) : (
            <div className="form-step">
              <div className="input-group">
                <label>Employment Details</label>
                <input type="text" className="input-styled" placeholder="Company Name, Designation" required value={formData.employment} onChange={e => updateForm('employment', e.target.value)} />
              </div>
              <div className="input-group">
                <label>Emergency Contact</label>
                <input type="text" className="input-styled" placeholder="Name & Relation" required value={formData.emergencyContact} onChange={e => updateForm('emergencyContact', e.target.value)} />
              </div>
              <div className="input-group">
                <label>ID Proof Type</label>
                <select className="input-styled" value={formData.idType} onChange={e => updateForm('idType', e.target.value)}>
                  <option value="Aadhar">Aadhar Card</option>
                  <option value="PAN">PAN Card</option>
                  <option value="Passport">Passport</option>
                </select>
              </div>
              <div className="terms-checkbox">
                <input type="checkbox" id="terms" required />
                <label htmlFor="terms">I agree to NestHyd's terms and conditions and certify that the information provided is accurate.</label>
              </div>
              <button type="submit" className="btn-primary w-full mt-4">Submit Application & Generate Receipt</button>
              <button type="button" className="btn-outline w-full text-center mt-2" onClick={() => setStep(1)}>Back to Step 1</button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function Receipt({ reservation }) {
  return (
    <div className="receipt">
      <div className="receipt-header">
        <div className="receipt-logo">NH</div>
        <div className="receipt-title">
          <h1>NestHyd</h1>
          <p>Tenant Application Receipt</p>
        </div>
        <div className="receipt-id">
          <span>Booking ID</span>
          <strong>{reservation.id}</strong>
        </div>
      </div>

      <div className="receipt-body">
        <div className="receipt-section">
          <h4>Property Details</h4>
          <div className="row">
            <span>Property:</span> <strong>{reservation.property.name}</strong>
          </div>
          <div className="row">
            <span>Location:</span> <strong>{reservation.property.location}</strong>
          </div>
          <div className="row">
            <span>Monthly Rent:</span> <strong>₹{reservation.rent.toLocaleString()}</strong>
          </div>
        </div>

        <div className="receipt-section">
          <h4>Tenant Information</h4>
          <div className="row">
            <span>Name:</span> <strong>{reservation.tenant.name}</strong>
          </div>
          <div className="row">
            <span>Phone:</span> <strong>{reservation.tenant.phone}</strong>
          </div>
          <div className="row">
            <span>Target Move-in:</span> <strong>{reservation.moveInDate}</strong>
          </div>
        </div>

        <div className="receipt-footer">
          <p>Note: This is an application receipt. Final confirmation is subject to property visit and verification.</p>
          <div className="timestamp">Generated on: {reservation.dateSubmmited}</div>
        </div>
      </div>
    </div>
  );
}

function AdminSection({ reservations, stats, updateStatus, exportCSV, onLogout }) {
  return (
    <div className="admin-container container section-padding fade-in">
      <div className="admin-header">
        <div>
          <h1>Reservations</h1>
          <p className="subtitle">Manage and track all tenant applications</p>
        </div>
        <div className="admin-actions">
          <button className="btn-outline" onClick={exportCSV}><Download size={18} /> Export Results</button>
          <button className="btn-danger" onClick={onLogout}>Logout</button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <TrendingUp className="stat-icon" />
          <div className="stat-info">
            <span className="label">Total Applications</span>
            <span className="value">{stats.total}</span>
          </div>
        </div>
        <div className="stat-card confirmed">
          <CheckCircle className="stat-icon" />
          <div className="stat-info">
            <span className="label">Confirmed</span>
            <span className="value">{stats.confirmed}</span>
          </div>
        </div>
        <div className="stat-card pending">
          <Clock className="stat-icon" />
          <div className="stat-info">
            <span className="label">Pending Review</span>
            <span className="value">{stats.pending}</span>
          </div>
        </div>
        <div className="stat-card revenue">
          <DollarSign className="stat-icon" />
          <div className="stat-info">
            <span className="label">Potential Revenue</span>
            <span className="value">₹{stats.revenue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="table-wrapper card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Reference ID</th>
              <th>Tenant Details</th>
              <th>Property</th>
              <th>Move-in</th>
              <th>Rent</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map(r => (
              <tr key={r.id}>
                <td><span className="id-badge">{r.id}</span></td>
                <td>
                  <div className="tenant-info">
                    <strong>{r.tenant.name}</strong>
                    <span>{r.tenant.phone}</span>
                  </div>
                </td>
                <td>
                  <div className="property-info">
                    <strong>{r.property.name}</strong>
                    <span>{r.property.location}</span>
                  </div>
                </td>
                <td>{r.moveInDate}</td>
                <td>₹{r.rent.toLocaleString()}</td>
                <td>
                  <span className={`status-badge ${r.status.toLowerCase()}`}>{r.status}</span>
                </td>
                <td>
                  <select
                    value={r.status}
                    onChange={(e) => updateStatus(r.id, e.target.value)}
                    className="status-selector"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
            {reservations.length === 0 && (
              <tr>
                <td colSpan="7" className="empty-state" style={{ textAlign: 'center', padding: '4rem' }}>
                  <FileText size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                  <p>No reservations found in the system.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`whatsapp-widget ${isOpen ? 'active' : ''}`}>
      {isOpen && (
        <div className="wa-chat-window fade-in" style={{ animation: 'slideInUp 0.4s ease' }}>
          <div className="wa-header">
            <div className="wa-admin-info">
              <div className="wa-avatar">NH</div>
              <div>
                <strong>NestHyd Admin</strong>
                <span>Direct Support</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ color: 'white' }}><X size={20} /></button>
          </div>
          <div className="wa-messages">
            <div className="wa-msg">
              Hi there! Interested in a property? Tell us which one and we'll help you book a visit.
            </div>
          </div>
          <div className="wa-footer">
            <button
              className="wa-send-btn btn-primary"
              onClick={() => window.open(`https://wa.me/919876543210?text=Hi NestHyd! I'm interested in the properties listed in Hyderabad.`, '_blank')}
            >
              <Send size={18} /> Message on WhatsApp
            </button>
          </div>
        </div>
      )}
      <button className="wa-bubble" onClick={() => setIsOpen(!isOpen)}>
        <MessageCircle size={32} />
      </button>
    </div>
  );
}

export default App;
