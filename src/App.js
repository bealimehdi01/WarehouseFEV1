import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Container,
  Box,
  Grid  // Add this import
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Autocomplete from '@mui/material/Autocomplete';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Link from '@mui/material/Link';
import DeleteIcon from '@mui/icons-material/Delete';  // Add this import
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CardActions from '@mui/material/CardActions';
import {
  getProducts as fetchProductsAPI,
  addProduct as addProductAPI,
  updateProduct as updateProductAPI,
  deleteProduct as deleteProductAPI
} from './ApiService';

const App = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ 
    name: '',           // Required
    description: '',    // Optional
    category: 'General',    // Required
    subCategory: 'Uncategorized', // Required
    quantity: 1,        // Required - Changed default to 1
    price: 0,          // Required
    unit: 'Piece',     // Required
    brand: '',         // Optional
    sku: '',           // Optional
    barcode: '',       // Optional
    expiryDate: null,  // Optional
    isActive: true     // Has default
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [adjustQuantity, setAdjustQuantity] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const data = await fetchProductsAPI();
    setProducts(data);
  };

  const handleAddProduct = async () => {
    // Check for duplicate product names (case-insensitive)
    const isDuplicate = products.some(
      product => product.name.toLowerCase() === newProduct.name.toLowerCase()
    );

    if (isDuplicate) {
      alert('A product with this name already exists!');
      return;
    }

    const data = await addProductAPI(newProduct);
    setProducts([...products, data]);
    setNewProduct({ 
      name: '',          
      description: '',    
      category: 'General',    
      subCategory: 'Uncategorized', 
      quantity: 1,        // Reset to 1 instead of 0
      price: 0,          
      unit: 'Piece',     
      brand: '',         
      sku: '',           
      barcode: '',       
      expiryDate: null,  
      isActive: true     
    });
  };

  const handleUpdateProduct = async (id, updatedProduct) => {
    const data = await updateProductAPI(id, updatedProduct);
    setProducts(products.map((product) => (product.id === id ? data : product)));
  };

  const handleDeleteProduct = async (id) => {
    await deleteProductAPI(id);
    setProducts(products.filter((product) => product.id !== id));
  };

  const handleOpenDialog = () => setOpenAddDialog(true);
  const handleCloseDialog = () => setOpenAddDialog(false);
  const handleOpenHelp = () => setHelpOpen(true);
  const handleCloseHelp = () => setHelpOpen(false);
  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setAnchorEl(null);
  };

  const handleQuantityChange = async (product, newQuantity) => {
    if (newQuantity < 0) {
      if (window.confirm('Quantity below 0. Do you want to delete this product?')) {
        await handleDelete(product.id);
      }
    } else {
      await handleUpdateProduct(product.id, { ...product, quantity: newQuantity });
    }
  };

  // Add confirmation to delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to completely remove this product from the warehouse? This action cannot be undone.')) {
      await handleDeleteProduct(id);
    }
  };

  // Compute suggestions based on searchTerm (limit to 3)
  const suggestions = products
      .filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .map(product => product.name)
      .slice(0, 3);

  // Filter products for the table based on searchTerm
  const filteredProducts = products.filter((product) => {
    const lowerSearch = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(lowerSearch) ||
      product.productType?.toLowerCase().includes(lowerSearch)
    );
  });

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setDetailsOpen(true);
  };

  const handleDetailsClose = () => {
    setDetailsOpen(false);
    setSelectedProduct(null);
  };

  const handleActionMenuClick = (event) => {
    setActionMenuAnchorEl(event.currentTarget);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchorEl(null);
  };

  return (
    <Box sx={{ 
        minHeight: '100vh', 
        width: '100%', 
        background: 'linear-gradient(135deg, #89f7fe, #66a6ff)', 
        paddingBottom: 4 
      }}>
      {/* Responsive Container for inner content */}
      <Container maxWidth="lg" sx={{ bgcolor: 'white', borderRadius: 2, boxShadow: 3, py: 2, mt: 4 }}>
        {/* Modern header with AppBar and active search suggestions */}
        <AppBar position="static" sx={{ backgroundColor: '#1976d2', mb: 2, borderRadius: 1 }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Warehouse Management
            </Typography>
            <Autocomplete
              freeSolo
              options={suggestions}
              inputValue={searchTerm}
              onInputChange={(e, newValue) => setSearchTerm(newValue)}
              sx={{
                width: 200,
                backgroundColor: 'white',
                borderRadius: 1,
                mr: 2,
                '& .MuiOutlinedInput-input': { padding: '8px' }
              }}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  placeholder="Search…" 
                  variant="outlined"
                  size="small"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      // Optionally, trigger any additional search behavior here if needed
                    }
                  }}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: <SearchIcon sx={{ mr: 1 }} />
                  }}
                />
              )}
            />
            <IconButton color="inherit" onClick={handleOpenHelp}>
              <HelpOutlineIcon />
            </IconButton>
            <IconButton color="inherit" onClick={handleProfileClick}>
              <Avatar src="/static/images/avatar/1.jpg" alt="Profile" />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileClose}
            >
              <MenuItem>
                <Typography variant="subtitle1">Warehouse: Main Facility</Typography>
              </MenuItem>
              <MenuItem>
                <Typography variant="subtitle2">Role: Administrator</Typography>
              </MenuItem>
              <MenuItem>
                <Typography variant="body2">User: Ali Sayyed</Typography>
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        
        <Dialog open={helpOpen} onClose={handleCloseHelp}>
          <DialogTitle>Help &amp; Instructions</DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Welcome to the Warehouse Management App!
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              To add a product, click on "Add Product" and fill out the product name, quantity, and type.
              You can search for products using the search bar.
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              This application was created by Ali Sayyed. Please contact me for creating a full version.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseHelp}>Close</Button>
          </DialogActions>
        </Dialog>
        
        {/* Button to trigger add product dialog */}
        <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
          <Button variant="contained" color="primary" onClick={handleOpenDialog}>
            Add Product
          </Button>
          <Button
            variant="outlined"
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            startIcon={viewMode === 'list' ? <ViewModuleIcon /> : <ViewListIcon />}
          >
            {viewMode === 'list' ? 'Grid View' : 'List View'}
          </Button>
        </Box>

        {viewMode === 'list' ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ backgroundColor: '#eeeeee' }}>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Link
                        component="button"
                        variant="body1"
                        onClick={() => handleProductClick(product)}
                        sx={{ textDecoration: 'none' }}
                      >
                        {product.name}
                      </Link>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton 
                          size="small"
                          onClick={() => handleQuantityChange(product, product.quantity - 1)}
                        >
                          <RemoveIcon />
                        </IconButton>
                        <TextField
                          type="number"
                          size="small"
                          value={product.quantity}
                          onChange={(e) => handleQuantityChange(product, parseInt(e.target.value) || 0)}
                          sx={{ 
                            width: 70,
                            '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                              '-webkit-appearance': 'none',
                              margin: 0,
                            },
                            '& input[type=number]': {
                              '-moz-appearance': 'textfield',
                            },
                          }}
                        />
                        <IconButton 
                          size="small"
                          onClick={() => handleQuantityChange(product, product.quantity + 1)}
                        >
                          <AddIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                        <IconButton 
                          color="error"
                          onClick={() => handleDelete(product.id)}
                          size="small"
                          title="Delete Product"
                        >
                          <DeleteIcon />
                        </IconButton>
                        <IconButton onClick={(event) => {
                          setActionMenuAnchorEl(event.currentTarget);
                        }}>
                          <MoreVertIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
            gap: 2,
            p: 2 
          }}>
            {filteredProducts.map((product) => (
              <Card key={product.id}>
                <CardMedia
                  component="img"
                  height="140"
                  image="/product-placeholder.png" // Add a default product image to your public folder
                  alt={product.name}
                />
                <CardContent>
                  <Typography variant="h6" component="div" sx={{ cursor: 'pointer' }}
                    onClick={() => handleProductClick(product)}>
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Category: {product.category}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <IconButton size="small" onClick={() => handleQuantityChange(product, product.quantity - 1)}>
                      <RemoveIcon />
                    </IconButton>
                    <TextField
                      type="number"
                      size="small"
                      value={product.quantity}
                      onChange={(e) => handleQuantityChange(product, parseInt(e.target.value) || 0)}
                      sx={{ width: 60, mx: 1 }}
                    />
                    <IconButton size="small" onClick={() => handleQuantityChange(product, product.quantity + 1)}>
                      <AddIcon />
                    </IconButton>
                  </Box>
                </CardContent>
                <CardActions>
                  <IconButton size="small" color="error" onClick={() => handleDelete(product.id)}>
                    <DeleteIcon />
                  </IconButton>
                  <IconButton size="small" onClick={(event) => setActionMenuAnchorEl(event.currentTarget)}>
                    <MoreVertIcon />
                  </IconButton>
                </CardActions>
              </Card>
            ))}
          </Box>
        )}

        <Dialog open={openAddDialog} onClose={handleCloseDialog}>
          <DialogTitle>Add a New Product</DialogTitle>
          <DialogContent>
            <TextField
              required
              label="Product Name"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              fullWidth
              margin="dense"
            />
            <TextField
              label="Description"
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              fullWidth
              margin="dense"
            />
            <TextField
              required
              label="Category"
              value={newProduct.category}
              onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              fullWidth
              margin="dense"
            />
            <TextField
              required
              label="Sub Category"
              value={newProduct.subCategory}
              onChange={(e) => setNewProduct({ ...newProduct, subCategory: e.target.value })}
              fullWidth
              margin="dense"
            />
            <TextField
              required
              label="Quantity"
              type="number"
              value={newProduct.quantity}
              onChange={(e) => setNewProduct({ ...newProduct, quantity: parseInt(e.target.value) })}
              fullWidth
              margin="dense"
            />
            <TextField
              required
              label="Price"
              type="number"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
              fullWidth
              margin="dense"
            />
            <TextField
              required
              label="Unit"
              value={newProduct.unit}
              onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
              fullWidth
              margin="dense"
            />
            <TextField
              label="Brand"
              value={newProduct.brand}
              onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
              fullWidth
              margin="dense"
            />
            <TextField
              label="SKU"
              value={newProduct.sku}
              onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
              fullWidth
              margin="dense"
            />
            <TextField
              label="Barcode"
              value={newProduct.barcode}
              onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
              fullWidth
              margin="dense"
            />
            <TextField
              label="Expiry Date"
              type="date"
              value={newProduct.expiryDate || ''}
              onChange={(e) => setNewProduct({ ...newProduct, expiryDate: e.target.value })}
              fullWidth
              margin="dense"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              onClick={() => {
                // Only proceed if required fields are filled
                if (
                  newProduct.name &&
                  newProduct.category &&
                  newProduct.subCategory &&
                  newProduct.quantity >= 0 &&
                  newProduct.price >= 0 &&
                  newProduct.unit
                ) {
                  handleAddProduct();
                  handleCloseDialog();
                }
              }}
              variant="contained"
              color="primary"
            >
              Add Product
            </Button>
          </DialogActions>
        </Dialog>

        {/* Product Details Dialog */}
        <Dialog open={detailsOpen} onClose={handleDetailsClose} maxWidth="md" fullWidth>
          <DialogTitle>Product Details</DialogTitle>
          <DialogContent>
            {selectedProduct && (
              <Box sx={{ p: 2 }}>
                <Typography variant="h6">{selectedProduct.name}</Typography>
                <Typography variant="body1" sx={{ mt: 2 }}>Description: {selectedProduct.description}</Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <Typography>Category: {selectedProduct.category}</Typography>
                    <Typography>SubCategory: {selectedProduct.subCategory}</Typography>
                    <Typography>Price: ${selectedProduct.price}</Typography>
                    <Typography>Quantity: {selectedProduct.quantity}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>Unit: {selectedProduct.unit}</Typography>
                    <Typography>Brand: {selectedProduct.brand}</Typography>
                    <Typography>SKU: {selectedProduct.sku}</Typography>
                    <Typography>Barcode: {selectedProduct.barcode}</Typography>
                  </Grid>
                </Grid>
                {selectedProduct.expiryDate && (
                  <Typography sx={{ mt: 2 }}>
                    Expiry Date: {new Date(selectedProduct.expiryDate).toLocaleDateString()}
                  </Typography>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDetailsClose}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Actions Menu */}
        <Menu
          anchorEl={actionMenuAnchorEl}
          open={Boolean(actionMenuAnchorEl)}
          onClose={handleActionMenuClose}
        >
          <MenuItem onClick={handleActionMenuClose}>
            <Typography>Customize Actions</Typography>
          </MenuItem>
          <MenuItem onClick={handleActionMenuClose}>
            <Typography>Configure View</Typography>
          </MenuItem>
        </Menu>
      </Container>
    </Box>
  );
};

export default App;