# import csv
# import json
# import os
# import io
# import pandas as pd
# import requests
# import shortuuid
# import logging
# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import boto3
#
# from utility_methods import retrieve_and_save_data, month_name_to_number, find_promo_days, preprocess_sales_data, train_model, create_forecast_details
#
# app = Flask(__name__)
# CORS(app, resources={r"/*": {"origins": "*"}})
#
# # Configure logging
# logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s:%(message)s')
#
# # AWS S3 Configuration
# AWS_BUCKET_NAME = 'iso-datalake'
#
# s3_client = boto3.client('s3')
#
# def upload_to_s3(file_obj, bucket_name, object_name):
#     """Upload a file-like object to an S3 bucket"""
#     try:
#         logging.info(f"Uploading file {object_name} to bucket {bucket_name}")
#         s3_client.upload_fileobj(file_obj, bucket_name, object_name)
#         logging.info(f"File {object_name} uploaded to bucket {bucket_name}")
#     except Exception as e:
#         logging.error(f"Failed to upload to S3: {e}")
#         raise
#
# def read_csv_from_s3(bucket_name, object_name):
#     """Read a CSV file from S3 into a pandas DataFrame"""
#     try:
#         logging.info(f"Reading CSV file {object_name} from bucket {bucket_name}")
#         response = s3_client.get_object(Bucket=bucket_name, Key=object_name)
#         logging.info(f"File {object_name} read from bucket {bucket_name}")
#         return pd.read_csv(io.BytesIO(response['Body'].read()))
#     except Exception as e:
#         logging.error(f"Failed to read CSV from S3: {e}")
#         raise
#
# def read_json_from_s3(bucket_name, object_name):
#     """Read a JSON file from S3"""
#     try:
#         logging.info(f"Reading JSON file {object_name} from bucket {bucket_name}")
#         response = s3_client.get_object(Bucket=bucket_name, Key=object_name)
#         logging.info(f"File {object_name} read from bucket {bucket_name}")
#         return json.loads(response['Body'].read().decode('utf-8'))
#     except Exception as e:
#         logging.error(f"Failed to read JSON from S3: {e}")
#         raise
#
# def read_md_from_s3(bucket_name, object_name):
#     """Read a markdown file from S3"""
#     try:
#         logging.info(f"Reading markdown file {object_name} from bucket {bucket_name}")
#         response = s3_client.get_object(Bucket=bucket_name, Key=object_name)
#         logging.info(f"File {object_name} read from bucket {bucket_name}")
#         return response['Body'].read().decode('utf-8')
#     except Exception as e:
#         logging.error(f"Failed to read markdown from S3: {e}")
#         raise
#
# @app.route('/get_sales_data', methods=['GET'])
# def get_sales_data():
#     # Get parameters from request
#     api_name = request.args.get('api_name')
#     table_name = request.args.get('table_name')
#     db_user = request.args.get('db_user')
#     db_password = request.args.get('db_password')
#     db_host = request.args.get('db_host')
#     db_name = request.args.get('db_name')
#
#     logging.info(f"Received request to get sales data for API: {api_name}")
#
#     # Call the function to retrieve and save data
#     result = retrieve_and_save_data(api_name, table_name, db_user, db_password, db_host, db_name)
#
#     if 'error' in result:
#         logging.error(f"Error retrieving and saving data: {result['error']}")
#         return jsonify(result), 500
#     else:
#         logging.info(f"Successfully retrieved and saved data for API: {api_name}")
#         return jsonify(result)
#
# # @app.route('/create_project', methods=['POST'])
# # def start_test():
# #     try:
# #         projectName = request.form['projectName']
# #         sales_file = request.files['salesFile']
# #         customer_file = request.files['customerFile']
# #         date_column = request.form['dateColumn']
# #         quantity_column = request.form['quantityColumn']
# #         price_column = request.form['priceColumn']
# #
# #         logging.info(f"Creating project: {projectName}")
# #
# #         # Generate a unique ID and create a new folder
# #         unique_id = shortuuid.uuid()
# #         folder_name = f"{projectName}_{unique_id}"
# #         full_folder_path = folder_name + "/"
# #
# #         # Save the uploaded customer file to S3
# #         customer_buffer = io.BytesIO(customer_file.read())
# #         customer_file_path = os.path.join(full_folder_path, 'customer_data.csv').replace("\\", "/")
# #         upload_to_s3(customer_buffer, AWS_BUCKET_NAME, customer_file_path)
# #
# #         # Process and save the sales file with conventional column names
# #         sales_df = pd.read_csv(sales_file)
# #         sales_df.rename(columns={
# #             date_column: 'Date',
# #             quantity_column: 'Quantity',
# #             price_column: 'UnitPrice'
# #         }, inplace=True)
# #         sales_buffer = io.StringIO()
# #         sales_df.to_csv(sales_buffer, index=False)
# #         sales_file_path = os.path.join(full_folder_path, 'sales_data.csv').replace("\\", "/")
# #         upload_to_s3(io.BytesIO(sales_buffer.getvalue().encode()), AWS_BUCKET_NAME, sales_file_path)
# #
# #         # Verify if the renamed columns exist
# #         if 'Date' not in sales_df.columns or 'Quantity' not in sales_df.columns or 'UnitPrice' not in sales_df.columns:
# #             logging.error("Column renaming failed. Please check the column names.")
# #             raise Exception("Column renaming failed. Please check the column names.")
# #
# #         # Call train_model and get month_names
# #         sales = preprocess_sales_data(sales_df)
# #         model, future, forecast, mape, forecasted, month_names = train_model(sales)
# #         logging.info(f"Month names: {month_names}")
# #
# #         # Save forecasted data to CSV in S3
# #         forecast_buffer = io.StringIO()
# #         forecasted.to_csv(forecast_buffer, index=False)
# #         upload_to_s3(io.BytesIO(forecast_buffer.getvalue().encode()), AWS_BUCKET_NAME, os.path.join(full_folder_path, "forecast_model_results.csv").replace("\\", "/"))
# #
# #         # Save monthly forecast data to CSV in S3
# #         for month in month_names:
# #             monthly_data = forecasted[forecasted['Month'] == month]
# #             monthly_buffer = io.StringIO()
# #             monthly_data.to_csv(monthly_buffer, index=False)
# #             upload_to_s3(io.BytesIO(monthly_buffer.getvalue().encode()), AWS_BUCKET_NAME, os.path.join(full_folder_path, f"{month}.csv").replace("\\", "/"))
# #
# #         # Call the secondary service to generate customer segments
# #         logging.info("Calling secondary service to generate customer segments")
# #         response = requests.post('http://localhost:5000/initiate-segments', data={
# #             'sales_file_path': sales_file_path,
# #             'folder_name': folder_name,
# #             'customer_file_path': customer_file_path
# #         })
# #
# #         # Check if the response is not OK
# #         if response.status_code != 200:
# #             logging.error(f'Secondary service failed with status code {response.status_code}: {response.text}')
# #             raise Exception(f'Secondary service failed with status code {response.status_code}: {response.text}')
# #
# #         logging.info(f"Files uploaded and processed successfully for project: {projectName}")
# #         # Return folder name and project ID
# #         return jsonify(
# #             {'message': 'Files uploaded and processed successfully.', 'folder': folder_name, 'months': month_names})
# #
# #     except Exception as e:
# #         # Rollback and log error
# #         logging.error(f"Exception in start_test: {e}")
# #         return jsonify({'error': str(e)}), 500
# #
# # @app.route('/create_report', methods=['POST'])
# # def create_report():
# #     try:
# #         reportName = request.form['reportName']
# #         projectName = request.form['projectName']
# #
# #         logging.info(f"Creating report: {reportName} for project: {projectName}")
# #
# #         # Generate a unique ID and create a new folder within the project folder
# #         unique_id = shortuuid.uuid()
# #         folder_name = f"{reportName}_{unique_id}"
# #         project_path = projectName
# #         full_folder_path = os.path.join(project_path, folder_name).replace("\\", "/")
# #
# #         # Process and save the sales file with conventional column names
# #         forecast_path = os.path.join(project_path, f'{reportName}.csv').replace("\\", "/")
# #         forecast_df = read_csv_from_s3(AWS_BUCKET_NAME, forecast_path)
# #
# #         # Find and save promo days
# #         promo_days_df = find_promo_days(forecast_df)
# #         promo_buffer = io.StringIO()
# #         promo_days_df.to_csv(promo_buffer, index=False)
# #         promo_days_path = os.path.join(full_folder_path, 'promo_days.csv').replace("\\", "/")
# #         upload_to_s3(io.BytesIO(promo_buffer.getvalue().encode()), AWS_BUCKET_NAME, promo_days_path)
# #
# #         # Create forecast details
# #         forecast_details = create_forecast_details(forecast_df, promo_days_df)
# #         json_buffer = io.StringIO(json.dumps(forecast_details, indent=4))
# #         json_file_path = os.path.join(full_folder_path, "forecast_details.json").replace("\\", "/")
# #         upload_to_s3(io.BytesIO(json_buffer.getvalue().encode()), AWS_BUCKET_NAME, json_file_path)
# #
# #         # Call the generate-analysis endpoint
# #         logging.info("Calling generate-analysis endpoint")
# #         response = requests.get(
# #             f'http://localhost:5001/generate-analysis?api_name={folder_name}&project_name={projectName}')
# #
# #         if response.status_code != 200:
# #             logging.error(f'Generate analysis service failed with status code {response.status_code}: {response.text}')
# #             raise Exception(f'Generate analysis service failed with status code {response.status_code}: {response.text}')
# #
# #         logging.info(f"Report created and files uploaded successfully for report: {reportName}")
# #         # Return folder name and project ID
# #         return jsonify({'message': 'Files uploaded and processed successfully.', 'folder': folder_name})
# #
# #     except Exception as e:
# #         # Rollback and log error
# #         logging.error(f"Exception in create_report: {e}")
# #         return jsonify({'error': str(e)}), 500
#
#
# from concurrent.futures import ThreadPoolExecutor
# import threading
#
# @app.route('/create_project', methods=['POST'])
# def start_test():
#     try:
#         projectName = request.form['projectName']
#         sales_file = request.files['salesFile']
#         customer_file = request.files['customerFile']
#         date_column = request.form['dateColumn']
#         quantity_column = request.form['quantityColumn']
#         price_column = request.form['priceColumn']
#
#         logging.info(f"Creating project: {projectName}")
#
#         # Generate a unique ID and create a new folder
#         unique_id = shortuuid.uuid()
#         folder_name = f"{projectName}_{unique_id}"
#         full_folder_path = folder_name + "/"
#
#         def upload_customer_file():
#             customer_buffer = io.BytesIO(customer_file.read())
#             customer_file_path = os.path.join(full_folder_path, 'customer_data.csv').replace("\\", "/")
#             upload_to_s3(customer_buffer, AWS_BUCKET_NAME, customer_file_path)
#             return customer_file_path
#
#         def process_and_upload_sales_file():
#             sales_df = pd.read_csv(sales_file)
#             sales_df.rename(columns={
#                 date_column: 'Date',
#                 quantity_column: 'Quantity',
#                 price_column: 'UnitPrice'
#             }, inplace=True)
#             sales_buffer = io.StringIO()
#             sales_df.to_csv(sales_buffer, index=False)
#             sales_file_path = os.path.join(full_folder_path, 'sales_data.csv').replace("\\", "/")
#             upload_to_s3(io.BytesIO(sales_buffer.getvalue().encode()), AWS_BUCKET_NAME, sales_file_path)
#             return sales_df, sales_file_path
#
#         with ThreadPoolExecutor(max_workers=2) as executor:
#             customer_file_path_future = executor.submit(upload_customer_file)
#             sales_file_future = executor.submit(process_and_upload_sales_file)
#             customer_file_path = customer_file_path_future.result()
#             sales_df, sales_file_path = sales_file_future.result()
#
#         # Verify if the renamed columns exist
#         if 'Date' not in sales_df.columns or 'Quantity' not in sales_df.columns or 'UnitPrice' not in sales_df.columns:
#             logging.error("Column renaming failed. Please check the column names.")
#             raise Exception("Column renaming failed. Please check the column names.")
#
#         # Call train_model and get month_names
#         sales = preprocess_sales_data(sales_df)
#         model, future, forecast, mape, forecasted, month_names = train_model(sales)
#         logging.info(f"Month names: {month_names}")
#
#         # Save forecasted data to CSV in S3
#         forecast_buffer = io.StringIO()
#         forecasted.to_csv(forecast_buffer, index=False)
#         upload_to_s3(io.BytesIO(forecast_buffer.getvalue().encode()), AWS_BUCKET_NAME, os.path.join(full_folder_path, "forecast_model_results.csv").replace("\\", "/"))
#
#         def upload_monthly_data():
#             for month in month_names:
#                 monthly_data = forecasted[forecasted['Month'] == month]
#                 monthly_buffer = io.StringIO()
#                 monthly_data.to_csv(monthly_buffer, index=False)
#                 upload_to_s3(io.BytesIO(monthly_buffer.getvalue().encode()), AWS_BUCKET_NAME, os.path.join(full_folder_path, f"{month}.csv").replace("\\", "/"))
#
#         monthly_thread = threading.Thread(target=upload_monthly_data)
#         monthly_thread.start()
#
#         # Call the secondary service to generate customer segments
#         logging.info("Calling secondary service to generate customer segments")
#         response = requests.post('http://localhost:5000/initiate-segments', data={
#             'sales_file_path': sales_file_path,
#             'folder_name': folder_name,
#             'customer_file_path': customer_file_path
#         })
#
#         # Check if the response is not OK
#         if response.status_code != 200:
#             logging.error(f'Secondary service failed with status code {response.status_code}: {response.text}')
#             raise Exception(f'Secondary service failed with status code {response.status_code}: {response.text}')
#
#         monthly_thread.join()
#         logging.info(f"Files uploaded and processed successfully for project: {projectName}")
#         return jsonify(
#             {'message': 'Files uploaded and processed successfully.', 'folder': folder_name, 'months': month_names})
#
#     except Exception as e:
#         logging.error(f"Exception in start_test: {e}")
#         # Delete the project folder from S3 if creation fails
#         try:
#             s3_client.delete_object(Bucket=AWS_BUCKET_NAME, Key=full_folder_path)
#             logging.info(f"Deleted project folder {full_folder_path} from S3 due to failure")
#         except Exception as del_err:
#             logging.error(f"Failed to delete project folder {full_folder_path} from S3: {del_err}")
#         return jsonify({'error': str(e)}), 500
#
# @app.route('/create_report', methods=['POST'])
# def create_report():
#     try:
#         reportName = request.form['reportName']
#         projectName = request.form['projectName']
#
#         logging.info(f"Creating report: {reportName} for project: {projectName}")
#
#         # Generate a unique ID and create a new folder within the project folder
#         unique_id = shortuuid.uuid()
#         folder_name = f"{reportName}_{unique_id}"
#         project_path = projectName
#         full_folder_path = os.path.join(project_path, folder_name).replace("\\", "/")
#
#         # Process and save the sales file with conventional column names
#         forecast_path = os.path.join(project_path, f'{reportName}.csv').replace("\\", "/")
#         forecast_df = read_csv_from_s3(AWS_BUCKET_NAME, forecast_path)
#
#         # Find and save promo days
#         promo_days_df = find_promo_days(forecast_df)
#         promo_buffer = io.StringIO()
#         promo_days_df.to_csv(promo_buffer, index=False)
#         promo_days_path = os.path.join(full_folder_path, 'promo_days.csv').replace("\\", "/")
#         upload_to_s3(io.BytesIO(promo_buffer.getvalue().encode()), AWS_BUCKET_NAME, promo_days_path)
#
#         # Create forecast details
#         forecast_details = create_forecast_details(forecast_df, promo_days_df)
#         json_buffer = io.StringIO(json.dumps(forecast_details, indent=4))
#         json_file_path = os.path.join(full_folder_path, "forecast_details.json").replace("\\", "/")
#         upload_to_s3(io.BytesIO(json_buffer.getvalue().encode()), AWS_BUCKET_NAME, json_file_path)
#
#         # Call the generate-analysis endpoint
#         logging.info("Calling generate-analysis endpoint")
#         response = requests.get(
#             f'http://localhost:5001/generate-analysis?api_name={folder_name}&project_name={projectName}')
#
#         if response.status_code != 200:
#             logging.error(f'Generate analysis service failed with status code {response.status_code}: {response.text}')
#             raise Exception(f'Generate analysis service failed with status code {response.status_code}: {response.text}')
#
#         logging.info(f"Report created and files uploaded successfully for report: {reportName}")
#         return jsonify({'message': 'Files uploaded and processed successfully.', 'folder': folder_name})
#
#     except Exception as e:
#         logging.error(f"Exception in create_report: {e}")
#         # Delete the report folder from S3 if creation fails
#         try:
#             s3_client.delete_object(Bucket=AWS_BUCKET_NAME, Key=full_folder_path)
#             logging.info(f"Deleted report folder {full_folder_path} from S3 due to failure")
#         except Exception as del_err:
#             logging.error(f"Failed to delete report folder {full_folder_path} from S3: {del_err}")
#         return jsonify({'error': str(e)}), 500
#
#
#
#
#
# @app.route('/<api_name>/get_forecast', methods=['GET'])
# def get_forecast(api_name):
#     try:
#         project_name = request.args.get('project_name')
#         project_path = project_name
#         month = api_name.split("_")[0]
#
#         # Construct the file path for the forecast data CSV
#         forecast_path = os.path.join(project_path, f'{month}.csv').replace("\\", "/")
#         logging.info(f"Fetching forecast from {forecast_path}")
#
#         # Read the CSV file from S3
#         forecast_df = read_csv_from_s3(AWS_BUCKET_NAME, forecast_path)
#
#         # Convert the DataFrame to JSON
#         forecast_json = forecast_df.to_dict(orient='records')
#
#         # Return the JSON response
#         return jsonify(forecast_json), 200
#
#     except Exception as e:
#         logging.error(f"Error in get_forecast: {e}")
#         return jsonify({"message": "An error occurred", "error": str(e)}), 500
#
# @app.route('/<api_name>/get_promo_days', methods=['GET'])
# def get_promo_days(api_name):
#     try:
#         project_name = request.args.get('project_name')
#         project_path = project_name
#         full_folder_path = os.path.join(project_path, api_name).replace("\\", "/")
#         promo_days_path = os.path.join(full_folder_path, 'promo_days.csv').replace("\\", "/")
#         logging.info(f"Fetching promo days from {promo_days_path}")
#
#         # Read the promo days CSV from S3
#         promo_days_df = read_csv_from_s3(AWS_BUCKET_NAME, promo_days_path)
#
#         promo_data = promo_days_df.to_dict(orient='records')
#         print(promo_data)
#
#         return jsonify(promo_data), 200
#
#     except Exception as e:
#         logging.error(f"Error in get_promo_days: {e}")
#         return jsonify({'error': str(e)}), 500
#
# @app.route('/save-business-objectives', methods=['POST'])
# def save_business_objectives():
#     try:
#         # Get the data from the request
#         data = request.json
#         sales_goals = data.get('sales_goals')
#         segmentation_goals = data.get('segmentation_goals')
#         api_name = data.get('api_name')
#         project_name = data.get('project_name')
#         project_path = project_name
#         full_folder_path = os.path.join(project_path, api_name).replace("\\", "/")
#
#         if not sales_goals or not segmentation_goals or not api_name:
#             logging.error("Missing required parameters for saving business objectives")
#             return jsonify({"error": "Sales goals, segmentation goals, and API name are required"}), 400
#
#         # Create a dictionary to store the goals
#         business_objectives = {
#             "sales_goals": sales_goals,
#             "segmentation_goals": segmentation_goals
#         }
#
#         # Define the file path
#         file_path = os.path.join(full_folder_path, 'business_objectives.json').replace("\\", "/")
#         logging.info(f"Saving business objectives to {file_path}")
#
#         json_buffer = io.StringIO(json.dumps(business_objectives, indent=4))
#         upload_to_s3(io.BytesIO(json_buffer.getvalue().encode()), AWS_BUCKET_NAME, file_path)
#
#         # Call the create-recommendations endpoint
#         logging.info("Calling create-recommendations endpoint")
#         response = requests.get(
#             f'http://localhost:5001/create-recommendations?api_name={api_name}&project_name={project_name}')
#
#         if response.status_code != 201:
#             logging.error(f"Failed to create recommendations: {response.text}")
#             return jsonify({"message": "Business objectives saved, but failed to create recommendations",
#                             "error": response.text}), 500
#
#         logging.info("Business objectives saved and recommendations created successfully")
#         return jsonify({"message": "Business objectives saved and recommendations created successfully"}), 201
#
#     except Exception as e:
#         logging.error(f"Error in save_business_objectives: {e}")
#         return jsonify({"message": "An error occurred", "error": str(e)}), 500
#
# @app.route('/get-business-objectives', methods=['GET'])
# def get_business_objectives():
#     try:
#         api_name = request.args.get('api_name')
#         project_name = request.args.get('project_name')
#         project_path = project_name
#         full_folder_path = os.path.join(project_path, api_name).replace("\\", "/")
#         file_path = os.path.join(full_folder_path, 'business_objectives.json').replace("\\", "/")
#         logging.info(f"Fetching business objectives from {file_path}")
#
#         # Read the JSON file from S3
#         business_objectives = read_json_from_s3(AWS_BUCKET_NAME, file_path)
#
#         return jsonify(business_objectives), 200
#     except Exception as e:
#         logging.error(f"Error in get_business_objectives: {e}")
#         return jsonify({"message": "An error occurred", "error": str(e)}), 500
#
# # Error Handling
# @app.route('/')
# def health_check():
#     return jsonify({"message": "SFE Server is alive"}), 200
#
# @app.errorhandler(500)
# def internal_error(error):
#     return jsonify({"error": "Internal Server Error"}), 500
#
# @app.errorhandler(404)
# def not_found_error(error):
#     return jsonify({"error": "Resource Not Found"}), 404
#
# if __name__ == '__main__':
#     app.run(host='0.0.0.0', port=5002)







