import json
import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from langchain.chains.conversation.base import ConversationChain
from langchain_google_genai import GoogleGenerativeAI

from utility_methods import generate_customer_segmentation_recommendations, generate_sales_recommendations, \
    GOOGLE_API_KEY, \
    ROOT_PATH

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})


@app.route('/create-recommendations', methods=['GET'])
def create_recommendations():
    try:
        api_name = request.args.get('api_name')
        project_name = request.args.get('project_name')
        project_path = os.path.join(ROOT_PATH, project_name)
        full_folder_path = os.path.join(project_path, api_name)

        if not api_name:
            return jsonify({"error": "API name is required"}), 400

        forecast_json_path = os.path.join(full_folder_path, "forecast_details.json")
        objectives_json_path = os.path.join(full_folder_path, "business_objectives.json")
        all_data_json_path = os.path.join(project_path, "segment_compositions.json")

        # Print the paths for debugging
        print(f"forecast_json_path: {forecast_json_path}")
        print(f"objectives_json_path: {objectives_json_path}")
        print(f"all_data_json_path: {all_data_json_path}")

        # Error handling for files with detailed error message
        if not os.path.exists(forecast_json_path):
            print(f"Forecast details JSON file not found: {forecast_json_path}")
            return jsonify({"error": f"Forecast details JSON file not found: {forecast_json_path}"}), 404

        if not os.path.exists(objectives_json_path):
            print(f"Business objectives JSON file not found: {objectives_json_path}")
            return jsonify({"error": f"Business objectives JSON file not found: {objectives_json_path}"}), 404

        if not os.path.exists(all_data_json_path):
            print(f"All data JSON file not found: {all_data_json_path}")
            return jsonify({"error": f"All data JSON file not found: {all_data_json_path}"}), 404

        print("Files found. Loading data...")

        # Load data from JSON files using standard json library
        with open(forecast_json_path, 'r') as f:
            forecast_data = json.load(f)

        with open(objectives_json_path, 'r') as f:
            business_objectives = json.load(f)

        with open(all_data_json_path, 'r') as f:
            all_data = json.load(f)

        # Generate recommendations
        sales_recommendations = generate_sales_recommendations(forecast_data, business_objectives)
        customer_recommendations = generate_customer_segmentation_recommendations(business_objectives, all_data)

        # Save to files as markdown
        with open(f'{full_folder_path}/sales_recommendations.md', 'w') as sales_file:
            sales_file.write(sales_recommendations)

        with open(f'{full_folder_path}/customer_recommendations.md', 'w') as customer_file:
            customer_file.write(customer_recommendations)

        print("Recommendations created and saved successfully.")
        return jsonify({"message": "Recommendations created and saved successfully"}), 201

    except Exception as e:
        print(f"Exception: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/<api_name>/get-recommendations', methods=['GET'])
def get_recommendations(api_name):
    project_name = request.args.get('project_name')
    project_path = os.path.join(ROOT_PATH, project_name)
    full_folder_path = os.path.join(project_path, api_name)

    if not api_name:
        return jsonify({"error": "API name is required"}), 400

    if not os.path.exists(full_folder_path):
        return jsonify({"error": "API directory not found"}), 404

    try:
        with open(f'{full_folder_path}/sales_recommendations.md', 'r') as sales_file:
            sales_recommendations = sales_file.read()

        with open(f'{full_folder_path}/customer_recommendations.md', 'r') as customer_file:
            customer_recommendations = customer_file.read()
    except FileNotFoundError:
        return jsonify({"error": "Recommendation files not found"}), 404

    return jsonify({
        "sales_recommendations": sales_recommendations,
        "customer_segmentation_recommendations": customer_recommendations
    }), 200


@app.route("/generate-analysis", methods=["GET"])
def generate_descriptive_analysis():
    try:
        # Get the api_name from the request
        api_name = request.args.get('api_name')
        project_name = request.args.get('project_name')
        root_path = f"{ROOT_PATH}/{project_name}"
        report_path = f"{ROOT_PATH}/{project_name}/{api_name}"
        print(report_path)
        # Load customer segment data
        with open(f"{root_path}/segment_compositions.json", 'r') as file:
            segment_data = file.read()

        # Load sales forecast data
        with open(f"{report_path}/forecast_details.json", 'r') as file:
            sales_data = file.read()

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
        customer_response = client.generate([customer_prompt])
        customer_analysis = customer_response.generations[0][0].text

        # Generate analysis for sales forecast
        sales_response = client.generate([sales_prompt])
        sales_analysis = sales_response.generations[0][0].text

        # Save responses to files
        customer_analysis_path = f"{report_path}/segment_description.md"
        sales_analysis_path = f"{report_path}/sales_description.md"

        with open(customer_analysis_path, "w") as file:
            file.write(customer_analysis)

        with open(sales_analysis_path, "w") as file:
            file.write(sales_analysis)

        print("Success")

        return jsonify({
            "customer_analysis": customer_analysis,
            "sales_analysis": sales_analysis
        }), 200

    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500


@app.route('/<api_name>/get-sales-descriptions', methods=['GET'])
def get_sales_descriptions(api_name):
    try:
        project_name = request.args.get('project_name')
        project_path = os.path.join(ROOT_PATH, project_name)
        full_folder_path = os.path.join(project_path, api_name)

        if not api_name:
            return jsonify({"error": "api_name parameter is required"}), 400

        description_path = os.path.join(full_folder_path, 'sales_description.md')
        print(description_path)

        if not os.path.exists(description_path):
            print("Not found")
            return jsonify({"error": "Sales description file not found"}), 404

        with open(description_path, 'r') as file:
            sales_description = file.read()

        return jsonify({"sales_description": sales_description}), 200

    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500


@app.route('/<api_name>/get-segmentation-description', methods=['GET'])
def get_segmentation_description(api_name):
    try:
        project_name = request.args.get('project_name')
        project_path = os.path.join(ROOT_PATH, project_name)
        full_folder_path = os.path.join(project_path, api_name)

        description_path = os.path.join(full_folder_path, 'segment_description.md')
        print(description_path)

        if not os.path.exists(description_path):
            print("Not found")
            return jsonify({"error": "Segmentation description file not found"}), 404

        with open(description_path, 'r') as file:
            analysis = file.read()

        return jsonify({"analysis": analysis}), 200

    except Exception as e:
        print(e)
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
