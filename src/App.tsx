import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Float, Text, MeshDistortMaterial, Stars } from '@react-three/drei'
import { Suspense, useState, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

type Choice = 'rock' | 'paper' | 'scissors' | null
type Result = 'win' | 'lose' | 'draw' | null

// 3D Rock Model - Low poly crystalline rock
function Rock({ selected, onClick, position }: { selected: boolean; onClick: () => void; position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const [hovered, setHovered] = useState(false)

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3
      const scale = selected ? 1.3 : hovered ? 1.15 : 1
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1)
    }
  })

  return (
    <Float speed={2} rotationIntensity={selected ? 0.5 : 0.2} floatIntensity={selected ? 0.8 : 0.3}>
      <mesh
        ref={meshRef}
        position={position}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <dodecahedronGeometry args={[0.7, 0]} />
        <MeshDistortMaterial
          color={selected ? '#8b5cf6' : hovered ? '#6366f1' : '#374151'}
          metalness={0.8}
          roughness={0.2}
          distort={0.2}
          speed={2}
        />
      </mesh>
    </Float>
  )
}

// 3D Paper Model - Floating plane
function Paper({ selected, onClick, position }: { selected: boolean; onClick: () => void; position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null!)
  const [hovered, setHovered] = useState(false)

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3
      const scale = selected ? 1.3 : hovered ? 1.15 : 1
      groupRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1)
    }
  })

  return (
    <Float speed={2.5} rotationIntensity={selected ? 0.6 : 0.25} floatIntensity={selected ? 0.9 : 0.4}>
      <group
        ref={groupRef}
        position={position}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <mesh rotation={[0, 0, 0]}>
          <boxGeometry args={[1, 0.02, 1.3]} />
          <meshStandardMaterial
            color={selected ? '#22d3ee' : hovered ? '#06b6d4' : '#374151'}
            metalness={0.3}
            roughness={0.5}
            emissive={selected ? '#0891b2' : '#000'}
            emissiveIntensity={selected ? 0.3 : 0}
          />
        </mesh>
        {/* Paper fold */}
        <mesh position={[0.35, 0.08, -0.45]} rotation={[-0.4, 0, 0.2]}>
          <boxGeometry args={[0.3, 0.01, 0.3]} />
          <meshStandardMaterial
            color={selected ? '#22d3ee' : hovered ? '#06b6d4' : '#4b5563'}
            metalness={0.3}
            roughness={0.5}
          />
        </mesh>
      </group>
    </Float>
  )
}

// 3D Scissors Model - Two blades
function Scissors({ selected, onClick, position }: { selected: boolean; onClick: () => void; position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null!)
  const [hovered, setHovered] = useState(false)
  const [openAngle, setOpenAngle] = useState(0)

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3
      const scale = selected ? 1.3 : hovered ? 1.15 : 1
      groupRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1)
    }
    // Animate scissors opening/closing
    const targetAngle = selected ? 0.4 : hovered ? 0.25 : 0.15
    setOpenAngle((prev) => prev + (targetAngle - prev) * 0.1)
  })

  const bladeColor = selected ? '#f472b6' : hovered ? '#ec4899' : '#374151'
  const handleColor = selected ? '#db2777' : hovered ? '#be185d' : '#1f2937'

  return (
    <Float speed={2.2} rotationIntensity={selected ? 0.5 : 0.2} floatIntensity={selected ? 0.7 : 0.3}>
      <group
        ref={groupRef}
        position={position}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {/* Blade 1 */}
        <group rotation={[0, 0, openAngle]}>
          <mesh position={[0, 0, 0.4]}>
            <boxGeometry args={[0.08, 0.02, 0.8]} />
            <meshStandardMaterial color={bladeColor} metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Handle 1 */}
          <mesh position={[0.15, 0, -0.2]}>
            <torusGeometry args={[0.15, 0.04, 8, 16, Math.PI * 1.5]} />
            <meshStandardMaterial color={handleColor} metalness={0.6} roughness={0.3} />
          </mesh>
        </group>
        {/* Blade 2 */}
        <group rotation={[0, 0, -openAngle]}>
          <mesh position={[0, 0, 0.4]}>
            <boxGeometry args={[0.08, 0.02, 0.8]} />
            <meshStandardMaterial color={bladeColor} metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Handle 2 */}
          <mesh position={[-0.15, 0, -0.2]} rotation={[0, Math.PI, 0]}>
            <torusGeometry args={[0.15, 0.04, 8, 16, Math.PI * 1.5]} />
            <meshStandardMaterial color={handleColor} metalness={0.6} roughness={0.3} />
          </mesh>
        </group>
        {/* Pivot */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.08, 16]} />
          <meshStandardMaterial color="#6b7280" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
    </Float>
  )
}

