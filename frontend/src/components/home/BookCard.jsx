import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { HeartIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import * as THREE from 'three';

function Book({ image, isHovered }) {
  const meshRef = useRef();
  const [time, setTime] = useState(0);

  const texture = useTexture(
    image || '/assets/placeholder-book.jpg'
  );

  useFrame((state, delta) => {
    setTime((prev) => prev + delta);
    meshRef.current.rotation.y += isHovered ? 0.05 : 0.01;
    meshRef.current.position.y = 1 + Math.sin(time) * 0.2;
  });

  return (
    <mesh ref={meshRef} position={[0, 1, 0]} scale={isHovered ? 1.1 : 1}>
      <boxGeometry args={[1, 1.5, 0.2]} />
      <meshStandardMaterial
        map={texture}
        emissive={new THREE.Color('#456A76')}
        emissiveIntensity={isHovered ? 0.5 : 0.2}
        metalness={0.5}
        roughness={0.3}
      />
    </mesh>
  );
}

function Platform() {
  return (
    <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[1.2, 1.2, 0.1, 32]} />
      <meshStandardMaterial
        color="#F0EAD0"
        opacity={0.2}
        transparent
        emissive="#456A76"
        emissiveIntensity={0.3}
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  );
}

function BookCard({ book }) {
  const { bookmarkBook, isAuthenticated } = useAuth();
  const isBookmarked = book.notes?.some((note) => note.content === 'bookmark');
  const [isHovered, setIsHovered] = useState(false);

  const handleBookmark = () => {
    if (!isAuthenticated) {
      return;
    }
    bookmarkBook(book.book_id, !isBookmarked);
  };

  return (
    <motion.div
      className="bookish-glass bookish-shadow p-4 rounded-lg max-w-xs mx-auto"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="w-full h-64">
        <Canvas camera={{ position: [0, 2, 3], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[5, 5, 5]} intensity={1} />
          <Book image={book.book_image} isHovered={isHovered} />
          <Platform />
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            minPolarAngle={Math.PI / 2}
            maxPolarAngle={Math.PI / 2}
          />
        </Canvas>
      </div>

      <motion.div
        className="mt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <h3 className="text-lg font-['Lora'] text-[var(--primary)]">
          {book.title}
        </h3>
        <p className="text-sm text-[var(--text)] font-['Open_Sans']">
          by {book.author}
        </p>
        <p className="text-sm text-[var(--text)] font-['Open_Sans']">
          Owner:{' '}
          <Link
            to={`/users/${book.owner_username}`}
            className="text-[var(--primary)] hover:text-[var(--accent)] transition-colors"
          >
            {book.owner_username}
          </Link>
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {book.genres?.length ? (
            book.genres.map((genre) => (
              <motion.span
                key={genre}
                className="genre-tag px-2 py-1 rounded-full text-xs text-[var(--primary)] font-['Caveat']"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.2 }}
              >
                {genre}
              </motion.span>
            ))
          ) : (
            <p className="text-sm text-[var(--text)] font-['Open_Sans']">
              No genres
            </p>
          )}
        </div>
        <motion.button
          onClick={handleBookmark}
          disabled={!isAuthenticated}
          className={`mt-4 flex items-center space-x-1 bookish-button-enhanced text-sm ${
            isBookmarked ? 'text-[var(--error)]' : 'text-[var(--text)]'
          } hover:text-[var(--error)]`}
          whileHover={{ scale: isAuthenticated ? 1.05 : 1 }}
          whileTap={{ scale: isAuthenticated ? 0.95 : 1 }}
          transition={{ duration: 0.2 }}
          aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark book'}
        >
          <HeartIcon
            className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`}
          />
          <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export default BookCard;