# CRUD Express Project

This is a simple CRUD project using Node.js and Express to manage user data.

## Requirements

- [Node.js](https://nodejs.org/) (v14 or later)
- [MongoDB](https://www.mongodb.com/) (ensure MongoDB server is running)

## Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/username/crud-express.git
   cd crud-express
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure the `.env` file:

   Create a `.env` file in the project folder and add the following configuration:

   ```env
   PORT=5000
   DB_CONNECT=mongodb://localhost:27017/crud-express
   SECRET_KEY=your_secret_key
   ```

   Replace `your_secret_key` with the secret key of your choice.

## Running the Application

1. Start the MongoDB server.

2. Run the application:

   ```bash
   npm start
   ```

   Or if you want to use nodemon for development:

   ```bash
   npm run dev
   ```

   The application will run at [http://localhost:5000](http://localhost:5000).

## Usage

You can access the API through the following endpoints:

- **GET Users:** `GET /users`
- **GET Single User:** `GET /users/:id`
- **Create User:** `POST /users`
- **Update User:** `PUT /users/:id`
- **Delete User:** `DELETE /users/:id`

Any operation that requires authentication must include a token in the header using the Bearer scheme.

## Contributions

If you encounter issues or want to contribute to this project, please open an issue or submit a pull request.

Thank you for using this project!
