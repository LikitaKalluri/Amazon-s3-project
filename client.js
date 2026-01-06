// Product catalog with working product image URLs
// Using reliable image sources that will display correctly
const products = [
  {id:"1", name:"Classic Denim Jacket", category:"Jackets", brand:"Aurora", price:2499, image:"https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&h=800&fit=crop&auto=format"},
  {id:"2", name:"Casual White Shirt", category:"Shirts", brand:"Aurora", price:1299, image:"https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=800&fit=crop&auto=format&q=80"},
  {id:"3", name:"Summer Floral Dress", category:"Dresses", brand:"Aurora", price:1999, image:"https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=800&fit=crop&auto=format"},
  {id:"4", name:"Formal Blazer", category:"Blazers", brand:"Aurora", price:3999, image:"https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&h=800&fit=crop&auto=format"},
  {id:"5", name:"Black Skinny Jeans", category:"Jeans", brand:"Aurora", price:1799, image:"https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=800&fit=crop&auto=format"},
  {id:"6", name:"Red Evening Gown", category:"Dresses", brand:"Aurora", price:4999, image:"https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop&auto=format&q=80"}
];

// Cart state management - loads from localStorage and maintains in-memory state
let cart = [];

// Initialize cart from localStorage on page load
function initCart() {
  try {
    const savedCart = localStorage.getItem('cart');
    cart = savedCart ? JSON.parse(savedCart) : [];
    updateCartCount();
  } catch (e) {
    console.error('Error loading cart from localStorage:', e);
    cart = [];
    localStorage.setItem('cart', JSON.stringify([]));
  }
}

// Save cart to localStorage and update UI
function saveCart() {
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
  } catch (e) {
    console.error('Error saving cart to localStorage:', e);
  }
}

// Calculate total cart value
function getCartTotal() {
  return cart.reduce((total, item) => {
    return total + (item.price * item.qty);
  }, 0);
}

// Get total quantity of items in cart
function getCartItemCount() {
  return cart.reduce((total, item) => {
    return total + item.qty;
  }, 0);
}

// Update cart count badge in navigation (prevent multiple rapid updates)
let cartCountUpdateTimeout = null;
function updateCartCount() {
  // Debounce updates to prevent blinking/flickering
  if (cartCountUpdateTimeout) {
    clearTimeout(cartCountUpdateTimeout);
  }
  
  cartCountUpdateTimeout = setTimeout(() => {
    const countElements = document.querySelectorAll('#cartCount');
    const count = getCartItemCount();
    
    countElements.forEach(el => {
      if (el.textContent !== String(count)) {
        el.textContent = count;
        el.style.display = count > 0 ? 'inline-block' : 'none';
      }
    });
    
    // Also update cart count if displayed in navigation link
    const cartLinks = document.querySelectorAll('a[href="cart.html"]');
    cartLinks.forEach(link => {
      const existingBadge = link.querySelector('.cart-badge');
      if (existingBadge) {
        if (existingBadge.textContent !== String(count)) {
          existingBadge.textContent = count;
          existingBadge.style.display = count > 0 ? 'inline-block' : 'none';
        }
      }
    });
    
    cartCountUpdateTimeout = null;
  }, 10); // Small delay to batch updates
}

// Add product to cart - handles multiple products and quantity increments correctly
function addToCart(product) {
  // Validate product object
  if (!product || !product.id) {
    console.error('Invalid product object provided to addToCart');
    return;
  }
  
  // Ensure cart is initialized
  if (cart === null || cart === undefined) {
    initCart();
  }
  
  // Find existing item in cart by product ID
  let item = cart.find(i => i.id === product.id);
  
  if (item) {
    // If product already exists, increment quantity
    item.qty = (item.qty || 1) + 1;
  } else {
    // If product doesn't exist, add new item with quantity 1
    // Create a clean cart item object with all necessary fields
    cart.push({
      id: product.id,
      name: product.name,
      category: product.category,
      brand: product.brand,
      price: product.price,
      image: product.image,
      qty: 1
    });
  }
  
  // Save cart state to localStorage and update UI
  saveCart();
  
  // Show confirmation
  alert(product.name + " added to cart!");
  
  // Push Adobe Data Layer event for addToCart
  // Fixed: Proper event structure and cart data
  if (window.adobeDataLayer) {
    window.adobeDataLayer.push({
      event: "scAdd",
      eventInfo: {
        eventName: "scAdd"
      },
      page: {
        pageName: document.title || "Unknown",
        pageType: getPageType(),
        url: window.location.href
      },
      product: [{
        productId: product.id,
        productName: product.name,
        productCategory: product.category,
        brand: product.brand,
        price: product.price,
        quantity: item ? item.qty : 1
      }],
      cart: {
        items: cart.map(item => ({
          productId: item.id,
          productName: item.name,
          productCategory: item.category,
          brand: item.brand,
          price: item.price,
          quantity: item.qty
        })),
        total: getCartTotal()
      },
      timestamp: new Date().toISOString()
    });
  }
}

