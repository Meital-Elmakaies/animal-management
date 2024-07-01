# Animal Management System

## Description

The Animal Management System is a web application developed using the MERN stack to manage and track various animals. This project includes functionalities for adding, updating, and deleting animal records, as well as viewing detailed information about each animal.

## Technologies Used

- **Frontend**: React, Bootstrap
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Version Control**: Git, GitHub

## Features

- Add new animal records
- Update existing animal records
- Delete animal records
- View detailed information about each animal

## Installation and Setup

To get a local copy up and running, follow these steps:

### Prerequisites

- [Node.js](https://nodejs.org/) (v14.x or later)
- [Docker](https://www.docker.com/) (or [MongoDB](https://www.mongodb.com/) (driver) but preferred to use a Docker )

### Clone the Repository

```sh
git clone https://github.com/Meital-Elmakaies/animal-management.git
cd animal-management
```

### Setting Up

1. **Install Dependencies:**

   ```sh
   npm install
   ```

2. **Run MongoDB using Docker:**

   ```sh
   docker-compose up -d
   ```

   This will start a MongoDB instance. Ensure Docker is running on your machine.

3. **Start the React server:**

   ```sh
   npm start
   ```

   The backend server will run on `http://localhost:3000`.

4. **Admin Login:**

   To access the admin functionalities (adding, updating, deleting records), navigate to `http://localhost:3000/admin` and log in with the default credentials:

   ```sh
   Username: admin
   Password: admin
   ```

5. **Managing Animal Records:**

   - **Add a new animal**: Use the form on the admin page to add a new animal record.
   - **Update an existing animal**: Click on the animal card in the admin view, modify the details, and save.
   - **Delete an animal**: Click on the delete button on the animal card in the admin view.

## Contact

Meital Elmakaies - Meital.elmakaies@gmail.com

Project Link: [https://github.com/Meital-Elmakaies/animal-management](https://github.com/Meital-Elmakaies/animal-management)

## Acknowledgments

- [React](https://reactjs.org/)
- [Bootstrap](https://getbootstrap.com/)
- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [Docker](https://www.docker.com/)
- [MongoDB](https://www.mongodb.com/)
