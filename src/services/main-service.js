import URLS from "./endpoint.service";
import axios from "axios";
import { getCompany } from "../helper/utils";

axios.interceptors.request.use((config) => {
  config.headers["x-company-id"] = getCompany();
  return config;
});

const MainService = {
  getAllApplications(params = {}) {
    return axios.get(URLS.GET_ALL_APPLICATIONS());
  },
  getAllProducts(application_id, query) {
    return axios.get(URLS.GET_PRODUCTS(application_id), {params: {query}});
  },
  createProductHighlights(application_id, item_id, data) {
    return axios.post(URLS.CREATE_PRODUCT_HIGHLIGHTS(application_id, item_id), data);
  },

  // product highlights
  getHighlightList(application_id) {
    return axios.get(URLS.GET_HIGHLIGHT_LIST(application_id));
  },
  getProductHighlight(application_id, item_code="", slug="") {
    return axios.get(URLS.PRODUCT_HIGHLIGHT(application_id), {params: {item_code, slug}});
  },
  deleteProductHighlight(application_id, item_code="", slug="") {
    return axios.delete(URLS.PRODUCT_HIGHLIGHT(application_id), {params: {item_code, slug}});
  },

  // script inject
  addInjectableTag(application_id, item_code) {
    return axios.post(URLS.INJECTABLE_TAG(application_id, item_code));
  },
  deleteInjectableTag(application_id, item_code) {
    return axios.delete(URLS.INJECTABLE_TAG(application_id, item_code));
  }

};

export default MainService;
