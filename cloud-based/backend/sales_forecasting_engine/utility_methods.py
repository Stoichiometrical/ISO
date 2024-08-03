import calendar
import holidays
import numpy as np
from matplotlib import pyplot as plt
from sqlalchemy import create_engine

ROOT_PATH = "../s3"

from sklearn.metrics import mean_absolute_percentage_error
import pandas as pd
from prophet import Prophet
from prophet.diagnostics import cross_validation, performance_metrics
from prophet.plot import plot_cross_validation_metric

API_1 = "http://127.0.0.1:5000"  #segmentation
API_2 = "http://127.0.0.1:5001"  #prescriptive
API_3 = "http://127.0.0.1:5002"  #predictive


def preprocess_sales_data(data):
    # Step 1: Isolate Date and Quantity Columns
    df = data[['Date', 'Quantity']]

    # Step 2: Convert Date Column to Datetime Format
    df['InvoiceDate'] = pd.to_datetime(df['Date'])

    # Step 3: Group by Date and Aggregate Sum
    daily_sales = df.groupby(pd.Grouper(key='InvoiceDate', freq='D'))['Quantity'].sum().reset_index()

    # Step 4: Find Missing Dates and Forward Fill Quantities
    idx = pd.date_range(start=daily_sales['InvoiceDate'].min(), end=daily_sales['InvoiceDate'].max(), freq='D')
    daily_sales = daily_sales.set_index('InvoiceDate').reindex(idx).fillna(method='ffill').reset_index()

    # Forward fill 0 values in Quantity column
    daily_sales['Quantity'] = daily_sales['Quantity'].replace(0, np.nan).ffill().astype(int)

    # Step 5: Custom Winsorization
    # Calculate the 90th percentile
    quantile_90 = np.percentile(daily_sales['Quantity'], 90)

    # Calculate the number of rows
    total_count = len(daily_sales)

    # Count values above the 90th percentile
    values_above_90 = daily_sales[daily_sales['Quantity'] > quantile_90]['Quantity']
    count_above_90 = values_above_90.count()

    # If count is less than 5% of the total dataset, set all values above 90th percentile to quantile_90
    if count_above_90 < 0.05 * total_count:
        daily_sales.loc[daily_sales['Quantity'] > quantile_90, 'Quantity'] = quantile_90
    daily_sales.rename(columns={"index": "ds", "Quantity": "y"}, inplace=True)

    return daily_sales


def train_model(data):
    # Add is_public_holiday column
    holiday = holidays.CountryHoliday('UK')
    data['is_public_holiday'] = data['ds'].apply(
        lambda date: 1 if date in holiday else 0
    )

    # Create and Fit Prophet Model with Best Parameters
    best_params = {
        'changepoint_prior_scale': 0.005,
        'seasonality_mode': 'additive',
        'seasonality_prior_scale': 0.1,
        'holidays_prior_scale': 0.1,
        'n_changepoints': 25
    }

    model = Prophet(**best_params)
    model.add_regressor('is_public_holiday')
    model.fit(data)  # Fit on the entire historical period

    # Forecast Future Values for 60 Days Beyond Historical Period
    future = model.make_future_dataframe(periods=60)  # Extend 60 days beyond the entire historical period
    future['is_public_holiday'] = future['ds'].apply(
        lambda date: 1 if date in holiday else 0
    )

    forecast = model.predict(future)
    forecasted = forecast[["ds", "yhat"]].tail(60)
    forecasted.rename(columns={"ds": "InvoiceDate", "yhat": "Quantity"}, inplace=True)

    # Convert forecasted 'Quantity' values to integers
    forecasted['Quantity'] = forecasted['Quantity'].astype(int)

    # Evaluate the forecast
    df_cv = cross_validation(model, initial='547 days', period='180 days', horizon='60 days')
    df_p = performance_metrics(df_cv)

    fig = plot_cross_validation_metric(df_cv, metric='rmse')

    # Calculate MAPE using yhat and y
    mape = mean_absolute_percentage_error(df_cv['y'], df_cv['yhat'])
    mape = round(mape, 2)
    print(f"MAPE: {mape}")

    # Divide forecasted data by month
    forecasted['Month'] = forecasted['InvoiceDate'].dt.strftime('%B')
    months = forecasted['Month'].unique()
    month_names = list(months)

    return model, future, forecast, mape, forecasted, month_names


def plot_graph(data, future, forecast):
    plt.figure(figsize=(10, 6))
    plt.plot(data['ds'], data['y'], label='Actual')
    plt.plot(future['ds'], forecast['yhat'], label='Predicted')
    plt.xlabel('Date')
    plt.ylabel('Quantity Winsorized')
    plt.legend()
    plt.title('Actual vs Predicted Values')
    plt.show()


#Get data from mysql
def retrieve_and_save_data(api_name, table_name, db_user, db_password, db_host, db_name):
    # Create the connection string
    connection_string = f"mysql+mysqlconnector://{db_user}:{db_password}@{db_host}/{db_name}"

    # Create the SQLAlchemy engine
    engine = create_engine(connection_string)

    # Define the query to select all data from the specified table
    query = f"SELECT * FROM {table_name}"

    try:
        # Load the data into a DataFrame
        df = pd.read_sql(query, engine)
        print("Data loaded successfully")

        # Save the data to a CSV file
        csv_file_path = f"{api_name}/{table_name}_data.csv"
        df.to_csv(csv_file_path, index=False)
        print("Data saved to CSV file")

        return {"message": "Data retrieved and saved successfully", "file_path": csv_file_path}
    except Exception as e:
        return {"error": f"Error loading data: {e}"}


