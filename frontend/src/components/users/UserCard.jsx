import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import * as THREE from 'three';

function UserCard3D({ username, city, genres, isHovered, followersCount }) {
  const meshRef = useRef();
  const [time, setTime] = useState(0);

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#F0EAD0';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#456A76';
  ctx.font = 'bold 40px Lora';
  ctx.textAlign = 'center';
  ctx.fillText(username || 'User', canvas.width / 2, 100);
  ctx.font = '24px Open Sans';
  ctx.fillText(city || 'Not set', canvas.width / 2, 150);
  ctx.fillText(`Followers: ${followersCount || 0}`, canvas.width / 2, 180);
  ctx.font = '20px Caveat';
  const genresText = genres?.length ? genres.join(', ') : 'No genres';
  ctx.fillText(genresText, canvas.width / 2, 230);
  const texture = new THREE.CanvasTexture(canvas);

  useFrame((state, delta) => {
    setTime((prev) => prev + delta);
    meshRef.current.rotation.y += isHovered ? 0.05 : 0.01;
    meshRef.current.position.y = 1 + Math.sin(time) * 0.2;
  });

  return (
    <mesh ref={meshRef} position={[0, 1, 0]} scale={isHovered ? 1.1 : 1}>
      <planeGeometry args={[1.5, 1.5]} />
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

function UserCard({ user }) {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, profile, followUser, unfollowUser, getFollowStatus, followStatus } = useAuth();
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user.id !== profile?.id) {
      getFollowStatus(user.id);
    }
  }, [isAuthenticated, user.id, profile?.id, getFollowStatus]);

  const handleStartChat = () => {
    navigate(`/chats/${user.id}`);
  };

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to follow/unfollow');
      return;
    }
    if (user.id === profile?.id) {
      toast.warning('You cannot follow yourself');
      return;
    }

    setIsFollowLoading(true);
    try {
      if (followStatus?.is_following) {
        await unfollowUser(user.id);
      } else {
        await followUser(user.id);
      }
    } catch {
      toast.error('Failed to update follow status');
    } finally {
      setIsFollowLoading(false);
    }
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
          <UserCard3D
            username={user.username}
            city={user.city}
            genres={user.genres}
            isHovered={isHovered}
            followersCount={user.followers_count}
          />
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
          {user.username}
        </h3>
        <p className="mt-2 text-sm text-[var(--text)] font-['Open_Sans']">
          City: {user.city || 'Not set'}
        </p>
        <p className="mt-1 text-sm text-[var(--text)] font-['Open_Sans']">
          Followers: {user.followers_count || 0}
        </p>
        <div className="mt-2">
          <label className="block text-sm font-['Lora'] text-[var(--primary)]">
            Favorite Genres
          </label>
          <div className="mt-1 flex flex-wrap gap-2">
            {user.genres?.length ? (
              user.genres.map((genre) => (
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
                No genres selected
              </p>
            )}
          </div>
        </div>
        <motion.div
          className="mt-4 flex space-x-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <Link
            to={`/profile/${user.id}`}
            className="flex-grow text-center bookish-button-enhanced font-semibold py-2 px-3 rounded"
          >
            View Profile
          </Link>
          <button
            onClick={handleStartChat}
            className="flex-grow text-center bookish-button-enhanced font-semibold py-2 px-3 rounded bg-blue-500 hover:bg-blue-600"
          >
            Send Message
          </button>
          {user.id !== profile?.id && (
            <button
              onClick={handleFollowToggle}
              className={`flex-grow text-center bookish-button-enhanced font-semibold py-2 px-3 rounded ${
                followStatus?.is_following
                  ? 'bg-gray-500 hover:bg-gray-600'
                  : 'bg-green-500 hover:bg-green-600'
              }`}
              disabled={isFollowLoading || !isAuthenticated}
            >
              {isFollowLoading ? 'Loading...' : followStatus?.is_following ? 'Unfollow' : 'Follow'}
            </button>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default UserCard;