# import json
# import os
# import io
# import logging
# from concurrent.futures import ThreadPoolExecutor
#
# import pandas as pd
# import shortuuid
# from flask import Flask, request, jsonify, Response
# from flask_cors import CORS
# import boto3
#
# from customer_segmentation import prepare_data, fit_models, predict_variables, calculate_descriptive_statistics, create_segment_columns, create_marketing_data
# from data_generation import generate_products_data, get_segment_transactions, generate_bundle_info
# from order_analysis_offers import apply_discount_tier, load_custom_discounts, calculate_loyalty_points, calculate_next_tier_difference
# from product_bundles import save_custom_discounts, get_bundlesets, create_bogd_offers, convert_sets_to_strings
# from utility_methods import segment_offers
#
# app = Flask(__name__)
# CORS(app)
#
# # Configure logging
# logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s:%(message)s')
#
# # AWS S3 Configuration
# AWS_BUCKET_NAME = 'iso-datalake'
#
# s3_client = boto3.client('s3')
#
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
#
# def read_csv_from_s3(bucket_name, object_name):
#     """Read a CSV file from S3 into a pandas DataFrame"""
#     try:
#         logging.info(f"Reading CSV file {object_name} from bucket {bucket_name}")
#         response = s3_client.get_object(Bucket=bucket_name, Key=object_name)
#         return pd.read_csv(io.BytesIO(response['Body'].read()))
#     except Exception as e:
#         logging.error(f"Failed to read CSV from S3: {e}")
#         raise
#
#
# def read_json_from_s3(bucket_name, object_name):
#     """Read a JSON file from S3"""
#     try:
#         logging.info(f"Reading JSON file {object_name} from bucket {bucket_name}")
#         response = s3_client.get_object(Bucket=bucket_name, Key=object_name)
#         return json.loads(response['Body'].read().decode('utf-8'))
#     except Exception as e:
#         logging.error(f"Failed to read JSON from S3: {e}")
#         raise
#
#
# @app.route('/initiate-segments', methods=['POST'])
# def initiate_segments():
#     try:
#         # Get the form data
#         sales_file_path = request.form['sales_file_path']
#         folder_name = request.form['folder_name']
#         customer_file_path = request.form['customer_file_path']
#         root_path = f"{folder_name}/"
#
#         df = read_csv_from_s3(AWS_BUCKET_NAME, sales_file_path)
#         df['id'] = [shortuuid.uuid() for _ in range(len(df))]
#         products_data_path = f"{root_path}products_data.csv"
#         logging.info("Generating products dataset...")
#         products_data = generate_products_data(df)
#
#         buffer = io.StringIO()
#         products_data.to_csv(buffer, index=False)
#         upload_to_s3(io.BytesIO(buffer.getvalue().encode()), AWS_BUCKET_NAME, products_data_path)
#
#         df['Date'] = pd.to_datetime(df['Date'])
#         df = df[df["TotalPrice"] > 0]
#         summary = prepare_data(df, customer_id_col="CustomerID", datetime_col='Date', monetary_value_col='TotalPrice',
#                                observation_period_end=max(df["Date"]))
#
#         bgf, ggf = fit_models(summary)
#         summary = predict_variables(summary, bgf, ggf, threshold=0.5)
#         summary = create_segment_columns(summary, recency='recency', frequency='frequency',
#                                          monetary_value='monetary_value', clv='predicted_clv')
#
#         segment_stats, subsegment_stats, percentages_dict, all_data_dict = calculate_descriptive_statistics(summary,
#                                                                                                             fields=[
#                                                                                                                 'probability_alive',
#                                                                                                                 'predicted_purchases',
#                                                                                                                 'predicted_clv',
#                                                                                                                 'estimated_monetary_value'])
#         segments = summary[["CustomerID", "Segment", "Subsegment"]]
#         merged = pd.merge(df, segments, on='CustomerID', how='left')
#
#         summary_path = f"{root_path}segment_data.csv"
#         buffer = io.StringIO()
#         summary.to_csv(buffer, index=False)
#         upload_to_s3(io.BytesIO(buffer.getvalue().encode()), AWS_BUCKET_NAME, summary_path)
#
#         merged_path = f"{root_path}segment_transactions.csv"
#         buffer = io.StringIO()
#         merged.to_csv(buffer, index=False)
#         upload_to_s3(io.BytesIO(buffer.getvalue().encode()), AWS_BUCKET_NAME, merged_path)
#
#         segment_stats_path = f"{root_path}segment_stats.csv"
#         buffer = io.StringIO()
#         segment_stats.to_csv(buffer, index=False)
#         upload_to_s3(io.BytesIO(buffer.getvalue().encode()), AWS_BUCKET_NAME, segment_stats_path)
#
#         subsegment_stats_path = f"{root_path}subsegment_stats.csv"
#         buffer = io.StringIO()
#         subsegment_stats.to_csv(buffer, index=False)
#         upload_to_s3(io.BytesIO(buffer.getvalue().encode()), AWS_BUCKET_NAME, subsegment_stats_path)
#
#         percentages_path = f"{root_path}segment_percentages.json"
#         upload_to_s3(io.BytesIO(json.dumps(percentages_dict).encode()), AWS_BUCKET_NAME, percentages_path)
#
#         compositions_path = f"{root_path}segment_compositions.json"
#         upload_to_s3(io.BytesIO(json.dumps(all_data_dict).encode()), AWS_BUCKET_NAME, compositions_path)
#
#         high_value_df, risk_df, nurture_df = get_segment_transactions(merged)
#
#         high_value_path = f"{root_path}high_value_transactions.csv"
#         buffer = io.StringIO()
#         high_value_df.to_csv(buffer, index=False)
#         upload_to_s3(io.BytesIO(buffer.getvalue().encode()), AWS_BUCKET_NAME, high_value_path)
#
#         risk_path = f"{root_path}risk_transactions.csv"
#         buffer = io.StringIO()
#         risk_df.to_csv(buffer, index=False)
#         upload_to_s3(io.BytesIO(buffer.getvalue().encode()), AWS_BUCKET_NAME, risk_path)
#
#         nurture_path = f"{root_path}nurture_transactions.csv"
#         buffer = io.StringIO()
#         nurture_df.to_csv(buffer, index=False)
#         upload_to_s3(io.BytesIO(buffer.getvalue().encode()), AWS_BUCKET_NAME, nurture_path)
#
#         return jsonify({'message': 'Customer segments generated successfully.'})
#
#     except Exception as e:
#         logging.error(f"Error in initiate_segments: {e}")
#         return jsonify({'error': str(e)}), 500
#
#
# @app.route('/get_customer_segments', methods=['GET'])
# def get_customer_segments():
#     api_name = request.args.get('api_name')
#     customer_segments_path = f"{api_name}/customer_segments.csv"
#     logging.info(f"Fetching customer segments from {customer_segments_path}")
#
#     try:
#         response = s3_client.get_object(Bucket=AWS_BUCKET_NAME, Key=customer_segments_path)
#         return Response(
#             response['Body'].read(),
#             mimetype='text/csv',
#             headers={"Content-Disposition": "attachment;filename=customer_segments.csv"}
#         )
#     except Exception as e:
#         logging.error(f"Error in get_customer_segments: {e}")
#         return jsonify({'error': str(e)}), 404
#
#
# @app.route("/<api_name>/get-segment-details", methods=["POST"])
# def get_percentages(api_name):
#     project_name = request.json.get('project_name')
#     file_path = f"{project_name}/segment_percentages.json"
#     logging.info(f"Fetching segment details from {file_path}")
#
#     try:
#         percentages = read_json_from_s3(AWS_BUCKET_NAME, file_path)
#         return jsonify(percentages)
#     except Exception as e:
#         logging.error(f"Error in get_percentages: {e}")
#         return jsonify({"error": str(e)}), 404
#
#
#
# # @app.route('/generate_api_data/<api_name>/<project_name>/', methods=['POST'])
# # def generate_api_data(api_name, project_name):
# #     try:
# #         data = request.json
# #
# #         file_name = "custom_discounts.json"
# #         report_path = f"{project_name}/{api_name}/"
# #
# #         logging.info("Starting data generation...")
# #
# #         # Process custom discounts data
# #         json_data = save_custom_discounts(data)
# #         logging.info("Customer discounts processed")
# #
# #         # Save the processed JSON data to S3
# #         custom_discounts_path = f"{report_path}{file_name}"
# #         upload_to_s3(io.BytesIO(json_data.encode()), AWS_BUCKET_NAME, custom_discounts_path)
# #         logging.info("Customer discounts saved to S3")
# #
# #         high_path = f"{project_name}/high_value_transactions.csv"
# #         nurture_path = f"{project_name}/nurture_transactions.csv"
# #         risk_path = f"{project_name}/risk_transactions.csv"
# #
# #         high = read_csv_from_s3(AWS_BUCKET_NAME, high_path)
# #         nurture = read_csv_from_s3(AWS_BUCKET_NAME, nurture_path)
# #         risk = read_csv_from_s3(AWS_BUCKET_NAME, risk_path)
# #
# #         # Ensure correct data types
# #         high['StockCode'] = high['StockCode'].astype(str)
# #         nurture['StockCode'] = nurture['StockCode'].astype(str)
# #         risk['StockCode'] = risk['StockCode'].astype(str)
# #
# #         sales_data_path = f"{project_name}/segment_transactions.csv"
# #         segment_data_path = f"{project_name}/segment_data.csv"
# #         sales_data = read_csv_from_s3(AWS_BUCKET_NAME, sales_data_path)
# #         segment_data = read_csv_from_s3(AWS_BUCKET_NAME, segment_data_path)
# #         min_discount = float(data['marginReduction']['min'])
# #         max_discount = float(data['marginReduction']['max'])
# #
# #         logging.info("Creating marketing data...")
# #         marketing_data = create_marketing_data(segment_data)
# #         marketing_data_path = f"{report_path}marketing.csv"
# #         buffer = io.StringIO()
# #         marketing_data.to_csv(buffer, index=False)
# #         upload_to_s3(io.BytesIO(buffer.getvalue().encode()), AWS_BUCKET_NAME, marketing_data_path)
# #
# #         logging.info("Starting product generation...")
# #         products_data_path = f"{report_path}products_data.csv"
# #         products_data = generate_products_data(df=sales_data, min_margin=min_discount, min_discount=max_discount)
# #         buffer = io.StringIO()
# #         products_data.to_csv(buffer, index=False)
# #         upload_to_s3(io.BytesIO(buffer.getvalue().encode()), AWS_BUCKET_NAME, products_data_path)
# #
# #         logging.info("Generating Product Bundles...")
# #         bundle_results = get_bundlesets(high, risk, nurture)
# #
# #         logging.info("Saving Associations...")
# #         # Save associations and itemsets to CSV files
# #         bundles_dict = {}
# #         associations_dict = {}
# #         for bundle_name, (associations, itemsets) in bundle_results.items():
# #             associations = convert_sets_to_strings(associations)
# #             itemsets = convert_sets_to_strings(itemsets)
# #             associations_file_path = f"{report_path}{bundle_name}_associations.csv"
# #             itemsets_file_path = f"{report_path}{bundle_name}_itemsets.csv"
# #             buffer = io.StringIO()
# #             associations.to_csv(buffer, index=False)
# #             upload_to_s3(io.BytesIO(buffer.getvalue().encode()), AWS_BUCKET_NAME, associations_file_path)
# #             buffer = io.StringIO()
# #             itemsets.to_csv(buffer, index=False)
# #             upload_to_s3(io.BytesIO(buffer.getvalue().encode()), AWS_BUCKET_NAME, itemsets_file_path)
# #             bundles_dict[bundle_name] = itemsets
# #             associations_dict[bundle_name] = associations
# #
# #         segment_names = ['high_value', 'nurture', 'risk']
# #         bundle_info_dict = generate_bundle_info(bundles_dict, products_data, segment_names)
# #
# #         # Save bundle info dataframes to CSV files
# #         for segment_name, bundle_info_df in bundle_info_dict.items():
# #             output_filename = f"{report_path}{segment_name}_bundles_info.csv"
# #             buffer = io.StringIO()
# #             bundle_info_df.to_csv(buffer, index=False)
# #             upload_to_s3(io.BytesIO(buffer.getvalue().encode()), AWS_BUCKET_NAME, output_filename)
# #
# #         bogd_offers_df = create_bogd_offers(associations_dict, products_data, segment_names)
# #         bogd_path = f"{report_path}bogd_offers.csv"
# #         buffer = io.StringIO()
# #         bogd_offers_df.to_csv(buffer, index=False)
# #         upload_to_s3(io.BytesIO(buffer.getvalue().encode()), AWS_BUCKET_NAME, bogd_path)
# #
# #         return jsonify({"message": "Data has been saved successfully"}), 200
# #     except Exception as e:
# #         logging.error(f"An error occurred in generate_api_data: {e}")
# #         return jsonify({"message": "An error occurred", "error": str(e)}), 500
#
# @app.route('/generate_api_data/<api_name>/<project_name>/', methods=['POST'])
# def generate_api_data(api_name, project_name):
#     try:
#         data = request.json
#
#         file_name = "custom_discounts.json"
#         report_path = f"{project_name}/{api_name}/"
#
#         logging.info("Starting data generation...")
#
#         # Process custom discounts data
#         json_data = save_custom_discounts(data)
#         logging.info("Customer discounts processed")
#
#         # Save the processed JSON data to S3
#         custom_discounts_path = f"{report_path}{file_name}"
#         upload_to_s3(io.BytesIO(json_data.encode()), AWS_BUCKET_NAME, custom_discounts_path)
#         logging.info("Customer discounts saved to S3")
#
#         paths = {
#             "high": f"{project_name}/high_value_transactions.csv",
#             "nurture": f"{project_name}/nurture_transactions.csv",
#             "risk": f"{project_name}/risk_transactions.csv",
#             "sales_data": f"{project_name}/segment_transactions.csv",
#             "segment_data": f"{project_name}/segment_data.csv"
#         }
#
#         with ThreadPoolExecutor() as executor:
#             futures = {executor.submit(read_csv_from_s3, AWS_BUCKET_NAME, path): name for name, path in paths.items()}
#             results = {name: future.result() for future, name in futures.items()}
#
#         high = results["high"]
#         nurture = results["nurture"]
#         risk = results["risk"]
#         sales_data = results["sales_data"]
#         segment_data = results["segment_data"]
#
#         # Ensure correct data types
#         high['StockCode'] = high['StockCode'].astype(str)
#         nurture['StockCode'] = nurture['StockCode'].astype(str)
#         risk['StockCode'] = risk['StockCode'].astype(str)
#
#         min_discount = float(data['marginReduction']['min'])
#         max_discount = float(data['marginReduction']['max'])
#
#         logging.info("Creating marketing data...")
#         marketing_data = create_marketing_data(segment_data)
#         marketing_data_path = f"{report_path}marketing.csv"
#         buffer = io.StringIO()
#         marketing_data.to_csv(buffer, index=False)
#         upload_to_s3(io.BytesIO(buffer.getvalue().encode()), AWS_BUCKET_NAME, marketing_data_path)
#
#         logging.info("Starting product generation...")
#         products_data_path = f"{report_path}products_data.csv"
#         products_data = generate_products_data(df=sales_data, min_margin=min_discount, min_discount=max_discount)
#         buffer = io.StringIO()
#         products_data.to_csv(buffer, index=False)
#         upload_to_s3(io.BytesIO(buffer.getvalue().encode()), AWS_BUCKET_NAME, products_data_path)
#
#         logging.info("Generating Product Bundles...")
#         bundle_results = get_bundlesets(high, risk, nurture)
#
#         logging.info("Saving Associations...")
#         # Save associations and itemsets to CSV files
#         bundles_dict = {}
#         associations_dict = {}
#         for bundle_name, (associations, itemsets) in bundle_results.items():
#             associations = convert_sets_to_strings(associations)
#             itemsets = convert_sets_to_strings(itemsets)
#             associations_file_path = f"{report_path}{bundle_name}_associations.csv"
#             itemsets_file_path = f"{report_path}{bundle_name}_itemsets.csv"
#             buffer = io.StringIO()
#             associations.to_csv(buffer, index=False)
#             upload_to_s3(io.BytesIO(buffer.getvalue().encode()), AWS_BUCKET_NAME, associations_file_path)
#             buffer = io.StringIO()
#             itemsets.to_csv(buffer, index=False)
#             upload_to_s3(io.BytesIO(buffer.getvalue().encode()), AWS_BUCKET_NAME, itemsets_file_path)
#             bundles_dict[bundle_name] = itemsets
#             associations_dict[bundle_name] = associations
#
#         segment_names = ['high_value', 'nurture', 'risk']
#         bundle_info_dict = generate_bundle_info(bundles_dict, products_data, segment_names)
#
#         # Save bundle info dataframes to CSV files
#         with ThreadPoolExecutor() as executor:
#             futures = []
#             for segment_name, bundle_info_df in bundle_info_dict.items():
#                 output_filename = f"{report_path}{segment_name}_bundles_info.csv"
#                 buffer = io.StringIO()
#                 bundle_info_df.to_csv(buffer, index=False)
#                 futures.append(executor.submit(upload_to_s3, io.BytesIO(buffer.getvalue().encode()), AWS_BUCKET_NAME, output_filename))
#             for future in futures:
#                 future.result()
#
#         bogd_offers_df = create_bogd_offers(associations_dict, products_data, segment_names)
#         bogd_path = f"{report_path}bogd_offers.csv"
#         buffer = io.StringIO()
#         bogd_offers_df.to_csv(buffer, index=False)
#         upload_to_s3(io.BytesIO(buffer.getvalue().encode()), AWS_BUCKET_NAME, bogd_path)
#
#         return jsonify({"message": "Data has been saved successfully"}), 200
#     except Exception as e:
#         logging.error(f"An error occurred in generate_api_data: {e}")
#         return jsonify({"message": "An error occurred", "error": str(e)}), 500
#
# @app.route('/get_products', methods=['GET'])
# def get_products():
#     try:
#         # Get the API name from the request
#         api_name = request.args.get('api_name')
#         project_name = request.args.get('project_name')
#         root_path = f"{project_name}/{api_name}/"
#
#         # Construct the file path for the product data CSV
#         file_path = f"{root_path}products_data.csv"
#         logging.info(f"Fetching products data from {file_path}")
#
#         # Check if the file exists
#         response = s3_client.get_object(Bucket=AWS_BUCKET_NAME, Key=file_path)
#         return Response(
#             response['Body'].read(),
#             mimetype='text/csv',
#             headers={"Content-Disposition": "attachment;filename=products_data.csv"}
#         )
#     except Exception as e:
#         logging.error(f"Error in get_products: {e}")
#         return jsonify({"message": "Product data not found for the specified API."}), 404
#
#
# @app.route('/<api_name>/get_offers', methods=['GET'])
# def get_promotions(api_name):
#     try:
#         date = request.args.get('date')
#         segment_name = request.args.get('segment')
#         project_name = request.args.get('project_name')
#         project_path = f"{project_name}"
#         full_folder_path = f"{project_path}/{api_name}"
#
#         # Paths for promotion info and offers
#         promo_info_filename = "promo_days.csv"
#         promo_path = f"{full_folder_path}/{promo_info_filename}"
#         offers_path = f"{full_folder_path}/custom_discounts.json"
#
#         logging.info(f"Fetching promotions data from {promo_path}")
#
#         # Load promotions data
#         promotions_df = read_csv_from_s3(AWS_BUCKET_NAME, promo_path)
#
#         # Check if the date is present in the CSV
#         if date in promotions_df['Date'].values:
#             logging.info("Date matched")
#             if segment_name in segment_offers:
#                 segment_offers_list = segment_offers[segment_name]
#
#                 logging.info(f"Fetching offers data from {offers_path}")
#
#                 # Load offers from the JSON file
#                 offers_data = read_json_from_s3(AWS_BUCKET_NAME, offers_path)
#
#                 # Filter offers based on segment offers list
#                 valid_offers = {key: value for key, value in offers_data.items() if
#                                 key in segment_offers_list and value}
#
#                 return jsonify(valid_offers)
#
#         # Return empty dictionary if no match
#         return jsonify({})
#
#     except FileNotFoundError as e:
#         logging.error(f"FileNotFoundError: {e}")
#         return jsonify({"error": f"File not found: {e}"}), 500
#     except KeyError as e:
#         logging.error(f"KeyError: {e}")
#         return jsonify({"error": str(e)}), 500
#     except Exception as e:
#         logging.error(f"An error occurred: {e}")
#         return jsonify({"error": "An internal error occurred."}), 500
#
#
# @app.route('/<api_name>/get_bundle_info', methods=['GET'])
# def get_bundle_info(api_name):
#     try:
#         segment_name = request.args.get('segment_name')
#         project_name = request.args.get('project_name')
#         root_path = f"{project_name}/{api_name}"
#
#         if not segment_name:
#             return jsonify({"error": "Segment name parameter is required."}), 400
#
#         # Convert segment name to lower case and replace spaces with underscores
#         formatted_segment_name = segment_name.lower().replace(' ', '_')
#
#         # Check if the bundle info file for the segment exists
#         bundle_info_filename = f"{formatted_segment_name}_bundles_info.csv"
#         bundle_info_path = f"{root_path}/{bundle_info_filename}"
#         logging.info(f"Fetching bundle info from {bundle_info_path}")
#
#         response = s3_client.get_object(Bucket=AWS_BUCKET_NAME, Key=bundle_info_path)
#         return Response(
#             response['Body'].read(),
#             mimetype='text/csv',
#             headers={"Content-Disposition": f"attachment;filename={formatted_segment_name}_bundles_info.csv"}
#         )
#     except Exception as e:
#         logging.error(f"Error in get_bundle_info: {e}")
#         return jsonify({"error": "Bundle info file not found for the specified segment."}), 404
#
#
# @app.route('/get_bodg_offers', methods=['GET'])
# def get_bodg_offers():
#     try:
#         # Get the api_name and segment_name from the request arguments
#         api_name = request.args.get('api_name')
#         segment_name = request.args.get('segment_name')
#         project_name = request.args.get('project_name')
#         root_path = f"{project_name}/{api_name}/"
#
#         if not api_name or not segment_name:
#             return jsonify({"message": "api_name and segment_name are required"}), 400
#
#         # Construct the file path
#         file_path = f"{root_path}/bogd_offers.csv"
#         logging.info(f"Fetching BOGD offers from {file_path}")
#
#         # Check if the file exists
#         response = s3_client.get_object(Bucket=AWS_BUCKET_NAME, Key=file_path)
#         df = pd.read_csv(io.BytesIO(response['Body'].read()))
#
#         # Filter the rows by segment_name
#         filtered_df = df[df['segment'] == segment_name]
#
#         # Convert the filtered DataFrame to a dictionary
#         filtered_data = filtered_df.to_dict(orient='records')
#
#         # Return the filtered data as JSON
#         return jsonify(filtered_data), 200
#     except Exception as e:
#         logging.error(f"Error in get_bodg_offers: {e}")
#         return jsonify({"message": "An error occurred", "error": str(e)}), 500
#
#
# # Check order to apply discounts
# @app.route('/apply_discount', methods=['POST'])
# def apply_discount():
#     try:
#         data = request.json
#         total_price = data['total_price']
#         api_name = data['api_name']
#         project_name = data['project_name']
#         logging.info(f"Applying discount for {api_name} in project {project_name}")
#
#         root_path = f"{project_name}/{api_name}/"
#
#         # Apply discount tier
#         discounted_price = apply_discount_tier(total_price, root_path)
#
#         # Load custom discounts
#         discounts = load_custom_discounts(root_path)
#         logging.info("Custom discounts loaded")
#
#         # Extract loyalty points and high-value loyalty points
#         loyalty_points = discounts.get('loyalty_points')
#         high_value_loyalty_points = discounts.get('high_value_loyalty_points')
#
#         # Calculate loyalty points if available
#         loyalty_points_message = None
#         if isinstance(loyalty_points, int):
#             loyalty_points = calculate_loyalty_points(total_price, loyalty_points)
#             loyalty_points_message = f"You have gained {loyalty_points} loyalty points."
#
#         if isinstance(high_value_loyalty_points, int):
#             high_value_loyalty_points = calculate_loyalty_points(total_price, high_value_loyalty_points)
#
#         # Calculate amount needed for next tier and next tier description
#         logging.info("Calculating next tier difference")
#         amount_needed, next_tier_description = calculate_next_tier_difference(total_price, root_path)
#
#         response = {
#             "discounted_price": discounted_price,
#             "loyalty_points": loyalty_points,
#             "high_value_loyalty_points": high_value_loyalty_points,
#             "message": f"Your discounted price is ${discounted_price:.2f}, spend ${amount_needed:.2f} to qualify for {next_tier_description}.",
#         }
#
#         if loyalty_points_message:
#             response["loyalty_points_message"] = loyalty_points_message
#
#         return jsonify(response), 200
#
#     except Exception as e:
#         logging.error(f"Error in apply_discount: {e}")
#         return jsonify({"message": "An error occurred", "error": str(e)}), 500
#
#
# # Function to load the CSV file and create the dataset
# def load_and_process_data(api_name):
#     file_path = f"{api_name}/segment_data.csv"
#     logging.info(f"Loading and processing data from {file_path}")
#     df = read_csv_from_s3(AWS_BUCKET_NAME, file_path)
#     result_df = create_marketing_data(df, api_name)
#     return result_df
#
#
# # Endpoint to get all customers
# @app.route('/get_customers', methods=['GET'])
# def get_customers():
#     api_name = request.args.get('api_name')
#     project_name = request.args.get('project_name')
#     if not api_name:
#         return jsonify({"error": "api_name parameter is required"}), 400
#     try:
#         file_path = f"{project_name}/{api_name}/marketing.csv"
#         logging.info(f"Fetching customer data from {file_path}")
#         df = read_csv_from_s3(AWS_BUCKET_NAME, file_path)
#         customers = df.to_dict(orient='records')
#         return jsonify(customers), 200
#     except Exception as e:
#         logging.error(f"Error in get_customers: {e}")
#         return jsonify({"error": str(e)}), 500
#
#
# @app.route('/<api_name>/get_emails_by_segment', methods=['GET'])
# def get_emails_by_segment(api_name):
#     project_name = request.args.get('project_name')
#     segment = request.args.get('segment')
#
#     if not api_name:
#         return jsonify({"error": "api_name parameter is required"}), 400
#     if not project_name:
#         return jsonify({"error": "project_name parameter is required"}), 400
#     if not segment:
#         return jsonify({"error": "segment parameter is required"}), 400
#
#     try:
#         file_path = f"{project_name}/{api_name}/marketing.csv"
#         logging.info(f"Fetching emails by segment from {file_path}")
#
#         df = read_csv_from_s3(AWS_BUCKET_NAME, file_path)
#
#         # Filter customers by segment
#         filtered_customers = df[df['Segment'] == segment]
#
#         # Extract emails
#         emails = filtered_customers['Email'].tolist()
#
#         return jsonify({"emails": emails}), 200
#
#     except FileNotFoundError:
#         logging.error(f"File not found: {file_path}")
#         return jsonify({"error": "File not found"}), 404
#     except Exception as e:
#         logging.error(f"Error in get_emails_by_segment: {e}")
#         return jsonify({"error": str(e)}), 500
#
#
# @app.route('/<api_name>/get_emails_by_subsegment', methods=['GET'])
# def get_emails_by_subsegment(api_name):
#     project_name = request.args.get('project_name')
#     subsegment = request.args.get('subsegment')
#
#     if not api_name:
#         return jsonify({"error": "api_name parameter is required"}), 400
#     if not project_name:
#         return jsonify({"error": "project_name parameter is required"}), 400
#     if not subsegment:
#         return jsonify({"error": "subsegment parameter is required"}), 400
#
#     try:
#         file_path = f"{project_name}/{api_name}/marketing.csv"
#         logging.info(f"Fetching emails by subsegment from {file_path}")
#
#         df = read_csv_from_s3(AWS_BUCKET_NAME, file_path)
#
#         # Filter customers by subsegment
#         filtered_customers = df[df['Subsegment'] == subsegment]
#
#         # Extract emails
#         emails = filtered_customers['Email'].tolist()
#
#         return jsonify({"emails": emails}), 200
#
#     except FileNotFoundError:
#         logging.error(f"File not found: {file_path}")
#         return jsonify({"error": "File not found"}), 404
#     except Exception as e:
#         logging.error(f"Error in get_emails_by_subsegment: {e}")
#         return jsonify({"error": str(e)}), 500
#
#
# # Error Handling
# @app.route('/')
# def health_check():
#     return jsonify({"message": "CSE Server is alive"}), 200
#
#
# @app.errorhandler(500)
# def internal_error(error):
#     return jsonify({"error": "Internal Server Error"}), 500
#
#
# @app.errorhandler(404)
# def not_found_error(error):
#     return jsonify({"error": "Resource Not Found"}), 404
#
#
# if __name__ == '__main__':
#     app.run(port=5000)