#Get month number
def month_name_to_number(month_name):
    try:
        month_number = list(calendar.month_name).index(month_name)
        if month_number == 0:
            raise ValueError
        return month_number
    except ValueError:
        return None


# Calculate proximity for days close to each other
def proximity_calculator(days):
    """Groups closely spaced dates into promotional periods.

    Args:
        days (list): A list of 'Timestamp' objects.

    Returns:
        list: A list of lists, where each sub-list represents a promotional period (containing 'Timestamp' objects).
    """
    # Sort the list of days
    days.sort()

    # List to store the resulting periods
    periods = []

    # Iterate through the sorted days
    i = 0
    while i < len(days):
        # Initialize the start and end dates for the current period
        start_date = days[i]
        end_date = days[i]

        # Find the end date of the current period
        while i + 1 < len(days) and (days[i + 1] - end_date).days <= 3:
            end_date = days[i + 1]
            i += 1

        # Add the current period to the list of periods
        periods.append(pd.date_range(start=start_date, end=end_date, freq='D').tolist())

        # Move to the next date
        i += 1

    return periods


def find_promo_days(sales_data, peak_threshold=0.9, lull_threshold=0.5, num_promos=3, proximity_days=3):
    """Identifies peak and lull promotional periods based on percentage thresholds of average sales volume,
    considering proximity to group close dates into extended periods.

    Args:
        sales_data (pd.DataFrame): DataFrame containing 'Date' and 'Sales Volume' columns.
        peak_threshold (float, optional): Multiplier for avg. sales volume to define a peak. Defaults to 1.2 (20% above average).
        lull_threshold (float, optional): Multiplier for avg. sales volume to define a lull. Defaults to 0.5 (50% below average).
        num_promos (int, optional): The maximum number of promotions per month (ignored in this implementation). Defaults to 3.
        proximity_days (int, optional): The maximum number of days between dates to consider them part of the same promotional period. Defaults to 3.

    Returns:
        pd.DataFrame: DataFrame containing 'Date' and 'Promotion Type' columns for peak and lull dates.
    """

    if not isinstance(sales_data, pd.DataFrame):
        raise TypeError("sales_data must be a pandas DataFrame")

        # Ensure 'Quantity' is numeric before calculating average
    sales_data['Quantity'] = pd.to_numeric(sales_data['Quantity'], errors='coerce')
    sales_data["InvoiceDate"] = pd.to_datetime(sales_data["InvoiceDate"])

    # Calculate average sales volume
    avg_sales = sales_data['Quantity'].mean()
    print("Average sales :", avg_sales)

    # Apply thresholds to identify days within peak or lull zones
    peak_condition = sales_data['Quantity'] >= avg_sales * peak_threshold
    lull_condition = sales_data['Quantity'] <= avg_sales * lull_threshold

    # Get top peaks and lulls based on the conditions
    peak_days = sales_data[peak_condition].nlargest(num_promos, 'Quantity')['InvoiceDate'].tolist()
    lull_days = sales_data[lull_condition].nsmallest(num_promos, 'Quantity')['InvoiceDate'].tolist()

    # Group peak and lull days into promotional periods based on proximity using proximity_calculator
    peak_periods = proximity_calculator(peak_days)
    print("Peak Days: ", peak_periods)

    lull_periods = proximity_calculator(lull_days)

    # Create DataFrames for peak and lull periods
    peak_df = pd.DataFrame({'Date': [day for period in peak_periods for day in period],
                            'Promotion Type': 'Peak'})
    lull_df = pd.DataFrame({'Date': [day for period in lull_periods for day in period],
                            'Promotion Type': 'Lull'})

    # Concatenate peak and lull DataFrames
    promo_df = pd.concat([peak_df, lull_df], ignore_index=True)
    print(promo_df.head())
    print("Finished Promo")

    return promo_df


def create_forecast_details(forecast_data, promo_data):
    """
    Combines forecast data and promotion data, and returns the combined data.

    Args:
        forecast_data (pd.DataFrame): DataFrame containing the forecast data.
        promo_data (pd.DataFrame): DataFrame containing the promotion data.

    Returns:
        list: A list of dictionaries containing the combined data.
    """
    # Ensure the date columns are in the same format and as strings
    forecast_data['date'] = pd.to_datetime(forecast_data['InvoiceDate']).dt.strftime('%Y-%m-%d')
    promo_data['Date'] = pd.to_datetime(promo_data['Date']).dt.strftime('%Y-%m-%d')

    forecast_data_list = forecast_data.to_dict(orient='records')
    promotions = promo_data.set_index('Date')['Promotion Type'].to_dict()

    # Update forecast data with promotion types
    for entry in forecast_data_list:
        entry['promotion_type'] = promotions.get(entry['date'], None)
        entry['sales_quantity'] = entry.pop('Quantity')
        entry['date'] = entry['date']  # Ensure 'date' is a string
        entry['InvoiceDate'] = entry['InvoiceDate'].strftime('%Y-%m-%d')  # Convert 'InvoiceDate' to string

    return forecast_data_list