import csv
import json
import os
import shutil
import pandas as pd
import requests
import shortuuid
from flask import Flask, request, jsonify
from flask_cors import CORS

from utility_methods import retrieve_and_save_data, month_name_to_number, \
    find_promo_days, ROOT_PATH, preprocess_sales_data, train_model, \
    create_forecast_details

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


# Get sales data from MYSQL
@app.route('/get_sales_data', methods=['GET'])
def get_sales_data():
    # Get parameters from request
    api_name = request.args.get('api_name')
    table_name = request.args.get('table_name')
    db_user = request.args.get('db_user')
    db_password = request.args.get('db_password')
    db_host = request.args.get('db_host')
    db_name = request.args.get('db_name')

    # Call the function to retrieve and save data
    result = retrieve_and_save_data(api_name, table_name, db_user, db_password, db_host, db_name)

    if 'error' in result:
        return jsonify(result), 500
    else:
        return jsonify(result)


@app.route('/create_project', methods=['POST'])
def start_test():
    try:
        print("Received request to create a new project.")

        projectName = request.form['projectName']
        print(f"Project Name: {projectName}")

        sales_file = request.files['salesFile']
        customer_file = request.files['customerFile']
        date_column = request.form['dateColumn']
        quantity_column = request.form['quantityColumn']
        price_column = request.form['priceColumn']

        print("Received files and form data.")

        # Generate a unique ID and create a new folder
        unique_id = shortuuid.uuid()
        folder_name = f"{projectName}_{unique_id}"
        full_folder_path = os.path.join(ROOT_PATH, folder_name)
        os.makedirs(full_folder_path, exist_ok=True)  # Create the full path

        print(f"Created folder: {full_folder_path}")

        # Save the uploaded customer file in the new folder
        customer_file_path = os.path.join(full_folder_path, 'customer_data.csv')
        customer_file.save(customer_file_path)

        print(f"Saved customer file to: {customer_file_path}")

        # Process and save the sales file with conventional column names
        sales_df = pd.read_csv(sales_file)
        print("Read sales file into DataFrame.")

        sales_df.rename(columns={
            date_column: 'Date',
            quantity_column: 'Quantity',
            price_column: 'UnitPrice'
        }, inplace=True)

        sales_file_path = os.path.join(full_folder_path, 'sales_data.csv')
        sales_df.to_csv(sales_file_path, index=False)

        print(f"Renamed columns and saved sales file to: {sales_file_path}")

        # Verify if the renamed columns exist
        if 'Date' not in sales_df.columns or 'Quantity' not in sales_df.columns or 'UnitPrice' not in sales_df.columns:
            raise Exception("Column renaming failed. Please check the column names.")

        print("Verified renamed columns.")

        # Call train_model and get month_names
        sales = preprocess_sales_data(sales_df)
        print("Preprocessed sales data.")

        model, future, forecast, mape, forecasted, month_names = train_model(sales)
        print(f"Trained model and generated forecast. Month Names: {month_names}")

        # Save forecasted data to CSV
        forecasted.to_csv(os.path.join(full_folder_path, "forecast_model_results.csv"), index=False)
        print("Saved forecasted data to CSV.")

        # Save monthly forecast data to CSV
        for month in month_names:
            monthly_data = forecasted[forecasted['Month'] == month]
            monthly_file_path = os.path.join(full_folder_path, f"{month}.csv")
            monthly_data.to_csv(monthly_file_path, index=False)
            print(f"Saved monthly data for {month} to: {monthly_file_path}")

        # Call the secondary service to generate customer segments
        print("Calling secondary service to generate customer segments.")
        response = requests.post('http://localhost:5000/initiate-segments', data={
            'sales_file_path': sales_file_path,
            'folder_name': folder_name,
            'customer_file_path': customer_file_path
        })

        # Check if the response is not OK
        if response.status_code != 200:
            raise Exception(f'Secondary service failed with status code {response.status_code}: {response.text}')

        print("Secondary service completed successfully.")

        # Return folder name and project ID
        return jsonify(
            {'message': 'Files uploaded and processed successfully.', 'folder': folder_name, 'months': month_names})

    except Exception as e:
        # Rollback and log error
        print("Exception:", e)
        shutil.rmtree(full_folder_path, ignore_errors=True)  # Attempt to delete, ignore errors if it fails
        return jsonify({'error': str(e)}), 500


