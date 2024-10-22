import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import axios from 'axios';
import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link, 
  useParams, 
  useNavigate
} from "react-router-dom";

interface Artwork {
  id: number;
  title: string;
  image_id: string;
  artist_display: string;
  date_display: string;
}

const mockArtworks: Artwork[] = [
  {
    id: 1,
    title: "Art Piece 1",
    image_id: "12345",
    artist_display: "Artist One",
    date_display: "2020",
  },
  {
    id: 2,
    title: "Art Piece 2",
    image_id: "67890",
    artist_display: "Artist Two",
    date_display: "2021",
  },
];

function App() {
  return (
    <Router>
      <div className="App">
        <div className="page-title-container">
          <Link to="/">The Art Institute of Chicago</Link>
        </div>
        <nav className="sections">
          <ul>
            <li>
              <Link to="/search">Search</Link>
            </li>
            <li>
              <Link to="/gallery">Gallery</Link>
            </li>
          </ul>
        </nav>
        <div className="content-container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/artwork/:id" element={<ArtworkDetail />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

function Home() {
  return (
    <div className="home-container">
    </div>
  );
}

// SEARCH FUNCTIONALITY
function Search() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [filteredArtworks, setFilteredArtworks] = useState<Artwork[]>([]);
  const [query, setQuery] = useState('');
  const [sortOption, setSortOption] = useState('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isLoading, setIsLoading] = useState(false);
  const limit = 100;

  useEffect(() => {
    setIsLoading(true);

    const apiAvailable = true; // set to true when API is back up
    if (apiAvailable) {
      axios.get(`https://api.artic.edu/api/v1/artworks?page=1&limit=${limit}&fields=id,title,artist_display,date_display,image_id`)
        .then(response => {
          const artData: Artwork[] = response.data.data;
          setArtworks(artData);
          setFilteredArtworks(artData);
          setIsLoading(false);
        })
        .catch(error => {
          console.error("Error fetching artworks:", error);
          setIsLoading(false);
        });
    } else {
      // Use mock data when API is not available
      setArtworks(mockArtworks);
      setFilteredArtworks(mockArtworks);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const filtered = artworks.filter(artwork => 
      artwork.title.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredArtworks(filtered);
  }, [query, artworks]);

  useEffect(() => {
    const sorted = [...filteredArtworks].sort((a, b) => {
      const valA = a[sortOption as keyof Artwork].toString().toLowerCase();
      const valB = b[sortOption as keyof Artwork].toString().toLowerCase();
      if (sortOrder === 'asc') {
        return valA < valB ? -1 : valA > valB ? 1 : 0;
      } else {
        return valA > valB ? -1 : valA < valB ? 1 : 0;
      }
    });
    setFilteredArtworks(sorted);
  }, [sortOption, sortOrder, filteredArtworks]);

  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Search artworks"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="search-bar"
      />

      <div className="sort-options">
        <label htmlFor="sort-by">Sort by:</label>
        <select className="sort-select"
          id="sort-by"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="title">Title</option>
          <option value="artist_display">Artist</option>
          <option value="date_display">Date</option>
        </select>

        <button className="asc_desc_button" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
          {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
        </button>
      </div>

      <div className="artworks-grid">
        {filteredArtworks.map((artwork) => (
          <Link to={`/artwork/${artwork.id}`} key={artwork.id} className="artwork-item">
            <img
              src={`https://www.artic.edu/iiif/2/${artwork.image_id}/full/200,/0/default.jpg`}
              alt={artwork.title}
              className="artwork-image"
            />
            <p>{artwork.title}</p>
            <p>Artist: {artwork.artist_display}</p>
            <p>Date: {artwork.date_display}</p>
          </Link>
        ))}
      </div>

      {isLoading && <p className="loading-text">Loading more artworks...</p>}
    </div>
  );
  // return <div className="content-box">Search</div>;
}

// GALLERY FUNCTIONALITY
function Gallery() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const limit = 100;

  useEffect(() => {
    setIsLoading(true);

    const apiAvailable = true;

    if (apiAvailable) {
      axios.get(`https://api.artic.edu/api/v1/artworks?page=${page}&limit=${limit}`)
      .then(response => {
        const artData: Artwork[] = response.data.data;
        setArtworks(prevArtworks => [...prevArtworks, ...artData]);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error fetching artworks:", error);
        setIsLoading(false);
      });
    } else {
      // Use mock data when API is not available
      setArtworks(prevArtworks => [...prevArtworks, ...mockArtworks]);
      setIsLoading(false);
    }
  }, [page]);

  const loadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  return (
    <div className="gallery-container">
      <div className="artworks-grid">
        {artworks.map((artwork) => (
          <Link to={`/artwork/${artwork.id}`} key={artwork.id} className="artwork-item">
            <img 
              src={`https://www.artic.edu/iiif/2/${artwork.image_id}/full/200,/0/default.jpg`} 
              alt={artwork.title} 
              className="artwork-image"
            />
            <p>{artwork.title}</p>
          </Link>
        ))}
      </div>
      {isLoading && <p className="loading-text">Loading more artworks...</p>}
      {!isLoading && <button className="load_more_button" onClick={loadMore}>Load More</button>}
    </div>
  );
}

// DETAIL VIEW FUNCTIONALITY
function ArtworkDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const limit = 100;

  useEffect(() => {
    const apiAvailable = true;

    if (apiAvailable) {
      axios.get(`https://api.artic.edu/api/v1/artworks?page=1&limit=${limit}&fields=id,title,artist_display,date_display,image_id`)
        .then(response => {
          const artData: Artwork[] = response.data.data;
          setArtworks(artData);

          const index = artData.findIndex(a => a.id === Number(id));
          setCurrentIndex(index);
          setArtwork(artData[index]);
        })
        .catch(error => console.error("Error fetching artworks:", error));
    } else {
      setArtworks(mockArtworks);

      const index = mockArtworks.findIndex(a => a.id === Number(id));
      setCurrentIndex(index);
      setArtwork(mockArtworks[index]);
    }

  }, [id]);

  const goToPrevious = () => {
    if (currentIndex !== null && currentIndex > 0) {
      const previousId = artworks[currentIndex - 1].id;
      setArtwork(null); 
      navigate(`/artwork/${previousId}`);
    }
  };

  const goToNext = () => {
    if (currentIndex !== null && currentIndex < artworks.length - 1) {
      const nextId = artworks[currentIndex + 1].id;
      setArtwork(null); 
      navigate(`/artwork/${nextId}`);
    }
  };

  if (!artwork) return <p className="loading-text">Loading...</p>;

  return (
    <div className="artwork-detail-container">
      <div className="navigation-arrows">
        <img
          src={`https://www.artic.edu/iiif/2/${artwork.image_id}/full/400,/0/default.jpg`}
          alt={artwork.title}
          className="artwork-detail-image"
        />
      </div>

      <h2>{artwork.title}</h2>
      <p>Artist: {artwork.artist_display}</p>
      <p>Date: {artwork.date_display}</p>

      <div className="navigation-buttons">
        <button onClick={goToPrevious} disabled={currentIndex === 0}>
          Previous
        </button>
        <button onClick={goToNext} disabled={currentIndex === artworks.length - 1}>
          Next
        </button>
      </div>
    </div>
  );
}