/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useRef } from "react";
import Loader from "../components/Loader";
import { Button, Input, ToggleButton, SvgIcEdit, SvgIcTrash, SvgIcArrowBack } from "@gofynd/nitrozen-react";
import { useParams, useNavigate } from 'react-router-dom'
import styles from './style/productList.module.css';
import MainService from "../services/main-service";


function ProductCard({productItem, onProductDelete}) {
  const [toggleState, setToggleState] = useState(productItem.is_active);
  const { company_id, application_id } = useParams();
  const dummyState = useRef(false);
  const navigate = useNavigate();


  useEffect(() => {
    if (dummyState.current) {
      (async () => {
        if (toggleState) {
          await MainService.addInjectableTag(application_id, productItem.product_item_code);
        } else {
          await MainService.deleteInjectableTag(application_id, productItem.product_item_code);
        }
      })()
    }
    dummyState.current = true;
  }, [toggleState])

  return (
    <>
      <div className={styles.product_card}>
        <div className={styles.card_left}>

          {/* PRODUCT LOGO */}
          <div className={styles.image_card}>
            <img className={styles.logo} src={productItem.product.image} alt="product_image" />
          </div>

          {/* PRODUCT META */}
          <div className={styles.product_metadata}>

            <div className={styles.product_metadata_header}>
              <div className={styles.header_name}>
                {productItem.product.name}
              </div>
              <div className={styles.pipe}>
                | 
              </div>
              <span className={styles.item_code}>
                Item code: {productItem.product_item_code}
              </span>
            </div>

            <div className={styles.product_metadata_brand}>
              {productItem.product.brand_name}
            </div>

            <div className={styles.product_metadata_category}>
              category: {productItem.product.category_slug}
            </div>

          </div>

        </div>


        {/* TOGGLE BUTTON */}
        <div className={styles.product_toggle_button}>
          <ToggleButton 
            id={productItem.product_item_code}
            size={"small"}
            value={toggleState}
            onToggle={async (event) => {
              setToggleState((pre) => !pre);
            }}
          />
        </div>
        
        <div className={styles.product_delete_edit}>
          {/* DELETE SVG */}
          <div>
            <SvgIcTrash
              color="#2E31BE"
              className={styles.product_delete}
              onClick={async () => {
                if (toggleState) {
                  await MainService.deleteInjectableTag(application_id, productItem.product_item_code);
                }
                await MainService.deleteProductHighlight(application_id, productItem.product_item_code);
                onProductDelete(productItem.product_item_code);
              }}
            />
          </div>

          {/* EDIT SVG */}
          <div>
            <SvgIcEdit 
              color="#2E31BE"
              className={styles.product_edit}
              onClick={() => {
                navigate(`/company/${company_id}/${application_id}/highlight/${productItem.product_item_code}`);
              }}
            />
          </div>
        </div>

      </div>
    </>
  )
}


export default function ProductList() {
  const [pageLoading, setPageLoading] = useState(false);
  const [productItems, setProductItems] = useState([]);
  const [allProductItems, setAllProductItems] = useState([]);
  const [searchTextValue, setSearchTextValue] = useState("");

  const navigate = useNavigate();
  const { company_id, application_id } = useParams();

  async function fetchProductItems() { 
    const { data } = await MainService.getHighlightList(application_id);
    setAllProductItems(data);
    setProductItems(data);
    setPageLoading(false);
  }

  function createProductHighlights() {
    navigate(`/company/${company_id}/${application_id}/highlight/create`)
  }

  function onProductDelete(product_item_code) {
    setAllProductItems((prevState) => {
      let findIndex = prevState.findIndex(product => product.product_item_code === product_item_code);
      prevState.splice(findIndex, 1);
      let newArr = [...prevState]
      return newArr;
    })
  }

  useEffect(() => {
    if (!searchTextValue) {
      setProductItems(allProductItems.map((product) => product))
    } else {
      setProductItems(
        allProductItems.filter((item) => {
          return item.product.name.toLowerCase().includes(searchTextValue.toLowerCase());
        })
      )
    }
  }, [allProductItems, searchTextValue]);

  useEffect(() => {
    setPageLoading(true);
    fetchProductItems()
  }, []); 

  return (
    <>
      { pageLoading ? (
        <Loader />
      ) : (
      
        <div className={styles.main_wrapper}>

          <div className={styles.sticky_header}>

            <div className={styles.navbar_left_section}>
              {/* BACK ARROW */}
              <div className={styles.back_arrow}>
                <SvgIcArrowBack 
                  color='#2E31BE'
                  style={{
                    width: "24px",
                    height: "auto"
                  }}
                  onClick={() => {
                    navigate(`/company/${company_id}/`);
                  }}
                />
              </div>

              {/* SEARCH INPUT */}
              <div className={styles.search_product_highlight}>
                <Input
                  showSearchIcon
                  className={styles.search_input}
                  type="text"
                  placeholder="search by product name"
                  value={searchTextValue}
                  disabled={Object.keys(allProductItems).length === 0 ? true : false }
                  onChange={(event) => {
                    setSearchTextValue(event.target.value);
                  }}
                />
              </div>
            </div>

            {/* CREATE HIGHLIGHT BUTTON */}
            <div className={styles.create_highlight_button}>
              <Button
                onClick={() => {createProductHighlights()}}
                rounded={false}
                >
                Create Product Highlight
              </Button>
            </div>

          </div>

          <div className={styles.product_listing}>
            {productItems.map((product) => (
              <ProductCard
                key={product.product_item_code} 
                productItem={product}
                onProductDelete={onProductDelete}
              />
            ))}
          </div>
        </div>

      )}
    </>
  );
}