@app.route('/create_report', methods=['POST'])
def create_report():
    try:
        reportName = request.form['reportName']
        projectName = request.form['projectName']

        # Generate a unique ID and create a new folder
        unique_id = shortuuid.uuid()
        folder_name = f"{reportName}_{unique_id}"
        project_path = os.path.join(ROOT_PATH, projectName)
        full_folder_path = os.path.join(project_path, folder_name)
        os.makedirs(full_folder_path, exist_ok=True)  # Create the full path

        # Process and save the sales file with conventional column names
        forecast_path = os.path.join(project_path, f'{reportName}.csv')
        forecast_df = pd.read_csv(forecast_path)

        # Find and save promo days
        promo_days_df = find_promo_days(forecast_df)
        promo_days_path = os.path.join(full_folder_path, 'promo_days.csv')
        promo_days_df.to_csv(promo_days_path, index=False)

        # Create forecast details
        forecast_details = create_forecast_details(forecast_df, promo_days_df)
        json_file_path = os.path.join(full_folder_path, "forecast_details.json")

        # Save forecast details to JSON
        with open(json_file_path, 'w') as json_file:
            json.dump(forecast_details, json_file, indent=4)

        # Call the generate-analysis endpoint
        response = requests.get(
            f'http://localhost:5001/generate-analysis?api_name={folder_name}&project_name={projectName}')

        if response.status_code != 200:
            raise Exception(
                f'Generate analysis service failed with status code {response.status_code}: {response.text}')

        # Return folder name and project ID
        return jsonify({'message': 'Files uploaded and processed successfully.', 'folder': folder_name})

    except Exception as e:
        # Rollback and log error
        print("Exception:", e)
        shutil.rmtree(full_folder_path, ignore_errors=True)  # Attempt to delete, ignore errors if it fails
        return jsonify({'error': str(e)}), 500