// Helper function to determine page type
function getPageType() {
  const path = window.location.pathname || window.location.href;
  if (path.includes('pdp.html') || path.includes('id=')) return 'pdp';
  if (path.includes('plp.html')) return 'plp';
  if (path.includes('cart.html')) return 'cart';
  if (path.includes('checkout.html')) return 'checkout';
  if (path.includes('thankyou.html')) return 'thankyou';
  return 'home';
}

// Load and display cart items in the cart page
function loadCart() {
  // Ensure cart is initialized
  if (!cart || cart.length === 0) {
    initCart();
  }
  
  const ul = document.getElementById('cartItems');
  if (!ul) return;
  
  ul.innerHTML = '';
  
  if (cart.length === 0) {
    const emptyMsg = document.createElement('li');
    emptyMsg.innerHTML = '<p>Your cart is empty.</p>';
    ul.appendChild(emptyMsg);
    
    // Push cart view event even if empty
    if (window.adobeDataLayer) {
      window.adobeDataLayer.push({
        event: "scView",
        eventInfo: { eventName: "scView" },
        page: {
          pageName: "Cart",
          pageType: "cart",
          url: window.location.href
        },
        cart: {
          items: [],
          total: 0
        },
        timestamp: new Date().toISOString()
      });
    }
    return;
  }
  
  // Display each cart item with image, details, quantity controls, and remove button
  cart.forEach((item, index) => {
    const li = document.createElement('li');
    li.style.display = 'flex';
    li.style.alignItems = 'center';
    li.style.gap = '15px';
    li.style.flexWrap = 'wrap';
    
    // Product image with proper error handling to prevent blinking
    const img = document.createElement('img');
    img.alt = item.name;
    img.width = 80;
    img.height = 80;
    img.style.objectFit = 'cover';
    img.style.borderRadius = '5px';
    img.style.display = 'block';
    
    let imageLoaded = false;
    
    // Try to load image with error handler that only fires once
    img.onload = function() {
      imageLoaded = true;
      this.style.opacity = '1';
    };
    
    img.onerror = function() {
      if (!imageLoaded) {
        // Fallback to placeholder if image fails to load
        this.src = 'https://via.placeholder.com/80x80?text=' + encodeURIComponent(item.name.substring(0, 10));
        imageLoaded = true;
      }
    };
    
    // Set initial opacity for smooth fade-in
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.2s ease-in';
    
    // Start loading image
    img.src = item.image || 'https://via.placeholder.com/80x80?text=Product';
    
    // Product details
    const details = document.createElement('div');
    details.style.flex = '1';
    details.innerHTML = `
      <strong>${item.name}</strong><br>
      <span>Category: ${item.category}</span><br>
      <span>₹${item.price} x ${item.qty} = ₹${item.price * item.qty}</span>
    `;
    
    // Quantity controls
    const qtyControls = document.createElement('div');
    qtyControls.style.display = 'flex';
    qtyControls.style.alignItems = 'center';
    qtyControls.style.gap = '10px';
    
    const decreaseBtn = document.createElement('button');
    decreaseBtn.textContent = '-';
    decreaseBtn.onclick = () => updateQuantity(item.id, -1);
    decreaseBtn.style.padding = '5px 10px';
    
    const qtyDisplay = document.createElement('span');
    qtyDisplay.textContent = item.qty;
    qtyDisplay.style.minWidth = '30px';
    qtyDisplay.style.textAlign = 'center';
    
    const increaseBtn = document.createElement('button');
    increaseBtn.textContent = '+';
    increaseBtn.onclick = () => updateQuantity(item.id, 1);
    increaseBtn.style.padding = '5px 10px';
    
    qtyControls.appendChild(decreaseBtn);
    qtyControls.appendChild(qtyDisplay);
    qtyControls.appendChild(increaseBtn);
    
    // Remove button
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.onclick = () => removeFromCart(item.id);
    removeBtn.style.background = 'red';
    removeBtn.style.color = 'white';
    removeBtn.style.border = 'none';
    removeBtn.style.padding = '8px 15px';
    removeBtn.style.cursor = 'pointer';
    removeBtn.style.borderRadius = '5px';
    
    li.appendChild(img);
    li.appendChild(details);
    li.appendChild(qtyControls);
    li.appendChild(removeBtn);
    ul.appendChild(li);
  });
  
  // Display total
  const total = getCartTotal();
  const totalEl = document.createElement('li');
  totalEl.style.background = '#f0f0f0';
  totalEl.style.padding = '15px';
  totalEl.style.marginTop = '10px';
  totalEl.style.borderRadius = '8px';
  totalEl.style.fontSize = '18px';
  totalEl.style.fontWeight = 'bold';
  totalEl.innerHTML = `Total: ₹${total}`;
  ul.appendChild(totalEl);
  
  // Update checkout button visibility if it exists on the page
  const checkoutSection = document.getElementById('checkoutSection');
  if (checkoutSection) {
    checkoutSection.style.display = cart.length > 0 ? 'block' : 'none';
  }
  
  // Push cart view event to Adobe Data Layer
  if (window.adobeDataLayer) {
    window.adobeDataLayer.push({
      event: "scView",
      eventInfo: { eventName: "scView" },
      page: {
        pageName: "Cart",
        pageType: "cart",
        url: window.location.href
      },
      cart: {
        items: cart.map(item => ({
          productId: item.id,
          productName: item.name,
          productCategory: item.category,
          brand: item.brand,
          price: item.price,
          quantity: item.qty
        })),
        total: total
      },
      timestamp: new Date().toISOString()
    });
  }
}

