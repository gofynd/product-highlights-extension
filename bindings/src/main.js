import Highlights from './Highlights.vue'
import PriceDrop from './PriceDrop.vue'


window.FPI.extension.register("#product-highlights", {
  mounted(element) {
    window.FPI.extension.mountApp({
      element, 
      component: Highlights
    });
  }
})

window.FPI.extension.register("#product-price-drop", {
  mounted(element) {
    window.FPI.extension.mountApp({
      element,
      component: PriceDrop
    })
  }
})