## Use an official Python runtime as a parent image
#FROM python:3.10-slim
#
## Set the working directory in the container
#WORKDIR /usr/src/app
#
## Install system dependencies and Rust
#RUN apt-get update && apt-get install -y \
#    build-essential \
#    libpq-dev \
#    curl \
#    && rm -rf /var/lib/apt/lists/* \
#    && curl https://sh.rustup.rs -sSf | sh -s -- -y
#
## Update PATH environment variable for Rust
#ENV PATH="/root/.cargo/bin:${PATH}"
#
## Copy the requirements file first to leverage Docker cache
#COPY requirements.txt .
#
## Install Python dependencies
#RUN pip install --no-cache-dir -r requirements.txt
#
## Copy the current directory contents into the container at /usr/src/app
#COPY . .
#
## Make port 5001 available to the world outside this container
#EXPOSE 5001
#
## Define environment variable
#ENV FLASK_APP=main.py
#
## Run app.py when the container launches
#CMD ["python", "-m", "flask", "run", "--host=0.0.0.0", "--port=5001"]
# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Install system dependencies and Rust
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && curl https://sh.rustup.rs -sSf | sh -s -- -y

# Update PATH environment variable for Rust
ENV PATH="/root/.cargo/bin:${PATH}"

# Copy the requirements file first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the current directory contents into the container at /usr/src/app
COPY . .

# Make port 5001 available to the world outside this container
EXPOSE 5001

# Define environment variable
ENV FLASK_APP=main.py

# Run app.py when the container launches
CMD ["python", "-m", "flask", "run", "--host=0.0.0.0", "--port=5001"]