@app.route('/<api_name>/get_forecast', methods=['GET'])
def get_forecast(api_name):
    try:
        project_name = request.args.get('project_name')
        project_path = os.path.join(ROOT_PATH, project_name)
        month = api_name.split("_")[0]

        # Construct the file path for the product data CSV
        forecast_path = os.path.join(project_path, f'{month}.csv')
        print("Forecast Name: ", forecast_path)

        # Check if the file exists
        if os.path.exists(forecast_path):
            # Read the CSV file
            forecast_df = pd.read_csv(forecast_path)

            # Convert the DataFrame to JSON
            forecast_json = forecast_df.to_dict(orient='records')

            # Return the JSON response
            return jsonify(forecast_json), 200
        else:
            return jsonify({"message": "Forecast data not found for the specified API."}), 404

    except Exception as e:
        print(e)
        return jsonify({"message": "An error occurred", "error": str(e)}), 500


@app.route('/<api_name>/get_promo_days', methods=['GET'])
def get_promo_days(api_name):
    project_name = request.args.get('project_name')
    project_path = os.path.join(ROOT_PATH, project_name)
    full_folder_path = os.path.join(project_path, api_name)
    promo_days_path = os.path.join(full_folder_path, 'promo_days.csv')

    if os.path.exists(promo_days_path):
        promo_data = []
        with open(promo_days_path, 'r') as file:
            reader = csv.DictReader(file)
            for row in reader:
                promo_data.append({'date': row['Date'], 'promo': row['Promotion Type']})

        if promo_data:  # Check if promo_data is not empty
            return jsonify(promo_data)
        else:
            return jsonify({'message': 'Promo days file is empty'}), 204  # No Content
    else:
        print("Promo days not found")
        return jsonify({'error': 'Promo days file not found'}), 404


