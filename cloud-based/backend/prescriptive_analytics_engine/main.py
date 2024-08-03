import json
import os
import io
import logging
from flask import Flask, jsonify, request
from flask_cors import CORS
from langchain.chains.conversation.base import ConversationChain
from langchain_google_genai import GoogleGenerativeAI
import boto3

from utility_methods import generate_customer_segmentation_recommendations, generate_sales_recommendations, GOOGLE_API_KEY

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s:%(message)s')

# AWS S3 Configuration
AWS_BUCKET_NAME = 'iso-datalake'

s3_client = boto3.client('s3')

def read_json_from_s3(bucket_name, object_name):
    """Read a JSON file from S3"""
    try:
        logging.info(f"Reading JSON file {object_name} from bucket {bucket_name}")
        response = s3_client.get_object(Bucket=bucket_name, Key=object_name)
        return json.loads(response['Body'].read().decode('utf-8'))
    except Exception as e:
        logging.error(f"Failed to read JSON from S3: {e}")
        raise

def read_md_from_s3(bucket_name, object_name):
    """Read a markdown file from S3"""
    try:
        logging.info(f"Reading markdown file {object_name} from bucket {bucket_name}")
        response = s3_client.get_object(Bucket=bucket_name, Key=object_name)
        return response['Body'].read().decode('utf-8')
    except Exception as e:
        logging.error(f"Failed to read markdown from S3: {e}")
        raise

def upload_to_s3(file_obj, bucket_name, object_name):
    """Upload a file-like object to an S3 bucket"""
    try:
        logging.info(f"Uploading file {object_name} to bucket {bucket_name}")
        s3_client.upload_fileobj(file_obj, bucket_name, object_name)
        logging.info(f"File {object_name} uploaded to bucket {bucket_name}")
    except Exception as e:
        logging.error(f"Failed to upload to S3: {e}")
        raise