import json
import os

import pandas as pd
import shortuuid
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS

from customer_segmentation import  prepare_data, fit_models, \
    predict_variables, calculate_descriptive_statistics, create_segment_columns, create_marketing_data
from data_generation import generate_products_data, get_segment_transactions, \
    generate_bundle_info
from order_analysis_offers import apply_discount_tier, load_custom_discounts, \
    calculate_loyalty_points, calculate_next_tier_difference
from product_bundles import save_custom_discounts, get_bundlesets, \
    create_bogd_offers, convert_sets_to_strings
from utility_methods import segment_offers

ROOT_PATH = "../s3"

app = Flask(__name__)
CORS(app)


@app.route('/initiate-segments', methods=['POST'])
def initiate_segments():
    try:
        print("Received request to initiate segments.")

        # Get the form data
        sales_file_path = request.form['sales_file_path']
        print(f"Sales file path: {sales_file_path}")

        folder_name = request.form['folder_name']
        print(f"Folder name: {folder_name}")

        customer_file_path = request.form['customer_file_path']
        print(f"Customer file path: {customer_file_path}")

        root_path = f"{ROOT_PATH}/{folder_name}"
        print(f"Root path: {root_path}")

        df = pd.read_csv(sales_file_path)
        df['id'] = [shortuuid.uuid() for _ in range(len(df))]
        products_data_path = os.path.join(root_path, 'products_data.csv')

        print("Generating products dataset...")
        products_data = generate_products_data(df)
        products_data.to_csv(products_data_path, index=False)
        print(f"Saved products dataset to: {products_data_path}")

        df['Date'] = pd.to_datetime(df['Date'])
        df = df[df["TotalPrice"] > 0]
        summary = prepare_data(df, customer_id_col="CustomerID", datetime_col='Date',
                               monetary_value_col='TotalPrice', observation_period_end=max(df["Date"]))

        print("Fitting models...")
        bgf, ggf = fit_models(summary)
        summary = predict_variables(summary, bgf, ggf, threshold=0.5)
        summary = create_segment_columns(summary, recency='recency', frequency='frequency',
                                         monetary_value='monetary_value',
                                         clv='predicted_clv')
        print("Models fitted and summary prepared.")

        segment_stats, subsegment_stats, percentages_dict, all_data_dict = calculate_descriptive_statistics(
            summary, fields=['probability_alive', 'predicted_purchases', 'predicted_clv', 'estimated_monetary_value']
        )
        print("Descriptive statistics calculated.")

        segments = summary[["CustomerID", "Segment", "Subsegment"]]
        merged = pd.merge(df, segments, on='CustomerID', how='left')
        print("Segments merged with original data.")

        if not os.path.exists(root_path):
            os.makedirs(root_path)
            print(f"Created directory: {root_path}")

        summary.to_csv(os.path.join(root_path, 'segment_data.csv'), index=False)
        merged.to_csv(os.path.join(root_path, 'segment_transactions.csv'), index=False)
        segment_stats.to_csv(os.path.join(root_path, 'segment_stats.csv'), index=False)
        subsegment_stats.to_csv(os.path.join(root_path, 'subsegment_stats.csv'), index=False)
        print("Saved summary, merged data, and statistics to CSV files.")

        with open(os.path.join(root_path, 'segment_percentages.json'), 'w') as f:
            json.dump(percentages_dict, f)
        with open(os.path.join(root_path, 'segment_compositions.json'), 'w') as f:
            json.dump(all_data_dict, f)
        print("Saved segment percentages and compositions to JSON files.")

        # Get segment transactions
        high_value_df, risk_df, nurture_df = get_segment_transactions(merged)
        print("Segment transactions extracted.")

        # Save segment transactions to CSV files
        high_value_path = os.path.join(root_path, 'high_value_transactions.csv')
        risk_path = os.path.join(root_path, 'risk_transactions.csv')
        nurture_path = os.path.join(root_path, 'nurture_transactions.csv')

        high_value_df.to_csv(high_value_path, index=False)
        risk_df.to_csv(risk_path, index=False)
        nurture_df.to_csv(nurture_path, index=False)
        print("Saved high value, risk, and nurture transactions to CSV files.")

        return jsonify({'message': 'Customer segments generated successfully.'})

    except Exception as e:
        print("Exception:", e)
        return jsonify({'error': str(e)}), 500


