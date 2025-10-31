import { Center, Text3D } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import type { Mesh } from "three";

const TEXTS = ["Burio", "Frontend", "Spurs", "Tacos"];

function RotatingText({ position }: { position: [number, number, number] }) {
	const groupRef = useRef<Mesh>(null);
	const [shouldAnimate, setShouldAnimate] = useState(true);
	const [currentTextIndex, setCurrentTextIndex] = useState(0);
	const [totalRotation, setTotalRotation] = useState(0);

	// Check for prefers-reduced-motion
	useEffect(() => {
		const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
		setShouldAnimate(!mediaQuery.matches);

		const handleChange = (event: MediaQueryListEvent) => {
			setShouldAnimate(!event.matches);
		};

		mediaQuery.addEventListener("change", handleChange);
		return () => mediaQuery.removeEventListener("change", handleChange);
	}, []);

	useFrame((_state, delta) => {
		if (groupRef.current && shouldAnimate) {
			const rotationSpeed = delta * 0.5;
			groupRef.current.rotation.y += rotationSpeed;

			// 回転角度を追跡
			const newRotation = totalRotation + rotationSpeed;
			setTotalRotation(newRotation);

			// 1周 = 2π ラジアン
			if (newRotation >= Math.PI * 2) {
				setCurrentTextIndex((prev) => (prev + 1) % TEXTS.length);
				setTotalRotation(0);
			}
		}
	});

	return (
		<group ref={groupRef} position={position}>
			<Center key={currentTextIndex}>
				<Text3D
					font="/fonts/helvetiker_regular.typeface.json"
					size={0.8}
					height={0.2}
					curveSegments={12}
					bevelEnabled
					bevelThickness={0.02}
					bevelSize={0.02}
					bevelOffset={0}
					bevelSegments={5}
				>
					{TEXTS[currentTextIndex]}
					<meshStandardMaterial
						color="#34d399"
						emissive="#10b981"
						emissiveIntensity={0.7}
						transparent
						opacity={0.7}
					/>
				</Text3D>
			</Center>
		</group>
	);
}

export function ThreeBackground() {
	const [hasError, setHasError] = useState(false);

	useEffect(() => {
		// Reset error state on mount
		setHasError(false);
	}, []);

	if (hasError) {
		return null; // Don't render if WebGL context is lost
	}

	return (
		<div className="-z-10 fixed inset-0 opacity-60">
			<Canvas
				camera={{ position: [0, 0, 5], fov: 50 }}
				gl={{
					antialias: false,
					powerPreference: "high-performance",
				}}
				dpr={[1, 1.5]}
				onCreated={({ gl }) => {
					// Handle WebGL context lost
					gl.domElement.addEventListener("webglcontextlost", (event) => {
						event.preventDefault();
						console.warn("WebGL context lost. Hiding 3D background.");
						setHasError(true);
					});

					// Handle WebGL context restored
					gl.domElement.addEventListener("webglcontextrestored", () => {
						console.log("WebGL context restored.");
						setHasError(false);
					});
				}}
			>
				<ambientLight intensity={0.5} />
				<pointLight position={[10, 10, 10]} intensity={1} />
				<RotatingText position={[0, 0, 0]} />
			</Canvas>
		</div>
	);
}
