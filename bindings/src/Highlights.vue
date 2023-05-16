<template>
  <div class="product-highlights">
    <div v-if="highlightsData"> 
      <div class="highlightTitle">Product Highlights</div>
      <div
        v-for="(highlight, index) in highlightsData"
        :key="index"
        >
        <div class="highlightList">{{highlight}}</div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import urlJoin from "url-join";

export default {
  name: "ProductHighlights",
  
  data() {
    return {
      highlightsData: null
    };
  },

  async mounted() {
    const baseURL = window.location.origin;
    const product_slug = this.$route.params.slug;

    let { data } = await axios.get(
      urlJoin(baseURL, 'ext/producthighlights/highlight'), 
      { params: {slug: product_slug}, headers: {"ngrok-skip-browser-warning": true} }
    );
    
    if (data && data.is_active && data.product && data.product.highlights && data.product.highlights.length) {
      this.highlightsData = data.product.highlights
    }
  },
}
</script>

<style>
.highlightTitle {
  font-size: 14px;
  font-weight: 700;
  color: #000000;
  padding: 32px 0 6px 0;
}

.highlightList {
  font-size: 14px;
  font-weight: 400;
  color: #000000;
  padding: 8px 0;
}
</style>
