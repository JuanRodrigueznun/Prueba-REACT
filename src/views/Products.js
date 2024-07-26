import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import axios from 'axios';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  const handleProductSave = async () => {
    const newProduct = {
      name: productName,
      price: productPrice,
    };

    try {
      if (productToEdit) {
        await axios.put(`http://localhost:8080/api/products/${productToEdit.id}`, newProduct);
      } else {
        await axios.post('http://localhost:8080/api/products', newProduct);
      }

      setShowProductModal(false);
      setProductToEdit(null);
      setProductName('');
      setProductPrice(0);
      // Refresh product list
      const response = await axios.get('http://localhost:8080/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleProductEdit = (product) => {
    setProductToEdit(product);
    setProductName(product.name);
    setProductPrice(product.price);
    setShowProductModal(true);
  };

  const handleProductRemove = async (productId) => {
    try {
      await axios.delete(`http://localhost:8080/api/products/${productId}`);
      setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  return (
    <div className="container mt-4">
      <h1>Products</h1>
      <Button variant="primary" onClick={() => setShowProductModal(true)} className="mb-3">Add Product</Button>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Price</th>
            <th>Options</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id}>
              <td>{product.id}</td>
              <td>{product.name}</td>
              <td>${product.price.toFixed(2)}</td>
              <td>
                <Button variant="warning" size="sm" onClick={() => handleProductEdit(product)}>Edit</Button>
                {' '}
                <Button variant="danger" size="sm" onClick={() => handleProductRemove(product.id)}>Remove</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showProductModal} onHide={() => setShowProductModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{productToEdit ? 'Edit Product' : 'Add Product'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="productName">
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="productPrice">
              <Form.Label>Product Price</Form.Label>
              <Form.Control
                type="number"
                value={productPrice}
                onChange={(e) => setProductPrice(Number(e.target.value))}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowProductModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleProductSave}>{productToEdit ? 'Save Changes' : 'Add Product'}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Products;