// Update quantity of a cart item
function updateQuantity(productId, change) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  
  item.qty = item.qty + change;
  
  // Remove item if quantity becomes 0 or negative
  if (item.qty <= 0) {
    removeFromCart(productId);
    return;
  }
  
  // Save and refresh cart display
  saveCart();
  loadCart();
  
  // Push cart update event to Adobe Data Layer
  if (window.adobeDataLayer) {
    window.adobeDataLayer.push({
      event: "scUpdate",
      eventInfo: { eventName: "scUpdate" },
      page: {
        pageName: "Cart",
        pageType: "cart",
        url: window.location.href
      },
      product: [{
        productId: item.id,
        productName: item.name,
        quantity: item.qty
      }],
      cart: {
        items: cart.map(item => ({
          productId: item.id,
          productName: item.name,
          productCategory: item.category,
          brand: item.brand,
          price: item.price,
          quantity: item.qty
        })),
        total: getCartTotal()
      },
      timestamp: new Date().toISOString()
    });
  }
}

// Remove item from cart
function removeFromCart(id) {
  // Find the item being removed for the event
  const removedItem = cart.find(i => i.id === id);
  
  // Remove item from cart
  cart = cart.filter(i => i.id !== id);
  
  // Save cart state
  saveCart();
  
  // Reload cart display
  loadCart();
  
  // Push remove from cart event to Adobe Data Layer
  if (window.adobeDataLayer && removedItem) {
    window.adobeDataLayer.push({
      event: "scRemove",
      eventInfo: { eventName: "scRemove" },
      page: {
        pageName: "Cart",
        pageType: "cart",
        url: window.location.href
      },
      product: [{
        productId: removedItem.id,
        productName: removedItem.name,
        productCategory: removedItem.category,
        brand: removedItem.brand,
        price: removedItem.price,
        quantity: removedItem.qty
      }],
      cart: {
        items: cart.map(item => ({
          productId: item.id,
          productName: item.name,
          productCategory: item.category,
          brand: item.brand,
          price: item.price,
          quantity: item.qty
        })),
        total: getCartTotal()
      },
      timestamp: new Date().toISOString()
    });
  }
}

// Checkout function - processes order and clears cart
function checkout() {
  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }
  
  // Generate order ID
  const orderId = "ORD" + Math.floor(Math.random() * 100000);
  
  // Calculate total revenue
  const revenue = getCartTotal();
  
  // Push purchase event to Adobe Data Layer before clearing cart
  if (window.adobeDataLayer) {
    window.adobeDataLayer.push({
      event: "purchase",
      eventInfo: { eventName: "purchase" },
      page: {
        pageName: "Checkout",
        pageType: "checkout",
        url: window.location.href
      },
      order: {
        id: orderId,
        revenue: revenue,
        products: cart.map(item => ({
          productId: item.id,
          productName: item.name,
          productCategory: item.category,
          brand: item.brand,
          price: item.price,
          quantity: item.qty
        }))
      },
      cart: {
        items: cart.map(item => ({
          productId: item.id,
          productName: item.name,
          productCategory: item.category,
          brand: item.brand,
          price: item.price,
          quantity: item.qty
        })),
        total: revenue
      },
      timestamp: new Date().toISOString()
    });
  }
  
  // Clear cart
  cart = [];
  saveCart();
  
  // Store order ID in sessionStorage to display on thank you page
  sessionStorage.setItem('orderId', orderId);
  
  // Redirect to thank you page
  window.location.href = "thankyou.html";
}

// Initialize cart and update UI on page load
document.addEventListener('DOMContentLoaded', () => {
  initCart();
  
  // Load cart if we're on the cart page
  if (document.getElementById('cartItems')) {
    loadCart();
  }
});
