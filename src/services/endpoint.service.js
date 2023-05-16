import urlJoin from "url-join";
import root from "window-or-global";
let envVars = root.env || {};

// envVars.EXAMPLE_MAIN_URL = `${root.location.protocol}//${root.location.hostname}`;
envVars.EXAMPLE_MAIN_URL = `${root.location.protocol}//${root.location.hostname}:${root.location.port}`;
if (
  root &&
  root.process &&
  root.process.env &&
  root.process.NODE_ENV === "test"
) {
  envVars.EXAMPLE_MAIN_URL = "https://api.xyz.com";
}

const Endpoints = {
  GET_ALL_APPLICATIONS() {
    return urlJoin(envVars.EXAMPLE_MAIN_URL, "/api/v1.0/applications");
  },
  GET_PRODUCTS(application_id) {
    return urlJoin(envVars.EXAMPLE_MAIN_URL, `api/v1.0/${application_id}/products`);
  },
  CREATE_PRODUCT_HIGHLIGHTS(application_id, item_id) {
    return urlJoin(envVars.EXAMPLE_MAIN_URL, `api/v1.0/${application_id}/product/${item_id}/highlights`);
  },
  GET_HIGHLIGHT_LIST(application_id) {
    return urlJoin(envVars.EXAMPLE_MAIN_URL, `api/v1.0/${application_id}/highlight/list`);
  },
  PRODUCT_HIGHLIGHT(application_id) {
    return urlJoin(envVars.EXAMPLE_MAIN_URL, `api/v1.0/${application_id}/highlight`);
  },
  INJECTABLE_TAG(application_id, item_code) {
    return urlJoin(envVars.EXAMPLE_MAIN_URL, `api/v1.0/${application_id}/tag/${item_code}`);
  }
};

export default Endpoints;