// Computer's choice display
function ComputerChoice({ choice }: { choice: Choice }) {
  if (!choice) return null

  return (
    <group position={[0, 0, -3]}>
      {choice === 'rock' && (
        <Float speed={3} rotationIntensity={0.8} floatIntensity={1}>
          <mesh>
            <dodecahedronGeometry args={[1, 0]} />
            <MeshDistortMaterial color="#ef4444" metalness={0.8} roughness={0.2} distort={0.3} speed={3} />
          </mesh>
        </Float>
      )}
      {choice === 'paper' && (
        <Float speed={3} rotationIntensity={0.8} floatIntensity={1}>
          <mesh>
            <boxGeometry args={[1.3, 0.03, 1.6]} />
            <meshStandardMaterial color="#ef4444" metalness={0.3} roughness={0.5} emissive="#dc2626" emissiveIntensity={0.3} />
          </mesh>
        </Float>
      )}
      {choice === 'scissors' && (
        <Float speed={3} rotationIntensity={0.8} floatIntensity={1}>
          <group>
            <group rotation={[0, 0, 0.3]}>
              <mesh position={[0, 0, 0.5]}>
                <boxGeometry args={[0.1, 0.03, 1]} />
                <meshStandardMaterial color="#ef4444" metalness={0.9} roughness={0.1} />
              </mesh>
            </group>
            <group rotation={[0, 0, -0.3]}>
              <mesh position={[0, 0, 0.5]}>
                <boxGeometry args={[0.1, 0.03, 1]} />
                <meshStandardMaterial color="#ef4444" metalness={0.9} roughness={0.1} />
              </mesh>
            </group>
          </group>
        </Float>
      )}
    </group>
  )
}

// Result text in 3D
function ResultText({ result }: { result: Result }) {
  if (!result) return null

  const text = result === 'win' ? 'YOU WIN!' : result === 'lose' ? 'YOU LOSE' : 'DRAW'
  const color = result === 'win' ? '#22c55e' : result === 'lose' ? '#ef4444' : '#eab308'

  return (
    <Float speed={4} rotationIntensity={0.2} floatIntensity={0.5}>
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.8}
        color={color}
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/spacegrotesk/v16/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gOoraIAEj7oUXskPMBBSSJLm2E.woff2"
        outlineWidth={0.03}
        outlineColor="#000"
      >
        {text}
      </Text>
    </Float>
  )
}

// Scene component
function Scene({ playerChoice, computerChoice, result, onSelect }: {
  playerChoice: Choice
  computerChoice: Choice
  result: Result
  onSelect: (choice: Choice) => void
}) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#8b5cf6" />
      <pointLight position={[-10, 10, -10]} intensity={0.8} color="#06b6d4" />
      <spotLight position={[0, 15, 0]} angle={0.3} penumbra={1} intensity={1} color="#f472b6" />

      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      {/* Player choices */}
      <group position={[0, -0.5, 2]}>
        <Rock
          selected={playerChoice === 'rock'}
          onClick={() => onSelect('rock')}
          position={[-2.5, 0, 0]}
        />
        <Paper
          selected={playerChoice === 'paper'}
          onClick={() => onSelect('paper')}
          position={[0, 0, 0]}
        />
        <Scissors
          selected={playerChoice === 'scissors'}
          onClick={() => onSelect('scissors')}
          position={[2.5, 0, 0]}
        />
      </group>

      {/* Labels */}
      <Text
        position={[-2.5, -2, 2]}
        fontSize={0.25}
        color="#9ca3af"
        anchorX="center"
        font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjPVmUsaaDhw.woff2"
      >
        ROCK
      </Text>
      <Text
        position={[0, -2, 2]}
        fontSize={0.25}
        color="#9ca3af"
        anchorX="center"
        font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjPVmUsaaDhw.woff2"
      >
        PAPER
      </Text>
      <Text
        position={[2.5, -2, 2]}
        fontSize={0.25}
        color="#9ca3af"
        anchorX="center"
        font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjPVmUsaaDhw.woff2"
      >
        SCISSORS
      </Text>

      {/* VS Text */}
      <Text
        position={[0, 0.8, 0]}
        fontSize={0.4}
        color="#6366f1"
        anchorX="center"
        font="https://fonts.gstatic.com/s/spacegrotesk/v16/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gOoraIAEj7oUXskPMBBSSJLm2E.woff2"
      >
        VS
      </Text>

      {/* Computer choice */}
      <ComputerChoice choice={computerChoice} />

      {/* Computer label */}
      {computerChoice && (
        <Text
          position={[0, -1.8, -3]}
          fontSize={0.25}
          color="#ef4444"
          anchorX="center"
          font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjPVmUsaaDhw.woff2"
        >
          COMPUTER
        </Text>
      )}

      {/* Result */}
      <ResultText result={result} />

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 2}
        minAzimuthAngle={-Math.PI / 6}
        maxAzimuthAngle={Math.PI / 6}
      />
      <Environment preset="night" />
    </>
  )
}

