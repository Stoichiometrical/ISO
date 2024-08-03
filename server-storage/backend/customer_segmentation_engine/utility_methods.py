
import os

import numpy as np
import pandas as pd
from shortuuid import uuid

API_1 = "http://127.0.0.1:5000"  #segmentation
API_2 = "http://127.0.0.1:5001"  #prescriptive
API_3 = "http://127.0.0.1:5002"  #predictive

ROOT_PATH = "../s3"
def customer_segmentation(data):
    df = data
    df = df[["InvoiceDate", "InvoiceNo", "CustomerID", "StockCode", "UnitPrice", "Quantity", "TotalPrice"]]

    # Group transactions by CustomerID then aggregate total price and quantity for them
    customer = df.groupby("CustomerID").agg(
        {
            "TotalPrice": "sum",
            "Quantity": "sum"
        }
    ).reset_index()

    # Add frequency
    customer["Frequency"] = df.groupby('CustomerID')['InvoiceNo'].count().reset_index()["InvoiceNo"]

    # Add Monetary
    customer['Monetary'] = df.groupby('CustomerID')['TotalPrice'].mean().reset_index()['TotalPrice']

    # Add Recency
    # First get date
    df["InvoiceDate"] = pd.to_datetime(df["InvoiceDate"])
    rfm_data = df.groupby('CustomerID')['InvoiceDate'].max().reset_index()
    customer['Recency'] = (rfm_data['InvoiceDate'].max() - rfm_data['InvoiceDate']).dt.days

    # Now add RFM scores
    customer['R_score'] = pd.qcut(customer['Recency'], q=3, labels=[1, 2, 3])  # High recency will have a score of 1
    customer['F_score'] = pd.qcut(customer['Frequency'], q=3, labels=[1, 2, 3])
    customer['M_score'] = pd.qcut(customer['Monetary'], q=3, labels=[1, 2, 3])

    # Assign Final RFM Score
    customer['RFM'] = customer[['R_score', 'F_score', 'M_score']].astype(str).agg(''.join, axis=1)
    customer.drop(columns=['R_score', 'F_score', 'M_score'], inplace=True)

    # Segment the customers
    customer["Segment"], customer["Subsegment"] = segment_customers(customer['RFM'])

    # Merging segments into final df
    segmented = df[["CustomerID", "InvoiceNo", "StockCode"]]
    x = customer[["CustomerID", "Segment", "Subsegment"]]
    transaction_df = pd.merge(segmented, x, on="CustomerID", how="left")

    return customer, transaction_df


def segment_customers(rfm_column):
    """Segments customers into broad and subsegments based on RFM scores for a general retail store.

    Args:
        rfm_column (pd.Series): Series containing RFM scores.

    Returns:
        tuple: A tuple containing two pandas Series, one for broad segment and one for subsegment.
    """
    broad_segments = []
    subsegments = []

    # Define dictionaries for each segment and subsegment
    high_value_segments = {
        (1, 1, 1): 'Loyal Champions', (1, 1, 2): 'Frequent Spenders', (1, 1, 3): 'Rising Stars',
        (1, 2, 1): 'Recent Big Spenders', (1, 2, 2): 'Frequent Spenders', (1, 2, 3): 'Rising Stars',
        (1, 3, 1): 'Rekindled Spenders', (1, 3, 2): 'Needs Attention', (1, 3, 3): 'Value Seekers',
        (2, 3, 1): 'Big Ticket Buyers'
    }
    nurture_segments = {
        (2, 2, 2): 'Occasional Spenders', (2, 2, 3): 'Value Seekers', (2, 3, 2): 'Sleeping Giants',
        (2, 3, 3): 'Value Seekers', (1, 3, 3): 'Needs Attention',
        (2, 1, 2): 'Win-Back Target', (2, 1, 3): 'Win-Back Target',
        (2, 2, 1): 'Potential Upscale'
    }
    risk_segments = {
        (3, 1, 1): 'Lost Loyalists', (3, 1, 2): 'Fading Interest', (3, 1, 3): 'One-Time Buyers',
        (3, 2, 1): 'At-Risk Customers', (3, 2, 2): 'Fading Interest', (3, 2, 3): 'One-Time Buyers',
        (3, 3, 1): 'Window Shoppers', (3, 3, 2): 'Window Shoppers', (3, 3, 3): 'One-Time Buyers',
        (2, 1, 1): 'At-Risk Customers'
    }

    all_segments = list(high_value_segments.keys()) + list(nurture_segments.keys()) + list(risk_segments.keys())
    all_subsegments = list(high_value_segments.values()) + list(nurture_segments.values()) + list(
        risk_segments.values())

    # Check if the lengths of segment and subsegment lists match
    assert len(all_segments) == len(all_subsegments), "Lengths of segment and subsegment lists must match"

    for rfm in rfm_column:
        recency = int(rfm[0])
        frequency = int(rfm[1])
        monetary = int(rfm[2])

        if (recency, frequency, monetary) in all_segments:
            broad_segments.append(
                'High Value' if (recency, frequency, monetary) in high_value_segments.keys()
                else 'Nurture' if (recency, frequency, monetary) in nurture_segments.keys()
                else 'Risk'
            )
            subsegments.append(all_subsegments[all_segments.index((recency, frequency, monetary))])
        else:
            broad_segments.append('Unknown')
            subsegments.append('Unknown')

    return pd.Series(broad_segments, name='Broad Segment'), pd.Series(subsegments, name='Subsegment')