@app.route('/get_customer_segments', methods=['GET'])
def get_customer_segments():
    api_name = request.args.get('api_name')
    customer_segments_path = os.path.join(ROOT_PATH, api_name, 'customer_segments.csv')
    print(customer_segments_path)

    if os.path.exists(customer_segments_path):
        return send_file(customer_segments_path, as_attachment=True)
    else:
        return jsonify({'error': 'Customer segments file not found'}), 404

# Get products data

@app.route("/<api_name>/get-segment-details", methods=["POST"])
def get_percentages(api_name):
    project_name = request.json.get('project_name')
    file_path = f"{ROOT_PATH}/{project_name}/segment_percentages.json"
    print(file_path)

    if not os.path.exists(file_path):
        return jsonify({"error": "File not found"}), 404

    with open(file_path, "r") as file:
        percentages = json.load(file)

    return jsonify(percentages)


@app.route('/generate_api_data/<api_name>/<project_name>/', methods=['POST'])
def generate_api_data(api_name, project_name):
    try:
        data = request.json

        file_name = "custom_discounts.json"
        root_path = f"{ROOT_PATH}/{project_name}"
        report_path = f"{ROOT_PATH}/{project_name}/{api_name}/"

        print("Starting.........")
        save_custom_discounts(data, file_name, report_path)
        print("Done saving customer discounts")

        high_path = os.path.join(root_path, 'high_value_transactions.csv')
        nurture_path = os.path.join(root_path, 'nurture_transactions.csv')
        risk_path = os.path.join(root_path, 'risk_transactions.csv')

        high = pd.read_csv(high_path)
        nurture = pd.read_csv(nurture_path)
        risk = pd.read_csv(risk_path)

        # Ensure correct data types
        high['StockCode'] = high['StockCode'].astype(str)
        nurture['StockCode'] = nurture['StockCode'].astype(str)
        risk['StockCode'] = risk['StockCode'].astype(str)

        sales_data_path = os.path.join(root_path, 'segment_transactions.csv')
        segment_data_path = os.path.join(root_path, 'segment_data.csv')
        sales_data = pd.read_csv(sales_data_path)
        segment_data = pd.read_csv(segment_data_path)
        min_discount = float(data['marginReduction']['min'])
        max_discount = float(data['marginReduction']['max'])

        print("Creating marketing data.....")
        marketing_data = create_marketing_data(segment_data)
        marketing_data_path = os.path.join(report_path, "marketing.csv")
        marketing_data.to_csv(marketing_data_path, index=False)

        print("Starting product generation...")
        products_data_path = os.path.join(report_path, "products_data.csv")
        products_data = generate_products_data(df=sales_data, min_margin=min_discount, min_discount=max_discount)
        products_data.to_csv(products_data_path, index=False)

        print("Generating Product Bundles....")
        bundle_results = get_bundlesets(high, risk, nurture)

        print("Saving Associations....")
        # Save associations and itemsets to CSV files
        bundles_dict = {}
        associations_dict = {}
        for bundle_name, (associations, itemsets) in bundle_results.items():
            associations = convert_sets_to_strings(associations)
            itemsets = convert_sets_to_strings(itemsets)
            associations_file_path = os.path.join(report_path, f"{bundle_name}_associations.csv")
            itemsets_file_path = os.path.join(report_path, f"{bundle_name}_itemsets.csv")
            associations.to_csv(associations_file_path, index=False)
            itemsets.to_csv(itemsets_file_path, index=False)
            bundles_dict[bundle_name] = itemsets
            associations_dict[bundle_name] = associations

        segment_names = ['high_value', 'nurture', 'risk']
        bundle_info_dict = generate_bundle_info(bundles_dict, products_data, segment_names)

        # Save bundle info dataframes to CSV files
        for segment_name, bundle_info_df in bundle_info_dict.items():
            output_filename = os.path.join(report_path, f"{segment_name}_bundles_info.csv")
            bundle_info_df.to_csv(output_filename, index=False)

        bogd_offers_df = create_bogd_offers(associations_dict, products_data, segment_names)
        bogd_path = os.path.join(report_path, 'bogd_offers.csv')
        bogd_offers_df.to_csv(bogd_path, index=False)

        return jsonify({"message": "Data has been saved successfully"}), 200
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"message": "An error occurred", "error": str(e)}), 500