function App() {
  const [playerChoice, setPlayerChoice] = useState<Choice>(null)
  const [computerChoice, setComputerChoice] = useState<Choice>(null)
  const [result, setResult] = useState<Result>(null)
  const [playerScore, setPlayerScore] = useState(0)
  const [computerScore, setComputerScore] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const choices: Choice[] = ['rock', 'paper', 'scissors']

  const getResult = (player: Choice, computer: Choice): Result => {
    if (player === computer) return 'draw'
    if (
      (player === 'rock' && computer === 'scissors') ||
      (player === 'paper' && computer === 'rock') ||
      (player === 'scissors' && computer === 'paper')
    ) {
      return 'win'
    }
    return 'lose'
  }

  const handleSelect = (choice: Choice) => {
    if (isPlaying) return
    setIsPlaying(true)
    setPlayerChoice(choice)
    setComputerChoice(null)
    setResult(null)

    // Computer makes choice after delay
    setTimeout(() => {
      const computerPick = choices[Math.floor(Math.random() * 3)]
      setComputerChoice(computerPick)

      setTimeout(() => {
        const gameResult = getResult(choice, computerPick)
        setResult(gameResult)
        if (gameResult === 'win') setPlayerScore((s) => s + 1)
        if (gameResult === 'lose') setComputerScore((s) => s + 1)
        setIsPlaying(false)
      }, 500)
    }, 800)
  }

  const resetGame = () => {
    setPlayerChoice(null)
    setComputerChoice(null)
    setResult(null)
    setPlayerScore(0)
    setComputerScore(0)
  }

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 overflow-hidden relative">
      {/* Background grain effect */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="font-display text-2xl md:text-4xl font-bold bg-gradient-to-r from-violet-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
            Rock Paper Scissors
          </h1>

          {/* Score Board */}
          <div className="flex items-center gap-4 md:gap-8 bg-gray-800/50 backdrop-blur-md px-4 md:px-8 py-3 md:py-4 rounded-2xl border border-gray-700/50 shadow-2xl">
            <div className="text-center">
              <p className="text-[10px] md:text-xs font-mono text-gray-500 tracking-widest uppercase">You</p>
              <p className="text-2xl md:text-4xl font-display font-bold text-emerald-400">{playerScore}</p>
            </div>
            <div className="w-px h-10 md:h-12 bg-gray-700" />
            <div className="text-center">
              <p className="text-[10px] md:text-xs font-mono text-gray-500 tracking-widest uppercase">CPU</p>
              <p className="text-2xl md:text-4xl font-display font-bold text-red-400">{computerScore}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute top-24 md:top-28 left-1/2 -translate-x-1/2 z-10">
        <p className="text-gray-500 font-mono text-xs md:text-sm tracking-wide text-center px-4">
          {isPlaying ? 'Playing...' : playerChoice ? 'Click to play again' : 'Click a shape to play'}
        </p>
      </div>

      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 2, 8], fov: 50 }}>
        <Suspense fallback={null}>
          <Scene
            playerChoice={playerChoice}
            computerChoice={computerChoice}
            result={result}
            onSelect={handleSelect}
          />
        </Suspense>
      </Canvas>

      {/* Reset Button */}
      <div className="absolute bottom-20 md:bottom-24 left-1/2 -translate-x-1/2 z-10">
        <button
          onClick={resetGame}
          className="group relative px-6 md:px-8 py-2.5 md:py-3 bg-gray-800/80 hover:bg-gray-700/80 backdrop-blur-md rounded-xl border border-gray-700/50 hover:border-violet-500/50 transition-all duration-300 shadow-lg hover:shadow-violet-500/20"
        >
          <span className="font-mono text-xs md:text-sm text-gray-300 group-hover:text-violet-300 tracking-wider uppercase">
            Reset Game
          </span>
        </button>
      </div>

      {/* Player/Computer labels */}
      <div className="absolute bottom-32 md:bottom-40 left-4 md:left-8 z-10">
        <p className="font-mono text-[10px] md:text-xs text-violet-400/80 tracking-widest uppercase">Player</p>
      </div>
      <div className="absolute bottom-32 md:bottom-40 right-4 md:right-8 z-10">
        <p className="font-mono text-[10px] md:text-xs text-red-400/80 tracking-widest uppercase">Computer</p>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 z-10 text-center">
        <p className="text-gray-600 text-[10px] md:text-xs font-mono">
          Requested by @PauliusX · Built by @clonkbot
        </p>
      </div>
    </div>
  )
}

export default App
