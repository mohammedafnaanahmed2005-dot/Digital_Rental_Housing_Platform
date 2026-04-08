# NestHyd 🏙️

NestHyd is a premium digital rental housing platform designed specifically for Hyderabad's finest living spaces. It connects landlords and tenants across the city, offering a sleek, user-friendly interface to browse properties, schedule visits, submit tenant applications, and more. 

## ✨ Features

- **Luxury Property Listings**: Browse curated homes in prime Hyderabad areas like Banjara Hills, Jubilee Hills, Gachibowli, and Hitech City.
- **Advanced Filtering**: Search by location, filter by BHK type, and use our price slider to find a home within your budget. Sort by newest, popular, and price.
- **AI Recommendations**: Properties are intelligently flagged as "AI Recommended" based on your previous browsing patterns and criteria.
- **Tenant Application Flow**: Seamless multi-step application form to schedule a visit, submit details, and generate a downloadable receipt.
- **Admin Dashboard**: Secure panel to manage reservations, track confirmation statuses, view overall revenue metrics, and export data directly to CSV.
- **Built-in WhatsApp Support**: integrated floating WhatsApp widget to quickly answer user queries.
- **Dark Mode Support**: Seamlessly toggle between Light and Dark themes.

## 🛠️ Technology Stack

**Frontend:**
- **React 18** for the View layer
- **Vite** as the fast build tool
- **Lucide React** for modern iconography
- Vanilla CSS (`index.css`) for the custom, premium styling

**Backend:**
- **Python / FastAPI** for the high-performance async web API
- **MongoDB** for flexible data storage
- **Uvicorn** as the ASGI server

## 📂 Project Structure

```text
c:\knknknn
├── backend/
│   ├── main.py        # FastAPI entry point
│   ├── database.py    # MongoDB connection setup
│   └── requirements.txt
├── src/
│   ├── data/          # Seed listings data
│   ├── App.jsx        # Main React components (Routing, Views, Admin)
│   ├── index.css      # Core Design System, Variables, Animations
│   └── main.jsx       # React entry point
├── package.json       # Project metadata & standard scripts
└── vite.config.js     # Vite configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js & npm installed
- Python 3.9+
- MongoDB installed locally or a Cloud URI

### 1. Installation

Install Node dependencies:
```bash
npm install
```

Set up your Python virtual environment and install backend dependencies:
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate
pip install fastapi uvicorn pymongo python-dotenv
```

### 2. Environment Variables
In the `backend/` folder, create a `.env` file for your backend configuration:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/my_database
```

### 3. Run the Development Environment
Start both the React frontend and FastAPI backend simultaneously using the concurrently script provided:

```bash
npm run dev
```

Your React app will typically run on `http://localhost:5173` while the FastAPI endpoint will be accessible at `http://localhost:5000`.

## 🔐 Admin Access

To access the management dashboard, click "**Admin**" on the navbar and log in using the demo credentials:

- **Username**: `admin`
- **Password**: `nesthyd123`

---

*Built with Excellence for Hyderabad.*
