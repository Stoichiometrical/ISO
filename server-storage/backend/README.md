# API Documentation

## Customer Segmentation
- `customer_segmentation`
- `get_segment_transactions`

## Data Generation
- `generate_products_data`

## Order Analysis and Offers
- `apply_discount_tier`
- `load_custom_discounts`
- `calculate_loyalty_points`
- `calculate_next_tier_difference`
- `save_custom_discounts`
- `get_bundlesets`
- `create_bogd_offers`

## Utility Methods
- `month_name_to_number`
- `find_promo_days`
- `segment_offers`

## Flask Endpoints

### `/start_test`
Initialize a test by creating an API folder and uploading customer data.
**Method:** `POST`

### `/get_forecast`
Get month forecast data.
**Method:** `GET`
**Parameters:**
- `api_name`: The name of the API for which to get the forecast data.

### `/get_promo_days`
Get promo days file.
**Method:** `GET`
**Parameters:**
- `api_name`: The name of the API for which to get the promo days file.

### `/get_customer_segments`
Get customer segments file.
**Method:** `GET`
**Parameters:**
- `api_name`: The name of the API for which to get the customer segments file.

### `/get_recommendations`
Endpoint that returns nothing.
**Method:** `GET`

### `/generate_api_data/<api_name>`
Generate API data including custom discounts and product bundles.
**Method:** `POST`
**URL Parameters:**
- `api_name`: The name of the API for which to generate data.
**Request Body:** JSON data to be saved.

### `/get_products`
Get products data.
**Method:** `GET`
**Parameters:**
- `api_name`: The name of the API for which to get the products data.

### `/get_offers`
Get offers for a day and segment.
**Method:** `GET`
**Parameters:**
- `date`: The date for which to get offers.
- `segment_name`: The segment name for which to get offers.
- `api_name`: The name of the API for which to get offers.

### `/get_bundle_info`
Get bundle information for a specified segment.
**Method:** `GET`
**Parameters:**
- `segment_name`: The segment name for which to get bundle information.
- `api_name`: The name of the API for which to get bundle information.

### `/get_bodg_offers`
Get BODG offers for a specified segment.
**Method:** `GET`
**Parameters:**
- `api_name`: The name of the API for which to get BODG offers.
- `segment_name`: The segment name for which to filter offers.

### `/apply_discount`
Check order to apply discounts.
**Method:** `POST`
**Request Body:** JSON data with `total_price` and `api_name`.