@app.route('/save-business-objectives', methods=['POST'])
def save_business_objectives():
    try:
        # Get the data from the request
        data = request.json
        sales_goals = data.get('sales_goals')
        segmentation_goals = data.get('segmentation_goals')
        api_name = data.get('api_name')
        project_name = data.get('project_name')
        project_path = os.path.join(ROOT_PATH, project_name)
        full_folder_path = os.path.join(project_path, api_name)

        if not sales_goals or not segmentation_goals or not api_name:
            return jsonify({"error": "Sales goals, segmentation goals, and API name are required"}), 400

        # Create a dictionary to store the goals
        business_objectives = {
            "sales_goals": sales_goals,
            "segmentation_goals": segmentation_goals
        }

        # Define the file path
        file_path = os.path.join(full_folder_path, 'business_objectives.json')
        print(file_path)

        # Create directory if it doesn't exist
        # os.makedirs(os.path.dirname(file_path), exist_ok=True)

        # Save the goals to a JSON file
        with open(file_path, 'w') as file:
            json.dump(business_objectives, file, indent=4)

        # Call the create-recommendations endpoint
        response = requests.get(
            f'http://localhost:5001/create-recommendations?api_name={api_name}&project_name={project_name}')

        if response.status_code != 201:
            return jsonify({"message": "Business objectives saved, but failed to create recommendations",
                            "error": response.text}), 500

        return jsonify({"message": "Business objectives saved and recommendations created successfully"}), 201

    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500


@app.route('/get-business-objectives', methods=['GET'])
def get_business_objectives():
    try:
        api_name = request.args.get('api_name')
        project_name = request.args.get('project_name')
        project_path = os.path.join(ROOT_PATH, project_name)
        full_folder_path = os.path.join(project_path, api_name)
        file_path = os.path.join(full_folder_path, 'business_objectives.json')
        print(api_name)

        # Check if file exists
        if not os.path.exists(file_path):
            return jsonify({"message": "Business objectives file not found for the specified API."}), 404

        # Read file content
        with open(file_path, 'r') as file:
            business_objectives = json.load(file)

        return jsonify(business_objectives), 200
    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500



# Error Handling
@app.route('/')
def health_check():
    return jsonify({"message": "SFE Server is alive"}), 200


@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal Server Error"}), 500


@app.errorhandler(404)
def not_found_error(error):
    return jsonify({"error": "Resource Not Found"}), 404


if __name__ == '__main__':
    app.run(port=5002)