@app.route('/create-recommendations', methods=['GET'])
def create_recommendations():
    try:
        api_name = request.args.get('api_name')
        project_name = request.args.get('project_name')
        full_folder_path = f"{project_name}/{api_name}/"

        if not api_name:
            return jsonify({"error": "API name is required"}), 400

        forecast_json_path = os.path.join(full_folder_path, "forecast_details.json").replace("\\", "/")
        objectives_json_path = os.path.join(full_folder_path, "business_objectives.json").replace("\\", "/")
        all_data_json_path = os.path.join(project_name, "segment_compositions.json").replace("\\", "/")

        # Error handling for files with detailed error message
        forecast_data = read_json_from_s3(AWS_BUCKET_NAME, forecast_json_path)
        business_objectives = read_json_from_s3(AWS_BUCKET_NAME, objectives_json_path)
        all_data = read_json_from_s3(AWS_BUCKET_NAME, all_data_json_path)

        # Generate recommendations
        sales_recommendations = generate_sales_recommendations(forecast_data, business_objectives)
        customer_recommendations = generate_customer_segmentation_recommendations(business_objectives, all_data)

        # Save to files as markdown
        sales_recommendations_path = os.path.join(full_folder_path, 'sales_recommendations.md').replace("\\", "/")
        customer_recommendations_path = os.path.join(full_folder_path, 'customer_recommendations.md').replace("\\", "/")

        sales_buffer = io.StringIO(sales_recommendations)
        upload_to_s3(io.BytesIO(sales_buffer.getvalue().encode()), AWS_BUCKET_NAME, sales_recommendations_path)

        customer_buffer = io.StringIO(customer_recommendations)
        upload_to_s3(io.BytesIO(customer_buffer.getvalue().encode()), AWS_BUCKET_NAME, customer_recommendations_path)

        return jsonify({"message": "Recommendations created and saved successfully"}), 201

    except Exception as e:
        logging.error(f"Exception in create_recommendations: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/<api_name>/get-recommendations', methods=['GET'])
def get_recommendations(api_name):
    project_name = request.args.get('project_name')
    full_folder_path = f"{project_name}/{api_name}/"

    if not api_name:
        return jsonify({"error": "API name is required"}), 400

    try:
        sales_recommendations_path = os.path.join(full_folder_path, 'sales_recommendations.md').replace("\\", "/")
        customer_recommendations_path = os.path.join(full_folder_path, 'customer_recommendations.md').replace("\\", "/")

        sales_recommendations = read_md_from_s3(AWS_BUCKET_NAME, sales_recommendations_path)
        customer_recommendations = read_md_from_s3(AWS_BUCKET_NAME, customer_recommendations_path)

        return jsonify({
            "sales_recommendations": sales_recommendations,
            "customer_segmentation_recommendations": customer_recommendations
        }), 200

    except Exception as e:
        logging.error(f"Error in get_recommendations: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/generate-analysis", methods=["GET"])
def generate_descriptive_analysis():
    try:
        # Get the api_name from the request
        api_name = request.args.get('api_name')
        project_name = request.args.get('project_name')
        report_path = f"{project_name}/{api_name}"

        # Load customer segment data
        segment_data = read_json_from_s3(AWS_BUCKET_NAME, f"{project_name}/segment_compositions.json".replace("\\", "/"))

        # Load sales forecast data
        sales_data = read_json_from_s3(AWS_BUCKET_NAME, f"{report_path}/forecast_details.json".replace("\\", "/"))

        # Construct the prompt for customer segments
        customer_prompt = f"""
            You're a seasoned consultant tasked with distilling the essence of customer data analysis for a business owner. The data at hand comprises percentages of customer segments, along with descriptive statistics for various metrics such as predicted purchases, predicted CLV, probability alive, and estimated monetary value. The data at hand originates from sophisticated probabilistic models such as BG/NBD and GammaGamma, processed using the Lifetimes Python library. Your mission is to articulate the significance of these insights in a language a non-technical business owner would understand. The goal is to give them a comprehensive understanding of what their customer data shows and means about their customers. Title your Descriptive Analysis as Customer Insights.

            Explain what each of the metrics means for the segment characteristics, e.g., what does having a certain predicted purchases, probability of being alive, monetary value, etc., indicate about the nature of the segment. Also explain what the descriptive statistics mean for the values. Talk like this for example: Segment High Value and Low CLV are 25% of the customer base and have a predicted monetary value of $200 and probability of being alive of 0.6, this means that they are predicted to bring in more value and are less likely to stop using our service.
            Now here is my data and its measures of dispersion for the various attributes:

            {segment_data}
            """

        # Construct the prompt for sales forecast
        sales_prompt = f"""
            You're a seasoned consultant tasked with interpreting sales forecast data and promotional days for a business owner. The data is given in a structured format, and your mission is to provide a comprehensive understanding of what the forecast data means and what the promotional days might signify for the business.

            Here's the sales data and promotional periods:

            {sales_data}

            Your expertise is crucial in explaining these insights and helping the business owner understand their sales and promotional strategy better. Please provide a detailed description.
            """

        # Initialize Google Generative AI
        client = GoogleGenerativeAI(model="gemini-pro", api_key=GOOGLE_API_KEY)
        chain = ConversationChain(llm=client)

        # Generate analysis for customer segments
        logging.info("Generating analysis for customer segments")
        customer_response = client.generate([customer_prompt])
        customer_analysis = customer_response.generations[0][0].text

        # Generate analysis for sales forecast
        logging.info("Generating analysis for sales forecast")
        sales_response = client.generate([sales_prompt])
        sales_analysis = sales_response.generations[0][0].text

        # Save responses to files
        customer_analysis_path = os.path.join(report_path, "segment_description.md").replace("\\", "/")
        sales_analysis_path = os.path.join(report_path, "sales_description.md").replace("\\", "/")

        customer_buffer = io.StringIO(customer_analysis)
        upload_to_s3(io.BytesIO(customer_buffer.getvalue().encode()), AWS_BUCKET_NAME, customer_analysis_path)

        sales_buffer = io.StringIO(sales_analysis)
        upload_to_s3(io.BytesIO(sales_buffer.getvalue().encode()), AWS_BUCKET_NAME, sales_analysis_path)

        return jsonify({
            "customer_analysis": customer_analysis,
            "sales_analysis": sales_analysis
        }), 200

    except Exception as e:
        logging.error(f"Error in generate_descriptive_analysis: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/<api_name>/get-sales-descriptions', methods=['GET'])
def get_sales_descriptions(api_name):
    try:
        project_name = request.args.get('project_name')
        full_folder_path = f"{project_name}/{api_name}/"

        if not api_name:
            return jsonify({"error": "api_name parameter is required"}), 400

        description_path = os.path.join(full_folder_path, 'sales_description.md').replace("\\", "/")
        logging.info(f"Fetching sales descriptions from {description_path}")

        sales_description = read_md_from_s3(AWS_BUCKET_NAME, description_path)

        return jsonify({"sales_description": sales_description}), 200

    except Exception as e:
        logging.error(f"Error in get_sales_descriptions: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/<api_name>/get-segmentation-description', methods=['GET'])
def get_segmentation_description(api_name):
    try:
        project_name = request.args.get('project_name')
        full_folder_path = f"{project_name}/{api_name}/"

        description_path = os.path.join(full_folder_path, 'segment_description.md').replace("\\", "/")
        logging.info(f"Fetching segmentation descriptions from {description_path}")

        analysis = read_md_from_s3(AWS_BUCKET_NAME, description_path)

        return jsonify({"analysis": analysis}), 200

    except Exception as e:
        logging.error(f"Error in get_segmentation_description: {e}")
        return jsonify({"error": str(e)}), 500

# Error Handling
@app.route('/')
def health_check():
    return jsonify({"message": "PAE Server is alive"}), 200

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal Server Error"}), 500

@app.errorhandler(404)
def not_found_error(error):
    return jsonify({"error": "Resource Not Found"}), 404

if __name__ == '__main__':
    app.run(port=5001)