@app.route('/get_products', methods=['GET'])
def get_products():
    try:
        # Get the API name from the request
        api_name = request.args.get('api_name')
        project_name = request.args.get('project_name')
        root_path = f"{ROOT_PATH}/{project_name}/{api_name}/"

        # Construct the file path for the product data CSV
        file_path = os.path.join(root_path, 'products_data.csv')
        print(file_path)

        # Check if the file exists
        if os.path.exists(file_path):
            # Send the CSV file as a response
            return send_file(file_path, mimetype='text/csv', as_attachment=True)
        else:
            return jsonify({"message": "Product data not found for the specified API."}), 404

    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500

# Get the bundles for specified segment

@app.route('/<api_name>/get_offers', methods=['GET'])
def get_promotions(api_name):
    try:
        date = request.args.get('date')
        segment_name = request.args.get('segment')
        project_name = request.args.get('project_name')
        project_path = os.path.join(ROOT_PATH, project_name)
        full_folder_path = os.path.join(project_path, api_name)

        # Paths for promotion info and offers
        promo_info_filename = "promo_days.csv"
        promo_path = os.path.join(full_folder_path, promo_info_filename)
        offers_path = os.path.join(full_folder_path, "custom_discounts.json")

        # Load promotions data
        promotions_df = pd.read_csv(promo_path)

        # Check if the date is present in the CSV
        if date in promotions_df['Date'].values:
            print("Date matched")
            if segment_name in segment_offers:
                segment_offers_list = segment_offers[segment_name]

                # Load offers from the JSON file
                with open(offers_path, 'r') as f:
                    offers_data = json.load(f)

                # Filter offers based on segment offers list
                valid_offers = {key: value for key, value in offers_data.items() if
                                key in segment_offers_list and value}

                return jsonify(valid_offers)

        # Return empty dictionary if no match
        return jsonify({})

    except FileNotFoundError as e:
        print(f"FileNotFoundError: {e}")
        return jsonify({"error": f"File not found: {e}"}), 500
    except KeyError as e:
        print(f"KeyError: {e}")
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": "An internal error occurred."}), 500

