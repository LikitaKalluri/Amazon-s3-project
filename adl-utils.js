window.adl = {
  getLastPush:function(){ return window.adobeDataLayer[window.adobeDataLayer.length-1]; },
  get:function(path){ return path.split('.').reduce((o,k)=>o?o[k]:undefined,window.adobeDataLayer[window.adobeDataLayer.length-1]); }
};
