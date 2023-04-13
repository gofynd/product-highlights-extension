import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { 
  Button, Dropdown, Input, Checkbox,  SvgIcConfirm, SvgIcArrowBack, SvgIcTrash
} from '@gofynd/nitrozen-react';
import MainService from '../services/main-service';
import styles from './style/createHighlight.module.css'


export default function CreateHighlight() {
  // page params
  const { company_id, application_id, item_code } = useParams();
  
  // navigation instance
  const navigate = useNavigate();

  // application product list
  const [productItems, setProductItems] = useState([]);
  const [searchText, setSearchText] = useState('');

  // highlight text input
  const [highlightInput, setHighlightInput] = useState("");

  // locally maintained highlight list
  const [highlightList, setHighlightList] = useState([]);

  // current selected dropdown value
  const [selectedDropdownProduct, setSelectedDropdownProduct] = useState({});

  // is edit page
  const [isEdit, setIsEdit] = useState(false);
  const [editProduct, setEditProduct] = useState({});

  // price drop
  const [checkboxValue, setCheckboxValue] = useState(false);


  // handle dropdown search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      console.log(searchText)
      getApplicationProductList();
    }, 500)
    return () => clearTimeout(delayDebounceFn)
  }, [searchText])


  // application product list for dropdown
  const getApplicationProductList = async () => {
    if (item_code) {
      setIsEdit(true);
      const { data } = await MainService.getProductHighlight(application_id, item_code);
      setHighlightList(data?.product?.highlights);
      setCheckboxValue(data?.product?.enablePriceDrop);
      setEditProduct({
        name: data?.product?.name,
        product_slug: data?.product_slug,
        image: data?.product?.image,
        brand_name: data?.product?.brand_name,
        category_slug: data?.product?.category_slug,
        product_item_code: data?.product_item_code
      })
      
    } else {
      const { data } = await MainService.getAllProducts(application_id, searchText);
      setProductItems(data.items);
    }
  }


  // handle dropdown onChange
  const dropdownChangeHandler = async (productMeta) => {
    
    let { data } = await MainService.getProductHighlight(application_id, productMeta.product_item_code);
    if (data) {
      setHighlightList(data.product.highlights);
      setCheckboxValue(data.product.enablePriceDrop);
    } else {
      setHighlightList([]);
      setCheckboxValue(false);
    }
    setSelectedDropdownProduct(productMeta);
  }

  
  // Dropdown data
  const getSearchItems = () => {
    let prepareProductList = []
    productItems.forEach((product) => {
      let searchProduct = {}
      searchProduct.text = product?.name
      searchProduct.sub_text = product?.brand?.name
      searchProduct.value = {
        name: product?.name,
        product_slug: product?.slug,
        image: product?.images[0],
        brand_name: product?.brand?.name,
        category_slug: product?.category_slug,
        product_item_code: product?.uid,
        price: product?.price
      }
      searchProduct.logo = product?.images[0]
      prepareProductList.push(searchProduct);
    })
    return prepareProductList;
  }


  const handleSubmit = async () => {
    if (isEdit) {
      await MainService.createProductHighlights(
        application_id,
        editProduct.product_item_code,
        {
          productMeta: editProduct,
          highlights: highlightList,
          enablePriceDrop: checkboxValue
        }
      )

    } else {
      await MainService.createProductHighlights(
        application_id, 
        selectedDropdownProduct.product_item_code, 
        {
          product_meta: selectedDropdownProduct,
          highlights: highlightList,
          enablePriceDrop: checkboxValue
        }
      )
    }

    navigate(`/company/${company_id}/${application_id}/product-list/`);
  }  


  return (
    <>
      <div className={styles.main_wrapper}>

        {/* NAVBAR */}
        <div className={styles.navbar}>

          {/* NAVBAR LEFT */}
          <div className={styles.navbar_left_header}>
            <div className={styles.back_arrow}>
              <SvgIcArrowBack 
                color='#2E31BE'
                style={{
                  width: "24px",
                  height: "auto"
                }}
                onClick={() => {
                  navigate(`/company/${company_id}/${application_id}/product-list/`)
                }}
              />
            </div>
            <div className={styles.main_title}>
              {isEdit ? ("Edit") : ("Create")} Product Highlight
            </div>
          </div>

          {/* NAVBAR RIGHT */}
          <div className={styles.navbar_buttons}>
            {/* DISCARD BUTTON */}
            <div>
              <Button
                state='default'
                theme='secondary'
                // size='small'
                rounded={false}
                onClick={() => {
                  navigate(`/company/${company_id}/${application_id}/product-list/`)
                }}
                >
                Discard
              </Button>
            </div>
              
            {/* SUBMIT BUTTON */}
            <div>
              <Button
                state='default'
                theme='primary'
                // size='small'
                rounded={false}
                onClick={handleSubmit}
                >
                {isEdit ? ("Save") : ("Submit")}
              </Button>
            </div>
          </div>

        </div>
        {/* END NAVBAR */}


        <div className={styles.content_wrapper}>

          <div className={styles.highlight_detail_box}>
            <div>
              <div className={styles.highlight_detail_box_header}>Product Highlight Detail</div>
            </div>
            
            {/* PRODUCT DROPDOWN */}
            {!isEdit ? (
              <div className={styles.select_product_dropdown}>
                <Dropdown
                  placeholder="select product"
                  searchable={true}
                  items={getSearchItems()}
                  onChange={(productMeta) => {dropdownChangeHandler(productMeta);}}
                  onSearchInputChange={(e) => {setSearchText(e.text);}}
                />
              </div>
            ) : (
              <div className={styles.edit_product_title}>
                <Input 
                  type='text'
                  value={editProduct.name}
                  disabled={true}
                />
              </div>
            )}

            <div className={styles.add_highlights_header}>
              Add/Edit Highlights
            </div>
            
            {/* HIGHLIGHTS LIST */}
            <div>
              {highlightList?.map((highlight, index) => (
                <div className={styles.highlight_list}>
                  <div>
                    {highlight}
                  </div>

                  <div className={styles.highlight_list_delete}>
                    <SvgIcTrash 
                      className={styles.highlight_delete}
                      style={{
                        height: "24px",
                        width: "auto"
                      }}
                      color="#2E31BE"
                      onClick={() => {
                        setHighlightList((prevItem) => {
                          return [...prevItem.slice(0, index), ...prevItem.slice(index+1)]
                        })
                      }}
                    />
                  </div>

                </div>
              ))}
            </div>

            <div className={styles.highlight_input_ok}>
              {/* HIGHLIGHT INPUT */}
              <div className={styles.highlight_input_div}>
                <Input
                  placeholder='add highlights'
                  style={{
                    padding: "0px"
                  }}
                  max={200}
                  min={1}
                  value={highlightInput}
                  disabled={ !isEdit && Object.keys(selectedDropdownProduct).length === 0 ? true : false }
                  onChange={(e) => {setHighlightInput(e.target.value)}}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      setHighlightList([...highlightList, highlightInput])
                      setHighlightInput("")
                    }
                  }}
                />
              </div>
              {/* HIGHLIGHT OK BUTTON */}
              <div
                onClick={() => {
                  setHighlightList([...highlightList, highlightInput])
                  setHighlightInput("")
                }}
                >
                {highlightInput && (
                  <SvgIcConfirm
                    color='#2e31be'
                    style={{
                      height: "24px",
                      width: "auto",
                      cursor: "pointer"
                    }}
                  />
                )}
              </div>
            </div>

            {/* ENABLE PRICE DROP CHECKBOX */}
            <div className={styles.enable_price_drop_checkbox}>
              <Checkbox 
                labelText="Enable 'Price Drop' label whenever price is reduced in last 2 days"
                disabled={ !isEdit && Object.keys(selectedDropdownProduct).length === 0 ? true : false }
                checkboxValue={checkboxValue}
                onChange={(changedState) => {
                  setCheckboxValue(changedState);
                }}
              />
            </div>

          </div>

          <div className={styles.highlight_preview_box}>
            <div className={styles.preview_box_header}>
              Preview
            </div>
            <div className={styles.horizontal_line}></div>
            <div>
              {highlightList.length>0 && <div className={styles.highlightTitle}>Product Highlights</div>}
              <div>
                {highlightList?.map((highlight) => (
                  <div className={styles.highlightList}>{highlight}</div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}