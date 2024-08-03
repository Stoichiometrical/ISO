import json
import logging
import os
import time
from concurrent.futures import ProcessPoolExecutor
from mlxtend.frequent_patterns import fpgrowth, association_rules
import pandas as pd
import shortuuid

from utility_methods import aggregate_transactions


def convert_sets_to_strings(df):
    """
    Ensure sets are converted to strings with single quotes and curly braces in a DataFrame.
    Args:
        df (pd.DataFrame): DataFrame with sets in its columns.
    Returns:
        pd.DataFrame: DataFrame with sets converted to strings.
    """
    df = df.copy()
    for col in df.columns:
        if df[col].apply(lambda x: isinstance(x, set)).any():
            df[col] = df[col].apply(lambda x: str(x) if isinstance(x, set) else x)
    return df


def get_association_info(api_name, segment_names):
    """
    Retrieve association information for multiple segments.

    Args:
        api_name (str): The name of the API (also the folder name containing the files).
        segment_names (list): A list of segment names for which to retrieve association information.

    Returns:
        dict: A dictionary where keys are segment names and values are lists of dictionaries containing information about
            the associations for each segment.
        pd.DataFrame: A DataFrame containing the combined information for all segments.
    """
    association_info_dict = {}
    all_associations = []

    # Path to the products file
    products_file_path = os.path.join(api_name, 'products_data.csv')

    # Read the products CSV file
    products_df = pd.read_csv(products_file_path)

    # Create a dictionary to map stock codes to descriptions and prices
    stock_code_to_info = products_df.set_index('StockCode').to_dict('index')

    for segment_name in segment_names:
        # Read the association CSV file for the current segment
        associations_filename = os.path.join(api_name, f"{segment_name}_associations.csv")
        associations_df = pd.read_csv(associations_filename)

        association_info = []

        for _, row in associations_df.iterrows():
            basket_str = row['basket']
            next_product_str = row['next_product']

            # Parse the basket and next_product strings into lists of stock codes
            basket_stock_codes = [code.strip().strip("'") for code in basket_str.strip('{}').split(',')]
            next_product_stock_codes = [code.strip().strip("'") for code in next_product_str.strip('{}').split(',')]

            # Initialize variables to store information about the basket and next product
            basket_description = []
            next_product_description = []
            actual_price = 0
            next_product_actual_price = 0
            next_product_discounted_price = 0

            for stock_code in basket_stock_codes:
                if stock_code in stock_code_to_info:
                    product_info = stock_code_to_info[stock_code]
                    description = product_info['Description']
                    unit_price = product_info['UnitPrice']

                    basket_description.append(f"{description} (${unit_price})")
                    actual_price += unit_price

            for stock_code in next_product_stock_codes:
                if stock_code in stock_code_to_info:
                    product_info = stock_code_to_info[stock_code]
                    description = product_info['Description']
                    discounted_price_next_product = product_info['DiscountedPrice']

                    next_product_discounted_price += discounted_price_next_product
                    next_product_actual_price += discounted_price_next_product  # Use the discounted price as actual price

                    next_product_description.append(
                        f"{description} [FROM  (${next_product_actual_price}) TO(${discounted_price_next_product})]")

            # Format the basket and next product descriptions as strings
            basket_description_str = ', '.join(basket_description)
            next_product_description_str = ', '.join(next_product_description)

            # Generate a short UUID for the association ID
            association_id = shortuuid.uuid()

            # Create a dictionary for the association information
            association_info.append({
                'id': association_id,
                'bundle': basket_description_str,
                'discount_bundle': next_product_description_str,
                'total_price': actual_price + next_product_actual_price,
                'discounted_price': actual_price + next_product_actual_price - next_product_discounted_price,
                'segment': segment_name
            })

            all_associations.append({
                'id': association_id,
                'bundle': basket_description_str,
                'discount_bundle': next_product_description_str,
                'total_price': actual_price + next_product_actual_price,
                'discounted_price': actual_price + next_product_discounted_price,
                'segment': segment_name
            })

        # Add the association information to the dictionary
        association_info_dict[segment_name] = association_info

    # Convert the list of all associations to a DataFrame
    all_associations_df = pd.DataFrame(all_associations)

    # Save the DataFrame to a CSV file
    output_csv_path = os.path.join(api_name, 'bogd_offers.csv')
    all_associations_df.to_csv(output_csv_path, index=False)

    return all_associations_df





def save_custom_discounts(data):
    """
    Converts a dictionary to a JSON string.

    :param data: The dictionary to be converted.
    :return: JSON string of the data.
    """
    try:
        # Convert the data to a JSON string
        json_data = json.dumps(data, indent=4)
        return json_data
    except Exception as e:
        logging.error(f"An error occurred while converting data to JSON: {e}")
        raise


def get_bundles(df):
    hbasket = aggregate_transactions(df)
    hbasket = hbasket.explode('StockCode')
    hbasket['value'] = 1
    hbasket = hbasket.pivot_table(index='InvoiceNo', columns='StockCode', values='value', fill_value=0)

    freqItemSet = fpgrowth(hbasket, min_support=0.01, use_colnames=True)
    rules = association_rules(freqItemSet, metric="confidence", min_threshold=0.9)

    print('Number of rules generated: ', len(rules))

    associations = rules[['antecedents', 'consequents', 'confidence']].rename(
        columns={'antecedents': 'basket', 'consequents': 'next_product', 'confidence': 'proba'})
    associations['basket'] = associations['basket'].apply(lambda x: set(x))
    associations['next_product'] = associations['next_product'].apply(lambda x: set(x))
    associations = associations.sort_values(by='proba', ascending=False)

    itemsets = freqItemSet[freqItemSet['itemsets'].apply(lambda x: len(x) > 2)].sort_values(by='support',
                                                                                            ascending=False)
    itemsets['itemset'] = itemsets['itemsets'].apply(lambda x: set(x))
    itemsets = itemsets[['itemset', 'support']]

    return associations, itemsets