def aggregate_transactions(df):
    transactions = df.groupby(["InvoiceNo", "CustomerID"]).agg({"StockCode": lambda s: list(set(s))})
    return transactions


# # Method to generate products data from transactional dataset
def generate_products_data(df, min_margin=0.02, min_discount=0.02, max_discount=0.50,
                           output_file="products_data.csv"):
    """
    This function randomly assigns profit margins and discounts to products in a DataFrame.

    Args:
        df (pandas.DataFrame): DataFrame containing product data with columns:
            - StockCode (str): Unique product code.
            - UnitPrice (float): Original unit price of the product.
        min_margin (float, optional): Minimum profit margin percentage (default: 0.02).
        min_discount (float, optional): Minimum discount percentage (default: 0.02).
        max_discount (float, optional): Maximum discount percentage (default: 0.50).
        output_file (str, optional): Name of the output CSV file (default: "profit_margins_and_discounts.csv").

    Returns:
        str: Name of the output CSV file.
    """

    data = df[["id", "Description", "StockCode", "UnitPrice"]]
    # Drop duplicates based on the 'StockCode' column
    data = data.drop_duplicates(subset=['StockCode'])

    def generate_profit_margin(unit_price):
        """
        Generates a random profit margin for a given unit price.

        Args:
            unit_price (float): Original unit price of the product.

        Returns:
            float: Randomly generated profit margin.
        """
        # Generate a random percentage for profit margin
        random_margin = np.random.uniform(min_margin, 1.0)  # Ensure profit margin is at least 2%
        # Calculate the profit margin
        profit_margin = unit_price * random_margin
        profit_margin = round(profit_margin, 2)
        return profit_margin

    def calculate_discounted_price(unit_price, profit_margin):
        """
        Calculates a random discount that maintains a minimum profit margin.

        Args:
            unit_price (float): Original unit price of the product.
            profit_margin (float): Current profit margin of the product.

        Returns:
            tuple: Tuple containing the discounted price (float) and discount percentage (float).
        """
        max_discount = 1 - profit_margin / unit_price  # Maximum discount allowed to maintain minimum profit

        # Generate random discount between min_discount and max_discount
        discount = np.random.uniform(min_discount, max_discount)

        # Round the discount to 2 decimal places
        discount = round(discount, 2)

        # Calculate the discounted price
        discounted_price = round(unit_price * (1 - discount), 2)
        return discounted_price, discount

    # Apply profit margin and discount calculation to each row
    data['ProfitMargin'] = data['UnitPrice'].apply(generate_profit_margin)
    data['DiscountedPrice'], data['DiscountPct'] = zip(
        *data.apply(lambda x: calculate_discounted_price(x['UnitPrice'], x['ProfitMargin']), axis=1))

    # Save the DataFrame to a CSV file
    output_path =f"{ROOT_PATH}/{output_file}"
    data.to_csv(output_path, index=False)

    return data


