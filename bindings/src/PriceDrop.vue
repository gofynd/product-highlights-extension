<template>
  <div>
    <div v-if="showPriceDrop">
      <img src="../assets/drop-price-tag.svg" alt="price-drop-png" />
    </div>
  </div>
</template>


<script>
import axios from "axios";
import urlJoin from "url-join";
export default {
  name: 'PriceDrop',

  data() {
    return {
      showPriceDrop: false
    }
  },

  async mounted() {
    const baseURL = window.location.origin;
    const product_slug = this.$route.params.slug;

    let { data } = await axios.get(urlJoin(baseURL, 'ext/producthighlights/price-drop'), {params: {slug: product_slug}});

    if (data && data.showPriceDrop) {
      this.showPriceDrop = true;
    }
  }

}
</script>


<style scoped>
img {
  height: 48px;
  width: auto;
}
</style>