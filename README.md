# Intelligent Sales Optimization (ISO) Platform

The Intelligent Sales Optimization (ISO) platform presents an effective solution to help retailers predict sales, segment customers, improve customer profiling, and generate prescriptive recommendations based on insights.
## Project Structure

```markdown
ISO/
├── cloud-based/
│   └── backend/
├── frontend/
├── server-storage/
│   ├── backend/
│   └── frontend/
├── training/
│   └── custom_functions/
│       ├── BYTD models.ipynb
│       ├── clv2.ipynb
│       ├── customer_segmentation.ipynb
│       ├── data_preprocessing_lab.ipynb
│       ├── model_training.ipynb
│   ├── online_retail_II.xlsx
│   ├── processed.csv
│   ├── processed_full.csv
│   ├── uk_daily_sales_full.csv
│   └── uk_dataset_full.csv
├── .gitattributes
└── .gitignore
```



## Instructions to Run the Project

### Backend Microservices

The backend consists of three main microservices and a Node.js REST API.

#### Running Microservices

1. Navigate to the project folder of each microservice:
    ```bash
    cd path_to_microservice_folder
    ```


2. Run the following command:
    ```bash
    python main.py
    ```
   
To run the prescriptive analystics engine you need to first get an API KEY for the Gemini LLM and plug it in the utility file

#### Running Microservices using Containers

1. Navigate to the backend folder:
    ```bash
    cd backend
    ```

2. Run the following command:
    ```bash
    docker-compose up --build
    ```

### Node.js REST API

1. Navigate to the Node.js REST API folder:
    ```bash
    cd path_to_nodejs_folder
    ```

2. Run the following command:
    ```bash
    node index.js
    ```

### Frontend

1. Navigate to the frontend folder:
    ```bash
    cd frontend
    ```

2. Install dependencies and run the development server:
    ```bash
    npm install
    npm run dev
    ```

### Accessing the Application

After all services are running, open your browser and navigate to:
 ```bash
  http://localhost:3000
   ```


## Storage Options

The application supports two storage options: cloud-based and server-storage.

- **Cloud-based:** Uses AWS S3 as the database.
- **Server-storage:** Saves the data on the local machine (server).

You can choose to run either of these storage options as per your requirements.

## Training

The `training` folder contains files for building custom functions and training the models.

- `BYTD models.ipynb`: Buy-Till-You-Die models.
- `clv2.ipynb`: Customer Lifetime Value.
- `customer_segmentation.ipynb`: Customer Segmentation.
- `data_preprocessing_lab.ipynb`: Data Preprocessing.
- `model_training.ipynb`: Model Training.

Datasets are also included in the `training` folder.

## Keywords

- E-commerce
- Sales Optimization
- Predictive Analytics
- Prescriptive Analytics
- Machine Learning
- Customer Segmentation
- Market Basket Analysis
- Time Series Forecasting
- Data-Driven Decision Making
- Large Language Models
- Buy-Till-You-Die Models

## Contact

For any issues or inquiries, please contact me at davidtgondo@gmail.com.

---

This README provides an overview and instructions on how to set up and run the ISO platform. The platform leverages various machine learning models and a microservices architecture to provide data-driven sales optimization recommendations for online retailers.

