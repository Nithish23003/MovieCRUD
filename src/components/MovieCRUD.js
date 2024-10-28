import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './MovieCRUD.css';

const API_URL = "https://srrjnwcp1l.execute-api.eu-central-1.amazonaws.com/dev";

const MovieCRUD = () => {
  const [movies, setMovies] = useState([]);
  const [newMovie, setNewMovie] = useState({
    firstName: '', lastName: '', email: '', comments: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [editableMovie, setEditableMovie] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false); // Confirmation state
  const [movieToDelete, setMovieToDelete] = useState(null); // Store movie ID for deletion
  const [errorMessage, setErrorMessage] = useState('');
  const itemsPerPage = 5;

  // Fetch all movies on component mount
  useEffect(() => {
    fetchMovies();
  }, [currentPage]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      const parsedBody = JSON.parse(response.data.body);

      if (Array.isArray(parsedBody)) {
        setMovies(parsedBody);
      } else {
        console.error("Parsed data is not an array:", parsedBody);
        setMovies([]);
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const validateInput = () => {
    const { firstName, lastName, email } = newMovie;

    // Check for empty fields
    if (!firstName || !lastName || !email) {
      setErrorMessage("All fields must be filled out.");
      return false;
    }

    // Check for letters only in firstName and lastName
    const nameRegex = /^[a-zA-Z]+$/;
    if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
      setErrorMessage("First Name and Last Name must contain only letters.");
      return false;
    }

    // Check for email format
    if (!email.endsWith("@gmail.com")) {
      setErrorMessage("Email must end with @gmail.com");
      return false;
    }

    setErrorMessage(''); // Clear error message if validation passes
    return true;
  };

  const createMovie = async () => {
    if (!validateInput()) {
        return; // Exit if validation fails
    }

    try {
      const response = await axios.post(API_URL, newMovie, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const createdMovie = JSON.parse(response.data.body);
      setMovies([...movies, createdMovie]);
      setNewMovie({ firstName: '', lastName: '', email: '', comments: '' });
      setShowForm(false); // Hide form after creation
    } catch (error) {
      console.error("Error creating movie:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingId) {
      setEditableMovie({ ...editableMovie, [name]: value });
    } else {
      setNewMovie({ ...newMovie, [name]: value });
    }
  };
  
  const handleEditClick = (movie) => {
    setEditingId(movie.id);
    setEditableMovie(movie);
  };
  
  const handleSaveClick = async () => {
    // Create the payload with the movie data to update, excluding 'id'
    const { id, ...updateData } = editableMovie; // Exclude 'id'
  
    const payload = {
      httpMethod: "PATCH",
      pathParameters: {
        id: editingId, // Keep the ID for path parameters
      },
      body: JSON.stringify(updateData), // The movie data to be updated
    };
  
    try {
      // Make the PATCH request to the API
      const response = await axios.patch(`${API_URL}`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      // Check the response for success
      console.log("Update response:", response.data);
      if (response.status === 200) {
        fetchMovies(); // Refresh the movies list after a successful update
        setEditingId(null);
        setEditableMovie({});
      }
    } catch (error) {
      console.error("Error updating movie:", error);
      if (error.response) {
        // Log response errors for better debugging
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
    }
  };

  
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditableMovie({});
  };
  
  const deleteMovie = async (id) => {
    const payload = {
      httpMethod: "DELETE",
      pathParameters: {
        id,  // The ID of the movie to delete
      },
    };
  
    try {
      // Make the DELETE request to the API
      await axios.delete(`${API_URL}`, { data: payload });
  
      // Update local state to remove the deleted movie
      setMovies(movies.filter((movie) => movie.id !== id));
      setShowConfirmDelete(false);
    } catch (error) {
      console.error("Error deleting movie:", error);
      if (error.response) {
        // Log response errors for better debugging
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
    }
  };  

  const confirmDeleteMovie = (id) => {
    setMovieToDelete(id);
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = () => {
    deleteMovie(movieToDelete);
  };

  const paginate = (direction) => {
    if (direction === 'next' && (currentPage * itemsPerPage) < movies.length) {
      setCurrentPage((prev) => prev + 1);
    } else if (direction === 'prev' && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // Calculate the displayed movies based on pagination
  const displayedMovies = movies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="body">
    <div className="container">
      <h1>Movie CRUD Management</h1>

      {/* Button to Show Create Form */}
      <button onClick={() => {
        setShowForm(true);
        setEditingId(null); // Reset editing state when showing form
        setEditableMovie({}); // Clear editable movie
      }}>
        Create Movie
      </button>

      {showForm && (
        <>
            {/* Overlay to dim the background */}
            <div className="overlay" onClick={() => setShowForm(false)}></div>

            {/* Form container */}
            <div className="form-container">
                <input
                    type="text"
                    name="firstName"
                    value={editingId ? editableMovie.firstName : newMovie.firstName}
                    onChange={handleInputChange}
                    placeholder="First Name"
                />
                <input
                    type="text"
                    name="lastName"
                    value={editingId ? editableMovie.lastName : newMovie.lastName}
                    onChange={handleInputChange}
                    placeholder="Last Name"
                />
                <input
                    type="email"
                    name="email"
                    value={editingId ? editableMovie.email : newMovie.email}
                    onChange={handleInputChange}
                    placeholder="Email"
                />
                <textarea
                    name="comments"
                    value={editingId ? editableMovie.comments : newMovie.comments}
                    onChange={handleInputChange}
                    placeholder="Comments"
                ></textarea>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                {editingId ? (
                    <button onClick={handleSaveClick}>Update Movie</button>
                ) : (
                    <button onClick={createMovie}>Save Movie</button>
                )}
                <button className="close-btn" onClick={() => setShowForm(false)}>
                    Close
                </button>
            </div>
        </>
        )}

      {/* Movie List with Pagination */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Comments</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedMovies.map((movie) => (
              editingId === movie.id ? (
                // Render editable row when in edit mode
                <tr key={movie.id}>
                  <td>
                    <input
                      type="text"
                      name="firstName"
                      value={editableMovie.firstName}
                      onChange={handleInputChange}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="lastName"
                      value={editableMovie.lastName}
                      onChange={handleInputChange}
                    />
                  </td>
                  <td>
                    <input
                      type="email"
                      name="email"
                      value={editableMovie.email}
                      onChange={handleInputChange}
                    />
                  </td>
                  <td>
                    <textarea
                      name="comments"
                      value={editableMovie.comments}
                      onChange={handleInputChange}
                    ></textarea>
                  </td>
                  <td>
                    <button onClick={handleSaveClick}>Save</button>
                    <button onClick={handleCancelEdit}>Cancel</button>
                  </td>
                </tr>
              ) : (
                // Render regular row when not in edit mode
                <tr key={movie.id}>
                  <td>{movie.firstName}</td>
                  <td>{movie.lastName}</td>
                  <td>{movie.email}</td>
                  <td>{movie.comments}</td>
                  <td>
                    <button onClick={() => handleEditClick(movie)}>Edit</button>
                    <button onClick={() => confirmDeleteMovie(movie.id)}>Delete</button>
                  </td>
                </tr>
              )
            ))}
          </tbody>
        </table>
      )}

      {/* Confirmation Popup */}
      {showConfirmDelete && (
          <div className="confirmation-popup">
            <p>Are you sure you want to delete this review?</p>
            <button onClick={handleConfirmDelete}>Yes</button>
            <button onClick={() => setShowConfirmDelete(false)}>No</button>
          </div>
        )}

      {/* Pagination Controls */}
      <div>
        <button onClick={() => paginate('prev')} disabled={currentPage === 1}>
          Previous
        </button>
        <span>Page {currentPage}</span>
        <button
          onClick={() => paginate('next')}
          disabled={(currentPage * itemsPerPage) >= movies.length}
        >
          Next
        </button>
      </div>
    </div>
    </div>
  );
}

export default MovieCRUD;
