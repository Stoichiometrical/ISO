import json
import os

def load_custom_discounts(root_path):
    """
    Load custom discounts from a JSON file.

    Args:
        api_name (str): The name of the API, which corresponds to the directory containing the JSON file.

    Returns:
        dict: The JSON data loaded as a dictionary.
    """

    file_path = os.path.join(root_path, 'custom_discounts.json')
    with open(file_path, 'r') as file:
        return json.load(file)


def calculate_percentage_discounted_price(total_price, api_name):
    """
    Calculate the total price after applying a percentage discount.

    Args:
        total_price (float): The original total price before discount.
        api_name (str): The name of the API, which corresponds to the directory containing the JSON file.

    Returns:
        float: The total price after applying the percentage discount.
    """
    discounts = load_custom_discounts(api_name)
    percent_tiers = discounts.get('percent_tiers', [])

    applicable_discount = 0
    for tier in percent_tiers:
        if total_price >= tier['threshold']:
            applicable_discount = tier['discount']
        else:
            break

    discount_amount = total_price * (applicable_discount / 100)
    discounted_price = total_price - discount_amount
    return discounted_price


def calculate_fixed_amount_discounted_price(total_price, api_name):
    """
    Calculate the total price after applying a fixed amount discount.

    Args:
        total_price (float): The original total price before discount.
        api_name (str): The name of the API, which corresponds to the directory containing the JSON file.

    Returns:
        float: The total price after applying the fixed amount discount.
    """
    discounts = load_custom_discounts(api_name)
    fixed_amount_tiers = discounts.get('fixed_amount_tiers', [])

    applicable_discount = 0
    for tier in fixed_amount_tiers:
        if total_price >= tier['threshold']:
            applicable_discount = tier['discount']
        else:
            break

    discounted_price = total_price - applicable_discount
    return discounted_price


def apply_discount_tier(total_price, api_name):
    """
    Apply the relevant discount based on the available discount tiers.

    Args:
        total_price (float): The original total price before discount.
        api_name (str): The name of the API, which corresponds to the directory containing the JSON file.

    Returns:
        float: The total price after applying the relevant discount.
    """
    discounts = load_custom_discounts(api_name)

    # Check for the presence of discount tiers
    if 'percent_tiers' in discounts and discounts['percent_tiers']:
        return calculate_percentage_discounted_price(total_price, api_name)
    elif 'fixed_amount_tiers' in discounts and discounts['fixed_amount_tiers']:
        return calculate_fixed_amount_discounted_price(total_price, api_name)
    else:
        # No discount tiers available, return the original price
        return total_price


def calculate_next_tier_difference(total_price, api_name):
    """
    Calculate the amount needed to reach the next discount tier.

    Args:
        total_price (float): The original total price before discount.
        api_name (str): The name of the API, which corresponds to the directory containing the JSON file.

    Returns:
        tuple: A tuple containing the amount needed to reach the next tier and the description of the next tier.
    """
    discounts = load_custom_discounts(api_name)

    if 'percent_tiers' in discounts and discounts['percent_tiers']:
        tiers = discounts['percent_tiers']
        discount_type = 'percent'
    elif 'fixed_amount_tiers' in discounts and discounts['fixed_amount_tiers']:
        tiers = discounts['fixed_amount_tiers']
        discount_type = 'fixed'
    else:
        return 0, "No further discounts available"

    for i in range(len(tiers)):
        if total_price < tiers[i]['threshold']:
            next_tier = tiers[i]
            amount_needed = next_tier['threshold'] - total_price
            if discount_type == 'percent':
                return amount_needed, f"{next_tier['discount']}% discount"
            else:
                return amount_needed, f"${next_tier['discount']} discount"

    return 0, "No further discounts available"


def calculate_loyalty_points(total_price, points_per_dollar):
    """
    Calculate the loyalty points earned based on the total price and points per dollar.

    Args:
        total_price (float): The total price of the purchase.
        points_per_dollar (int): The number of loyalty points earned per dollar spent.

    Returns:
        int: The total loyalty points earned.
    """
    return int(total_price * points_per_dollar)






