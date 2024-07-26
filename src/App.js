import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import MyOrders from './views/MyOrders';
import AddEditOrder from './views/AddEditOrder';
import Products from './views/Products'; // Import the Products component
import { Navbar, Nav } from 'react-bootstrap';

function App() {
  return (
    <Router>
      <div>
        <Navbar bg="light" expand="lg">
          <Navbar.Brand href="/">Order Management</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
              <Nav.Link as={Link} to="/my-orders">My Orders</Nav.Link>
              <Nav.Link as={Link} to="/add-order">Add Order</Nav.Link>
              <Nav.Link as={Link} to="/products">Products</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <div className="container mt-4">
          <Routes>
            <Route path="/" element={<Navigate to="/my-orders" />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/add-order/:id" element={<AddEditOrder />} />
            <Route path="/add-order" element={<AddEditOrder />} />
            <Route path="/products" element={<Products />} /> {/* Add this route */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
