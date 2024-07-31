# Segmenting customers
import pandas as pd
from faker import Faker
from lifetimes.utils import summary_data_from_transaction_data
from lifetimes import BetaGeoFitter, GammaGammaFitter


def prepare_data(df, customer_id_col, datetime_col, monetary_value_col, observation_period_end):
    summary = summary_data_from_transaction_data(
        df,
        customer_id_col=customer_id_col,
        datetime_col=datetime_col,
        monetary_value_col=monetary_value_col,
        observation_period_end=observation_period_end
    )
    summary = summary[summary["monetary_value"] > 0]
    print("Done fitting..")
    return summary


def fit_models(summary):
    print("Fitting...")
    bgf = BetaGeoFitter(penalizer_coef=0.5)
    bgf.fit(summary['frequency'], summary['recency'], summary['T'])
    print("Gamma Fittiing...")

    ggf = GammaGammaFitter(penalizer_coef=0.0)
    ggf.fit(summary['frequency'], summary['monetary_value'])

    return bgf, ggf


def predict_variables(summary, bgf, ggf, threshold):
    summary['probability_alive'] = bgf.conditional_probability_alive(
        summary['frequency'],
        summary['recency'],
        summary['T']
    )
    summary['predicted_purchases'] = bgf.predict(30, summary['frequency'], summary['recency'], summary['T'])
    summary['predicted_clv'] = ggf.customer_lifetime_value(
        bgf,
        summary['frequency'],
        summary['recency'],
        summary['T'],
        summary['monetary_value'],
        time=1,  # Lifetime expected for the user in months
        freq='D',
        discount_rate=0.01
    )
    summary["estimated_monetary_value"] = ggf.conditional_expected_average_profit(
        summary['frequency'],
        summary['monetary_value']
    )
    return summary


def create_segment_columns(df, recency, frequency, monetary_value, clv):
    df['R_score'] = pd.qcut(df[recency], q=3, labels=[1, 2, 3])
    df['F_score'] = pd.qcut(df[frequency], q=3, labels=[1, 2, 3])
    df['M_score'] = pd.qcut(df[monetary_value], q=3, labels=[1, 2, 3])
    df['CLV_segment'] = pd.qcut(df[clv], q=3, labels=['Low CLV', 'Medium CLV', 'High CLV'])

    rfm_mapping = {'111': 'High Value', '112': 'High Value', '113': 'Risk', '121': 'High Value', '122': 'Nurture',
                   '123': 'Risk', '131': 'High Value', '132': 'Nurture', '133': 'Risk', '211': 'Nurture',
                   '212': 'Nurture',
                   '213': 'Risk', '221': 'Nurture', '222': 'Nurture', '223': 'Risk', '231': 'Risk', '232': 'Risk',
                   '233': 'Risk',
                   '311': 'Risk', '312': 'Risk', '313': 'Risk', '321': 'Risk', '322': 'Risk', '323': 'Risk',
                   '331': 'Risk',
                   '332': 'Risk', '333': 'Risk'}

    df['RFM'] = df['R_score'].astype(str) + df['F_score'].astype(str) + df['M_score'].astype(str)
    df['Segment'] = df['RFM'].map(rfm_mapping)
    df['Subsegment'] = df['Segment'].astype(str) + ', ' + df['CLV_segment'].astype(str)
    # df["CustomerID"] = df.index
    df = df.reset_index()
    df.drop(columns=['R_score', 'F_score', 'M_score'], inplace=True)

    return df


def calculate_segment_percentages(df):
    total_customers = len(df)
    segment_counts = df['Segment'].value_counts()
    segment_percentages = (segment_counts / total_customers * 100).round(2)
    subsegment_counts = df['Subsegment'].value_counts()
    subsegment_percentages = (subsegment_counts / total_customers * 100).round(2)
    percentages_dict = {
        'Segment': segment_percentages.to_dict(),
        'Subsegment': subsegment_percentages.to_dict()
    }
    return percentages_dict


def calculate_descriptive_statistics(df, fields):
    segment_stats = df.groupby('Segment')[fields].agg(['mean', 'std', 'median']).reset_index()
    subsegment_stats = df.groupby('Subsegment')[fields].agg(['mean', 'std', 'median']).reset_index()
    segment_stats.columns = ['_'.join(col).strip() if isinstance(col, tuple) else col for col in
                             segment_stats.columns.values]
    subsegment_stats.columns = ['_'.join(col).strip() if isinstance(col, tuple) else col for col in
                                subsegment_stats.columns.values]
    percentages_dict = calculate_segment_percentages(df)
    all_data_dict = {
        'segment_stats': segment_stats.to_dict(orient='records'),
        'subsegment_stats': subsegment_stats.to_dict(orient='records'),
        'percentages': percentages_dict
    }
    return segment_stats, subsegment_stats, percentages_dict, all_data_dict


def create_marketing_data(df):
    # Create the 'Status' column based on 'probability_alive'
    df['Status'] = df['probability_alive'].apply(
        lambda x: 'inactive' if x < 0.4 else 'regular' if x < 0.6 else 'active')

    # Create a Faker instance
    fake = Faker()

    # List of emails to include
    specific_emails = ['davidtgondo@gmail.com', 'd.gondo@alustudent.com']

    # Function to generate emails
    def generate_email(index):
        if index < len(specific_emails):
            return specific_emails[index]
        return fake.email()

    # Generate emails and ensure specific emails are included
    df['Email'] = [generate_email(i) for i in range(len(df))]

    # Set segment to 'Test' for specific emails
    df.loc[df['Email'].isin(specific_emails), 'Segment'] = 'Test'

    # Select the required columns
    result_df = df[['CustomerID', 'Email', 'Segment', 'Subsegment', 'Status']]

    return result_df