@app.route('/<api_name>/get_bundle_info', methods=['GET'])
def get_bundle_info(api_name):
    try:
        segment_name = request.args.get('segment_name')
        project_name = request.args.get('project_name')
        root_path = os.path.join(ROOT_PATH, project_name, api_name)

        if not segment_name:
            return jsonify({"error": "Segment name parameter is required."}), 400

        # Convert segment name to lower case and replace spaces with underscores
        formatted_segment_name = segment_name.lower().replace(' ', '_')

        # Check if the bundle info file for the segment exists
        bundle_info_filename = f"{formatted_segment_name}_bundles_info.csv"
        bundle_info_path = os.path.join(root_path, bundle_info_filename)

        if os.path.exists(bundle_info_path):
            # If the file exists, return it
            return send_file(bundle_info_path, as_attachment=True)
        else:
            return jsonify({"error": "Bundle info file not found for the specified segment."}), 404

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": "An internal error occurred."}), 500

@app.route('/get_bodg_offers', methods=['GET'])
def get_bodg_offers():
    try:
        # Get the api_name and segment_name from the request arguments
        api_name = request.args.get('api_name')
        segment_name = request.args.get('segment_name')
        project_name = request.args.get('project_name')
        root_path = f"{ROOT_PATH}/{project_name}/{api_name}/"

        if not api_name or not segment_name:
            return jsonify({"message": "api_name and segment_name are required"}), 400

        # Construct the file path
        file_path = os.path.join(root_path, 'bogd_offers.csv')

        # Check if the file exists
        if not os.path.isfile(file_path):
            return jsonify({"message": "File not found"}), 404

        # Read the CSV file
        df = pd.read_csv(file_path)

        # Filter the rows by segment_name
        filtered_df = df[df['segment'] == segment_name]

        # Convert the filtered DataFrame to a dictionary
        filtered_data = filtered_df.to_dict(orient='records')

        # Return the filtered data as JSON
        return jsonify(filtered_data), 200
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"message": "An error occurred", "error": str(e)}), 500


