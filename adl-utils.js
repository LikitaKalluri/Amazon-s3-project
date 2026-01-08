window.adl = {
  getLastPush:function(){ return window.adobeDataLayer[window.adobeDataLayer.length-1]; },
  get:function(path){ return path.split('.').reduce((o,k)=>o?o[k]:undefined,window.adobeDataLayer[window.adobeDataLayer.length-1]); }
};

// Global click tracking for Adobe Data Layer
// This captures all click interactions across the website
(function() {
  // Helper function to get page name
  function getPageName() {
    const path = window.location.pathname || window.location.href;
    if (path.includes('pdp.html') || path.includes('id=')) return 'PDP';
    if (path.includes('plp.html')) return 'PLP';
    if (path.includes('cart.html')) return 'Cart';
    if (path.includes('checkout.html')) return 'Checkout';
    if (path.includes('thankyou.html')) return 'ThankYou';
    return 'Home';
  }
  
  // Add document-level click listener
  document.addEventListener('click', function(event) {
    // Only track if Adobe Data Layer exists
    if (!window.adobeDataLayer) {
      return;
    }
    
    // Get clicked element
    const element = event.target;
    
    // Skip tracking for specific elements that might cause noise
    // You can customize this list as needed
    const skipElements = ['SCRIPT', 'STYLE', 'META', 'LINK', 'HEAD', 'HTML', 'BODY'];
    if (skipElements.includes(element.tagName)) {
      return;
    }
    
    // Get element text (truncate if too long)
    let elementText = '';
    if (element.textContent) {
      elementText = element.textContent.trim().substring(0, 100);
    } else if (element.innerText) {
      elementText = element.innerText.trim().substring(0, 100);
    }
    
    // Get tag name
    const tagName = element.tagName || '';
    
    // Push click event to Adobe Data Layer
    window.adobeDataLayer.push({
      event: "click",
      eventInfo: {
        eventName: "click"
      },
      page: {
        pageName: getPageName(),
        url: window.location.href
      },
      click: {
        elementText: elementText,
        tagName: tagName,
        id: element.id || '',
        className: element.className || '',
        href: element.href || ''
      },
      timestamp: new Date().toISOString()
    });
  });
})();