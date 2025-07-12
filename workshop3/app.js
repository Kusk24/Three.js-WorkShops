// Import Three.js and dependencies
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { gsap } from "https://cdn.skypack.dev/gsap";

// Create Scene
const scene = new THREE.Scene();

// Create Camera
const camera = new THREE.PerspectiveCamera(
  60, // Field of view
  window.innerWidth / window.innerHeight, // Aspectx ratio
  0.1, // Near clipping plane
  1000 // Far clipping plane
);

camera.position.set(10, 50, 200); // Set camera position

// Create Renderer
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// Add renderer to DOM
document.getElementById("container3D").appendChild(renderer.domElement);

// Add Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 3);
scene.add(ambientLight);

const topLight = new THREE.DirectionalLight(0xffffff, 2);
topLight.position.set(0, 500, 500);
scene.add(topLight);

// Render Loop
// const reRender3D = () => {
//   requestAnimationFrame(reRender3D);
//   renderer.render(scene, camera);
// };
// reRender3D();

let dog;
let mixer;
let actions = {};
let currentAction;

// Create GLTF Loader
const loader = new GLTFLoader();
// Load the model
loader.load(
  "animated_dog_shiba_inu.glb",
  function (gltf) {
    dog = gltf.scene;
    dog.position.set(0, 0, 0);
   
    scene.add(dog);

    // Setup animations
    mixer = new THREE.AnimationMixer(dog);

    if (gltf.animations && gltf.animations.length > 0) {
      // Store all actions
      gltf.animations.forEach((clip, index) => {
        actions[`clip${index}`] = mixer.clipAction(clip);
      });
    }

    // Play initial animation
    currentAction = actions["clip4"];
    currentAction.play();
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  function (error) {
    console.error("Error loading model:", error);
  }
);

if (mixer) mixer.update(delta);
// Update render loop to include animation mixer
const clock = new THREE.Clock();
const reRender3D = () => {
  requestAnimationFrame(reRender3D);
  renderer.render(scene, camera);
  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);
};

reRender3D();

// Responsive position arrays
const getPositionArray = () => {
  const isMobile = window.innerWidth <= 767;
  const isTablet = window.innerWidth <= 1023 && window.innerWidth > 767;

  if (isMobile) {
    return [
      {
        id: "banner",
        position: { x: 0, y: -20, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        animation: ["clip3"],
      },
      {
        id: "intro",
        position: { x: -10, y: -1, z: -3 },
        rotation: { x: 0.3, y: -0.3, z: 0 },
        animation: ["clip3"],
      },
      {
        id: "description",
        position: { x: 0, y: -1, z: -3 },
        rotation: { x: 0, y: 0.3, z: 0 },
        animation: ["clip3"],
      },
      {
        id: "playground",
        position: { x: 0, y: -15, z: -3 },
        rotation: { x: 0, y: 0, z: 0 },
        animation: ["clip4"],
      },
    ];
  } else if (isTablet) {
    return [
      {
        id: "banner",
        position: { x: 15, y: -20, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        animation: ["clip3"],
      },
      {
        id: "intro",
        position: { x: -15, y: -1, z: -4 },
        rotation: { x: 0.4, y: -0.4, z: 0 },
        animation: ["clip3"],
      },
      {
        id: "description",
        position: { x: -1, y: -1, z: -4 },
        rotation: { x: 0, y: 0.4, z: 0 },
        animation: ["clip3"],
      },
      {
        id: "playground",
        position: { x: 0, y: -18, z: -4 },
        rotation: { x: 0, y: 0, z: 0 },
        animation: ["clip4"],
      },
    ];
  } else {
    return [
      {
        id: "banner",
        position: { x: 20, y: -20, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        animation: ["clip3"],
      },
      {
        id: "intro",
        position: { x: -20, y: -1, z: -5 },
        rotation: { x: 0.5, y: -0.5, z: 0 },
        animation: ["clip3"],
      },
      {
        id: "description",
        position: { x: -1, y: -1, z: -5 },
        rotation: { x: 0, y: 0.5, z: 0 },
        animation: ["clip3"],
      },
      {
        id: "playground",
        position: { x: 0, y: 20, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        animation: ["clip4"],
      },
    ];
  }
};

// Model movement function
const modelMove = () => {
  const sections = document.querySelectorAll(".section");
  let currentSection;

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= window.innerHeight / 3) {
      currentSection = section.id;
    }
  });

  const arrPositionModel = getPositionArray();
  let position_active = arrPositionModel.findIndex(
    (val) => val.id === currentSection
  );

  if (position_active >= 0) {
    let target = arrPositionModel[position_active];

    // Move model with GSAP
    gsap.to(dog.position, {
      x: target.position.x,
      y: target.position.y,
      z: target.position.z,
      duration: 3,
      ease: "power1.out",
    });

    gsap.to(dog.rotation, {
      x: target.rotation.x,
      y: target.rotation.y,
      z: target.rotation.z,
      duration: 3,
      ease: "power1.out",
    });

    // Switch animation
    if (
      mixer &&
      actions[target.animation] &&
      currentAction !== actions[target.animation]
    ) {
      if (currentAction) {
        currentAction.fadeOut(0.5);
      }
      currentAction = actions[target.animation];
      currentAction.reset().fadeIn(0.5).play();
    }
  }
};

window.addEventListener("scroll", () => {
  if (dog) modelMove();
});


// Button interactions
const changeAnimation = (animationName) => {
  if (
    mixer &&
    actions[animationName] &&
    currentAction !== actions[animationName]
  ) {
    if (currentAction) {
      currentAction.fadeOut(0.5);
    }
    currentAction = actions[animationName];
    currentAction.reset().fadeIn(0.5).play();

    // Auto-revert after 5 seconds
    setTimeout(() => {
      currentAction.fadeOut(0.5);
      currentAction = actions["clip4"];
      currentAction.reset().fadeIn(0.5).play();
    }, 5000);
  }
};

// Event listeners
document
  .getElementById("bang")
  .addEventListener("click", () => changeAnimation("clip0"));
document
  .getElementById("paw")
  .addEventListener("click", () => changeAnimation("clip2"));
document
  .getElementById("roll")
  .addEventListener("click", () => changeAnimation("clip1"));
document
  .getElementById("sit")
  .addEventListener("click", () => changeAnimation("clip3"));



window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  if (dog) modelMove();
});