# Check order to apply discounts
@app.route('/apply_discount', methods=['POST'])
def apply_discount():
    try:
        data = request.json
        total_price = data['total_price']
        api_name = data['api_name']
        project_name = data['project_name']
        print(data)

        root_path = f"{ROOT_PATH}/{project_name}/{api_name}/"

        # Apply discount tier
        discounted_price = apply_discount_tier(total_price, root_path)

        # Load custom discounts
        discounts = load_custom_discounts(root_path)
        print("Start 1")

        # Extract loyalty points and high-value loyalty points
        loyalty_points = discounts.get('loyalty_points')
        high_value_loyalty_points = discounts.get('high_value_loyalty_points')

        # Calculate loyalty points if available
        loyalty_points_message = None
        if isinstance(loyalty_points, int):
            loyalty_points = calculate_loyalty_points(total_price, loyalty_points)
            loyalty_points_message = f"You have gained {loyalty_points} loyalty points."

        if isinstance(high_value_loyalty_points, int):
            high_value_loyalty_points = calculate_loyalty_points(total_price, high_value_loyalty_points)

        # Calculate amount needed for next tier and next tier description
        print("Start 2")
        amount_needed, next_tier_description = calculate_next_tier_difference(total_price, root_path)


        response = {
            "discounted_price": discounted_price,
            "loyalty_points": loyalty_points,
            "high_value_loyalty_points": high_value_loyalty_points,
            "message": f"Your discounted price is ${discounted_price:.2f}, spend ${amount_needed:.2f} to qualify for {next_tier_description}.",
        }

        if loyalty_points_message:
            response["loyalty_points_message"] = loyalty_points_message

        return jsonify(response), 200

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"message": "An error occurred", "error": str(e)}), 500

