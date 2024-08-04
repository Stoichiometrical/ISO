from langchain.chains import ConversationChain
from langchain_google_genai import GoogleGenerativeAI

#
API_1 = "http://127.0.0.1:5000"  #segmentation
API_2 = "http://127.0.0.1:5001"  #prescriptive
API_3 = "http://127.0.0.1:5002"  #predictive
ROOT_PATH = "../s3"

# Load API key from .env file

GOOGLE_API_KEY = "GOOGLE_API_KEY"


def generate_sales_recommendations(forecast_data, business_objectives):
    sales_forecast = [
        {
            'date': entry['date'],
            'sales_quantity': entry['sales_quantity'],
        }
        for entry in forecast_data
    ]

    promo_days = [entry['date'] for entry in forecast_data if entry['promotion_type'] is not None]
    promo_types = [entry['promotion_type'] for entry in forecast_data if entry['promotion_type'] is not None]

    # Prepare sales prompt
    sales_prompt = f"""
    As a world-class business consultant AI agent, your task is to analyze the sales forecast data and provide actionable insights relevant to strategic planning for an e-commerce retailer. Describe the sales forecast data, highlighting any key insights that can aid in strategic planning.
     sales forecast data : {sales_forecast}
     promo datas : {promo_days} {promo_types}
     objectives : {business_objectives}

    1. Sales Forecast Data Description:
       - Provide a detailed overview of the sales forecast data, including historical trends, seasonal variations, and any anomalies or patterns observed.
       - Highlight key metrics such as total sales volume, revenue projections, and product performance.
       - Identify any external factors (e.g., market trends, economic conditions) that may impact sales.


    2. Insights for Strategic Planning:
       - Analyze the sales forecast data to identify trends, opportunities, and potential risks for the business.
       - Provide actionable insights that align with the retailer's business objectives, such as increasing revenue, expanding market share, or improving customer retention.
       - Recommend strategic initiatives based on the analysis, such as product launches, pricing adjustments, or targeted marketing campaigns.

    3. Marketing Campaigns for Peak and Lull Periods:
       - Based on the identified peak and lull periods in the sales forecast data, create two marketing campaigns: one for the lull periods and another for the peak periods.
       - For the peak periods, design a campaign that capitalizes on increased consumer demand, leveraging promotions, discounts, and exclusive offers to drive sales.
       - For the lull periods, devise a campaign to stimulate sales and maintain customer engagement during slower periods. Consider offering limited-time promotions, bundle deals, or loyalty rewards to incentivize purchases.
       - Provide specific details for each campaign, including target audience, messaging, creative assets, and promotion channels (e.g., email marketing, social media, paid advertising).
       - Ensure that the campaigns are actionable and tailored to the retailer's target market and brand identity.

    4. Promotional Days or Offers:
       - Evaluate whether it's appropriate to designate lull periods as promotional days or offer special promotions during these times.
       - Consider factors such as customer behavior, competitive landscape, and business objectives when making recommendations.
       - Offer expert advice on the potential impact of promotional days or offers on sales, customer satisfaction, and long-term brand perception.
       - Provide insights into the optimal timing, duration, and format of promotions to maximize effectiveness and ROI.

    5. Expert Advice and Business Objectives Alignment:
       - Offer expert advice on how the retailer can leverage sales forecast data and marketing strategies to achieve its business objectives.
       - Emphasize the importance of aligning marketing efforts with overarching business goals, such as driving revenue growth, increasing customer lifetime value, or enhancing brand loyalty.
       - Recommend KPIs and performance metrics to track the success of marketing campaigns and measure their impact on business outcomes.
       - Provide actionable recommendations for continuous improvement and optimization based on real-time data analysis and market feedback.

    Your insights and recommendations should empower the e-commerce retailer to make informed decisions and execute effective marketing strategies that drive sales and foster long-term success.
    """

    # Initialize Google Generative AI
    client = GoogleGenerativeAI(model="gemini-pro", api_key=GOOGLE_API_KEY)
    chain = ConversationChain(llm=client)

    # Generate recommendations using Google Generative AI
    response = client.generate([sales_prompt])
    recommendations = response.generations[0][0].text

    return recommendations


def generate_customer_segmentation_recommendations(business_objectives, all_data):
    # Format customer segmentation insights
    segment_stats = all_data.get('segment_stats', [])
    subsegment_stats = all_data.get('subsegment_stats', [])
    percentages = all_data.get('percentages', {})

    # Format for better readability in the prompt
    formatted_segment_stats = "\n".join([f"- {segment['Segment_']}: {segment}" for segment in segment_stats])
    formatted_subsegment_stats = "\n".join(
        [f"- {subsegment['Subsegment_']}: {subsegment}" for subsegment in subsegment_stats])
    formatted_percentages = "\n".join([f"- {key}: {value}" for key, value in percentages.items()])

    customer_segmentation_insights = f"""
    **Segment Statistics:**

    {formatted_segment_stats}

    **Subsegment Statistics:**

    {formatted_subsegment_stats}

    **Percentages:**

    {formatted_percentages}
    """

    # Create a more focused prompt by including specific business objectives
    customer_segmentation_prompt = f"""
    As a top-tier business consultant AI agent, your role is to analyze the customer segmentation results for an e-commerce retailer and develop actionable strategies to reach the following objectives by targeting specific customer segments. Additionally, evaluate custom offers that could be given to customers during promotional periods.

    **Customer Segmentation Insights:**
    {customer_segmentation_insights}

    **Business Objectives:**
    * Sales Goals:
        {business_objectives['sales_goals']}
    * Segmentation Goals:
        {business_objectives['segmentation_goals']}

    Provide recommendations that are:
    1.  **Actionable:**  Specific steps the retailer can take, not just general ideas.
    2.  **Measurable:** Include ways to track the success of the recommendations.
    3.  **Tailored:** Aligned with the retailer's identified customer segments and business goals.

    """

    # Initialize Google Generative AI
    client = GoogleGenerativeAI(model="gemini-pro", api_key=GOOGLE_API_KEY)
    chain = ConversationChain(llm=client)

    # Generate recommendations
    response = client.generate([customer_segmentation_prompt])
    recommendations = response.generations[0][0].text

    return recommendations
