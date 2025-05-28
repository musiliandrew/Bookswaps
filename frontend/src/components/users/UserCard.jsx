import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function UserCard3D({ username, city, genres, isHovered }) {
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
  ctx.font = '20px Caveat';
  const genresText = genres?.length ? genres.join(', ') : 'No genres';
  ctx.fillText(genresText, canvas.width / 2, 200);
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <Link
            to={`/users/${user.username}`}
            className="mt-4 block text-center bookish-button-enhanced font-['Open_Sans'] font-medium py-2 px-4 rounded"
          >
            View Profile
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default UserCard;