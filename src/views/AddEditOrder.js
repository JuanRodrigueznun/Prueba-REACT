import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Table, Modal } from 'react-bootstrap';
import axios from 'axios';

const AddEditOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [order, setOrder] = useState({
    orderNumber: '',
    date: new Date().toISOString().split('T')[0],
    products: [],
  });

  const [availableProducts, setAvailableProducts] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [productQty, setProductQty] = useState(1);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [productToRemove, setProductToRemove] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:8080/api/products')
      .then(response => {
        setAvailableProducts(response.data);
        setSelectedProduct(response.data[0]?.id.toString());
      })
      .catch(error => {
        console.error('Failed to fetch products', error);
      });
  }, []);

  useEffect(() => {
    if (isEdit) {
      axios.get(`http://localhost:8080/api/orders/${id}`)
        .then(response => {
          const orderData = response.data;
          setOrder({
            orderNumber: orderData.orderNumber,
            date: orderData.date.split('T')[0], // Ensure correct date format
            products: orderData.items.map(item => ({
              id: item.product.id,
              name: item.product.name,  // Ensure name is set
              price: item.unitPrice,
              qty: item.quantity,
              totalPrice: item.totalPrice
            }))
          });
        })
        .catch(error => {
          console.error('Failed to fetch order', error);
        });
    }
  }, [isEdit, id]);

  const handleProductSave = () => {
    const product = availableProducts.find(p => p.id === Number(selectedProduct));
    const newProduct = {
        ...product,
        qty: productQty,
        totalPrice: product.price * productQty,
    };

    setOrder(prevOrder => {
        const existingProductIndex = (prevOrder.products || []).findIndex(p => p.id === product.id);
        if (existingProductIndex > -1) {
            const updatedProducts = prevOrder.products.map(p =>
                p.id === product.id ? newProduct : p
            );
            return { ...prevOrder, products: updatedProducts };
        } else {
            return { ...prevOrder, products: [...(prevOrder.products || []), newProduct] };
        }
    });

    setShowProductModal(false);
    setSelectedProduct(availableProducts[0]?.id.toString());
    setProductQty(1);
    setProductToEdit(null);
  };

  const handleProductEdit = (product) => {
    setProductToEdit(product);
    setSelectedProduct(product.id.toString());
    setProductQty(product.qty);
    setShowProductModal(true);
  };

  const handleProductRemove = (product) => {
    setProductToRemove(product);
    setShowRemoveModal(true);
  };

  const confirmRemoveProduct = () => {
    setOrder(prevOrder => ({
      ...prevOrder,
      products: (prevOrder.products || []).filter(p => p.id !== productToRemove.id),
    }));
    setShowRemoveModal(false);
    setProductToRemove(null);
  };

  const handleSaveOrder = async () => {
    const method = isEdit ? 'put' : 'post';
    const url = isEdit ? `http://localhost:8080/api/orders/${id}` : 'http://localhost:8080/api/orders';

    try {
        // Log the order object to check if name is set
        console.log('Order before saving:', JSON.stringify(order, null, 2));
        
        const response = await axios[method](url, {
            ...order,
            items: order.products.map(product => ({
                id: product.itemId,  // Ensure itemId is sent if available
                quantity: product.qty,
                unitPrice: product.price,
                totalPrice: product.totalPrice,
                product: { id: product.id, name: product.name }  // Ensure name is included
            })),
        });
        console.log('Order saved:', response.data);
        navigate('/my-orders');
    } catch (error) {
        console.error('Failed to save order', error.response ? error.response.data : error.message);
    }
  };

  return (
    <div className="container mt-4">
      <h1>{isEdit ? 'Edit Order' : 'Add Order'}</h1>
      <Form>
        <Form.Group controlId="orderNumber">
          <Form.Label>Order Number</Form.Label>
          <Form.Control type="text" value={order.orderNumber} onChange={e => setOrder({ ...order, orderNumber: e.target.value })} />
        </Form.Group>
        <Form.Group controlId="date">
          <Form.Label>Date</Form.Label>
          <Form.Control type="date" value={order.date} onChange={e => setOrder({ ...order, date: e.target.value })} />
        </Form.Group>
        <Form.Group controlId="productsCount">
          <Form.Label># Products</Form.Label>
          <Form.Control type="number" value={order.products ? order.products.length : 0} disabled />
        </Form.Group>
        <Form.Group controlId="finalPrice">
          <Form.Label>Final Price</Form.Label>
          <Form.Control type="number" value={order.products ? order.products.reduce((total, product) => total + product.totalPrice, 0) : 0} disabled />
        </Form.Group>
        <Button variant="primary" onClick={() => setShowProductModal(true)} className="mb-3">Add Product</Button>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Unit Price</th>
              <th>Qty</th>
              <th>Total Price</th>
              <th>Options</th>
            </tr>
          </thead>
          <tbody>
            {order.products && order.products.map(product => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>${product.price.toFixed(2)}</td>
                <td>{product.qty}</td>
                <td>${product.totalPrice.toFixed(2)}</td>
                <td>
                  <Button variant="warning" size="sm" onClick={() => handleProductEdit(product)}>Edit</Button>
                  {' '}
                  <Button variant="danger" size="sm" onClick={() => handleProductRemove(product)}>Remove</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Button variant="success" onClick={handleSaveOrder}>Save Order</Button>
      </Form>

      <Modal show={showProductModal} onHide={() => setShowProductModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{productToEdit ? 'Edit Product' : 'Add Product'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="productSelect">
              <Form.Label>Select Product</Form.Label>
              <Form.Control as="select" value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
                {availableProducts.map(product => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="productQty">
              <Form.Label>Quantity</Form.Label>
              <Form.Control type="number" value={productQty} onChange={(e) => setProductQty(Number(e.target.value))} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowProductModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleProductSave}>{productToEdit ? 'Save Changes' : 'Add Product'}</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showRemoveModal} onHide={() => setShowRemoveModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Remove</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to remove this product?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRemoveModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={confirmRemoveProduct}>Remove</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AddEditOrder;