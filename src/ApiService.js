const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://localhost:7165/api/Products';
// Endpoints:
// GET all:    GET ${API_BASE_URL}
// GET by ID:  GET ${API_BASE_URL}/{id}
// POST new:   POST ${API_BASE_URL}
// PUT update: PUT ${API_BASE_URL}/{id}
// DELETE:     DELETE ${API_BASE_URL}/{id}

export async function getProducts() {
  const response = await fetch(`${API_BASE_URL}`, { mode: 'cors' });
  return response.json();
}

export async function addProduct(productData) {
  const response = await fetch(`${API_BASE_URL}`, {
    method: 'POST',
    mode: 'cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
  });
  return response.json();
}

export async function updateProduct(id, productData) {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    
    // Check if response is ok
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Check if there's content before trying to parse JSON
    const text = await response.text();
    return text ? JSON.parse(text) : productData;
  } catch (error) {
    console.error('Error updating product:', error);
    return productData; // Return the original data if update fails
  }
}

export async function deleteProduct(id) {
  await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
    mode: 'cors'
  });
}