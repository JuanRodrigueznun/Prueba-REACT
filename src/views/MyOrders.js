import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Modal, Dropdown, DropdownButton } from 'react-bootstrap';
import axios from 'axios';
import { useOrders } from '../OrdersContext';

const fetchOrders = async (setOrders) => {
  try {
    const response = await axios.get('http://localhost:8080/api/orders');
    console.log('Fetched orders:', response.data); // Log fetched data
    setOrders(response.data);
  } catch (error) {
    console.error('Failed to fetch orders', error);
  }
};

const MyOrders = () => {
  const navigate = useNavigate();
  const { orders, setOrders } = useOrders();
  const [showModal, setShowModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  useEffect(() => {
    fetchOrders(setOrders);
  }, [setOrders]);

  const handleEdit = (id) => {
    const order = orders.find(order => order.id === id);
    if (order.status === 'Completed') {
      alert('Cannot edit a completed order.');
      return;
    }
    navigate(`/add-order/${id}`);
  };

  const handleDelete = (id) => {
    const order = orders.find(order => order.id === id);
    if (order.status === 'Completed') {
      alert('Cannot delete a completed order.');
      return;
    }
    setOrderToDelete(id);
    setShowModal(true);
  };

  const confirmDelete = () => {
    axios.delete(`http://localhost:8080/api/orders/${orderToDelete}`)
      .then(() => {
        setOrders(orders.filter(order => order.id !== orderToDelete));
        setShowModal(false);
        setOrderToDelete(null);
      })
      .catch(error => {
        console.error('Failed to delete order', error);
      });
  };

  const handleAddOrder = () => {
    navigate('/add-order');
  };

  const handleStatusChange = (id, newStatus) => {
    setOrders(prevOrders => prevOrders.map(order =>
      order.id === id ? { ...order, status: newStatus } : order
    ));
  };

  const calculateTotalPrice = (items) => {
    return items.reduce((total, item) => total + item.totalPrice, 0).toFixed(2);
  };

  console.log('Orders state:', orders); // Log orders state

  return (
    <div className="container mt-4">
      <h1>My Orders</h1>
      <Button variant="primary" onClick={handleAddOrder}>Add New Order</Button>
      <Table striped bordered hover className="mt-3">
        <thead>
          <tr>
            <th>ID</th>
            <th>Order #</th>
            <th>Date</th>
            <th># Products</th>
            <th>Final Price</th>
            <th>Status</th>
            <th>Options</th>
          </tr>
        </thead>
        <tbody>
          {orders && Array.isArray(orders) && orders.length > 0 ? orders.map(order => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.orderNumber}</td>
              <td>{order.date}</td>
              <td>{order.items ? order.items.length : 0}</td>
              <td>${order.items ? calculateTotalPrice(order.items) : '0.00'}</td>
              <td>
                <DropdownButton id="dropdown-basic-button" title={order.status || 'Pending'}>
                  <Dropdown.Item onClick={() => handleStatusChange(order.id, 'Pending')}>Pending</Dropdown.Item>
                  <Dropdown.Item onClick={() => handleStatusChange(order.id, 'InProgress')}>InProgress</Dropdown.Item>
                  <Dropdown.Item onClick={() => handleStatusChange(order.id, 'Completed')}>Completed</Dropdown.Item>
                </DropdownButton>
              </td>
              <td>
                <Button variant="warning" onClick={() => handleEdit(order.id)}>Edit</Button>
                {' '}
                <Button variant="danger" onClick={() => handleDelete(order.id)}>Delete</Button>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="7" className="text-center">No orders found</td>
            </tr>
          )}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this order?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MyOrders;