def process_bundle(bundle_name, bundle_df):
    associations, itemsets = get_bundles(bundle_df.copy())
    print(f"Bundle '{bundle_name}' associations and itemsets processed.")
    return bundle_name, (associations, itemsets)


def get_bundlesets(high_bundle, risk_bundle, nurture_bundle):
    """
    This function takes three DataFrames (high_bundle, risk_bundle, nurture_bundle)
    and generates association rules and frequent itemsets for each.

    Args:
        high_bundle (pandas.DataFrame): DataFrame containing high-potential customer data.
        risk_bundle (pandas.DataFrame): DataFrame containing risk customer data.
        nurture_bundle (pandas.DataFrame): DataFrame containing nurture customer data.

    Returns:
        dict: A dictionary with bundle names as keys and a tuple of (associations, itemsets) DataFrames as values.
    """

    start_time = time.time()
    bundle_data = {"high_value": high_bundle, "risk": risk_bundle, "nurture": nurture_bundle}
    results = {}

    with ProcessPoolExecutor() as executor:
        futures = []
        for bundle_name, bundle_df in bundle_data.items():
            if len(bundle_df) > 5000:
                futures.append(executor.submit(process_bundle, bundle_name, bundle_df))
            else:
                results[bundle_name] = get_bundles(bundle_df.copy())

        for future in futures:
            bundle_name, (associations, itemsets) = future.result()
            results[bundle_name] = (associations, itemsets)

    end_time = time.time()
    execution_time = end_time - start_time
    print(f"Total execution time: {execution_time:.2f} seconds")
    print(results)

    return results


segment_names = ['high_value', 'nurture', 'risk']


def create_bogd_offers(associations_dict, products_df, segment_names):
    """
    Retrieve association information for multiple segments.

    Args:
        associations_dict (dict): A dictionary where keys are segment names and values are DataFrames containing associations.
        products_df (pd.DataFrame): DataFrame containing product information.
        segment_names (list): A list of segment names for which to retrieve association information.

    Returns:
        pd.DataFrame: A DataFrame containing the combined information for all segments.
    """
    association_info_dict = {}
    all_associations = []

    # Create a dictionary to map stock codes to descriptions and prices
    stock_code_to_info = products_df.set_index('StockCode').to_dict('index')

    for segment_name in segment_names:
        # Get the associations DataFrame for the current segment
        associations_df = associations_dict[segment_name]

        association_info = []

        for _, row in associations_df.iterrows():
            basket_str = row['basket']
            next_product_str = row['next_product']

            # Parse the basket and next_product strings into lists of stock codes
            basket_stock_codes = [code.strip().strip("'") for code in basket_str.strip('{}').split(',')]
            next_product_stock_codes = [code.strip().strip("'") for code in next_product_str.strip('{}').split(',')]

            # Initialize variables to store information about the basket and next product
            basket_description = []
            next_product_description = []
            actual_price = 0
            next_product_actual_price = 0
            next_product_discounted_price = 0

            for stock_code in basket_stock_codes:
                if stock_code in stock_code_to_info:
                    product_info = stock_code_to_info[stock_code]
                    description = product_info['Description']
                    unit_price = product_info['UnitPrice']

                    basket_description.append(f"{description} (${unit_price})")
                    actual_price += unit_price

            for stock_code in next_product_stock_codes:
                if stock_code in stock_code_to_info:
                    product_info = stock_code_to_info[stock_code]
                    description = product_info['Description']
                    discounted_price_next_product = product_info['DiscountedPrice']

                    next_product_discounted_price += discounted_price_next_product
                    next_product_actual_price += discounted_price_next_product  # Use the discounted price as actual price

                    next_product_description.append(
                        f"{description} [FROM  (${next_product_actual_price}) TO(${discounted_price_next_product})]")

            # Format the basket and next product descriptions as strings
            basket_description_str = ', '.join(basket_description)
            next_product_description_str = ', '.join(next_product_description)

            # Generate a short UUID for the association ID
            association_id = shortuuid.uuid()

            # Create a dictionary for the association information
            association_info.append({
                'id': association_id,
                'bundle': basket_description_str,
                'discount_bundle': next_product_description_str,
                'total_price': actual_price + next_product_actual_price,
                'discounted_price': actual_price + next_product_actual_price - next_product_discounted_price,
                'segment': segment_name
            })

            all_associations.append({
                'id': association_id,
                'bundle': basket_description_str,
                'discount_bundle': next_product_description_str,
                'total_price': actual_price + next_product_actual_price,
                'discounted_price': actual_price + next_product_discounted_price,
                'segment': segment_name
            })

        # Add the association information to the dictionary
        association_info_dict[segment_name] = association_info

    # Convert the list of all associations to a DataFrame
    all_associations_df = pd.DataFrame(all_associations)

    return all_associations_df