def get_segment_transactions(df, root_path):
    # Filter data based on segments
    high_value_df = df[df['Segment'] == 'High Value']
    risk_df = df[df['Segment'] == 'Risk']
    nurture_df = df[df['Segment'] == 'Nurture']

    # Write each segment to a CSV file
    high_value_path = os.path.join(root_path, 'high_value_transactions.csv')
    risk_path = os.path.join(root_path, 'risk_transactions.csv')
    nurture_path = os.path.join(root_path, 'nurture_transactions.csv')

    high_value_df.to_csv(high_value_path, index=False)
    risk_df.to_csv(risk_path, index=False)
    nurture_df.to_csv(nurture_path, index=False)

    return high_value_path, risk_path, nurture_path


def generate_bundle_info(api_name, segment_names):
    """
    Retrieve information about product bundles for multiple segments.

    Args:
        api_name (str): The root path for the API (also the folder name containing the files).
        segment_names (list): A list of segment names for which to retrieve bundle information.

    Returns:
        dict: A dictionary where keys are segment names and values are DataFrames containing information about
              the product bundles for each segment. Each DataFrame is also saved to a CSV file.
    """
    bundle_info_dict = {}

    for segment_name in segment_names:
        # Read the product bundles CSV file for the current segment
        bundles_filename = os.path.join(api_name, f"{segment_name}_itemsets.csv")
        bundles_df = pd.read_csv(bundles_filename)

        # Get the first 10 bundles
        first_10_bundles = bundles_df['itemset'].head(10)

        # Read the products CSV file
        products_filename = os.path.join(api_name, 'products_data.csv')
        products_df = pd.read_csv(products_filename)

        # Create a dictionary to map stock codes to descriptions
        stock_code_to_description = dict(zip(products_df['StockCode'], products_df['Description']))

        bundle_info = []

        for bundle_str in first_10_bundles:
            # Split the bundle string into individual stock codes and remove extra whitespaces
            bundle_stock_codes = [code.strip().strip("'") for code in bundle_str.strip('{}').split(',')]

            # Initialize variables to store information about the bundle
            bundle_description = []
            actual_price = 0
            discounted_price = 0

            for stock_code in bundle_stock_codes:
                # Find the description for the current stock code
                description = stock_code_to_description.get(stock_code)
                if description:
                    # Find the product information for the current stock code
                    product_info = products_df[products_df['StockCode'] == stock_code]

                    # Get the unit price, discounted price, and discount percentage
                    unit_price = float(product_info.iloc[0]['UnitPrice'])
                    discount_pct = float(product_info.iloc[0]['DiscountPct'])

                    # Calculate the discounted price
                    discounted_price += unit_price * (1 - discount_pct)

                    # Add the description to the bundle description
                    bundle_description.append(description)

                    # Add the unit price to the actual price
                    actual_price += unit_price

            # Format the bundle description as a string
            bundle_description_str = ', '.join(bundle_description)

            # Round the discounted price to 2 decimal places
            discounted_price = round(discounted_price, 2)

            # Generate a random UUID for the bundle ID
            bundle_id = str(uuid)

            # Create a dictionary for the bundle information
            bundle_info.append({
                'id': bundle_id,
                'bundle': bundle_description_str,
                'actual_price': actual_price,
                'discounted_price': discounted_price
            })

        # Convert bundle_info to a DataFrame
        bundle_info_df = pd.DataFrame(bundle_info)

        # Save bundle_info_df to a CSV file
        output_filename = os.path.join(api_name, f"{segment_name}_bundles_info.csv")
        bundle_info_df.to_csv(output_filename, index=False)

        # Add the DataFrame to the dictionary
        bundle_info_dict[segment_name] = bundle_info_df

    return bundle_info_dict


segment_offers = {
    "High Value": ["percent_tiers", "bundled discount", "bogd", "high_value_loyalty_points"],
    "Nurture": ["fixed_amount_tiers", "bundled discount"],
    "Risk": ["bogd", "loyalty_points", "percent_tiers"]
}