# Function to load the CSV file and create the dataset
def load_and_process_data(api_name):
    file_path = f"{ROOT_PATH}/{api_name}/segment_data.csv"
    df = pd.read_csv(file_path)
    result_df = create_marketing_data(df,api_name)
    return result_df


# Endpoint to get all customers
@app.route('/get_customers', methods=['GET'])
def get_customers():
    api_name = request.args.get('api_name')
    project_name = request.args.get('project_name')
    if not api_name:
        return jsonify({"error": "api_name parameter is required"}), 400
    try:
        file_path = f"{ROOT_PATH}/{project_name}/{api_name}/marketing.csv"
        df = pd.read_csv(file_path)
        # customers_df = load_and_process_data(api_name)
        customers = df.to_dict(orient='records')
        return jsonify(customers), 200
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500


@app.route('/<api_name>/get_emails_by_segment', methods=['GET'])
def get_emails_by_segment(api_name):
    project_name = request.args.get('project_name')
    segment = request.args.get('segment')

    if not api_name:
        return jsonify({"error": "api_name parameter is required"}), 400
    if not project_name:
        return jsonify({"error": "project_name parameter is required"}), 400
    if not segment:
        return jsonify({"error": "segment parameter is required"}), 400

    try:
        file_path = f"{ROOT_PATH}/{project_name}/{api_name}/marketing.csv"
        df = pd.read_csv(file_path)

        # Filter customers by segment
        filtered_customers = df[df['Segment'] == segment]

        # Extract emails
        emails = filtered_customers['Email'].tolist()

        return jsonify({"emails": emails}), 200

    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/<api_name>/get_emails_by_subsegment', methods=['GET'])
def get_emails_by_subsegment(api_name):
    project_name = request.args.get('project_name')
    subsegment = request.args.get('subsegment')

    if not api_name:
        return jsonify({"error": "api_name parameter is required"}), 400
    if not project_name:
        return jsonify({"error": "project_name parameter is required"}), 400
    if not subsegment:
        return jsonify({"error": "subsegment parameter is required"}), 400

    try:
        file_path = f"{ROOT_PATH}/{project_name}/{api_name}/marketing.csv"
        df = pd.read_csv(file_path)

        # Filter customers by subsegment
        filtered_customers = df[df['Subsegment'] == subsegment]

        # Extract emails
        emails = filtered_customers['Email'].tolist()

        return jsonify({"emails": emails}), 200

    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Error Handling
@app.route('/')
def health_check():
    return jsonify({"message": "CSE Server is alive"}), 200


@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal Server Error"}), 500


@app.errorhandler(404)
def not_found_error(error):
    return jsonify({"error": "Resource Not Found"}), 404

if __name__ == '__main__':
    app.run(port=5000)
