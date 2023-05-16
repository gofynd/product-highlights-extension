import { createBrowserRouter } from "react-router-dom";
import { routeGuard } from "./guard";

import App from "../App";
import ProductList from "../views/ProductList";
import CreateHighlight from "../views/CreateHighlight";

const router = createBrowserRouter([
  {
    path: "/company/:company_id/",
    element: <App />,
    loader: routeGuard,
  },
  {
    path: "/company/:company_id/:application_id/product-list/",
    element: <ProductList />
  },
  {
    path: "/company/:company_id/:application_id/highlight/create",
    element: <CreateHighlight />
  },
  {
    path: "/company/:company_id/:application_id/highlight/:item_code",
    element: <CreateHighlight />
  }
]);

export default router;
