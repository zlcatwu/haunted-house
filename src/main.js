import * as THREE from 'three';
import * as dat from 'dat.gui';
import * as Stats from 'stats.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import './styles.css';


/**
 * Base
 */

const canvas = document.querySelector('#canvas');

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

const parameters = {
    floor: {
        visible: true
    },
    wall: {
        width: 5,
        height: 4,
        depth: 5,
        visible: true
    },
    roof: {
        radius: 4,
        height: 2,
        color: 0xb35f45,
        visible: true
    },
    door: {
        width: 2.5,
        height: 2.5,
        visible: true
    },
    grave: {
        color: 0xb2b6b1
    },

    ambient: {
        color: 0xb9d5ff,
        intensity: 0.12
    },
    moon: {
        color: 0xb9d5ff,
        intensity: 0.2,
        helper: false
    },
    houseLight: {
        color: 0xff7d46,
        intensity: 1,
        distance: 15,
        decay: 2,
        helper: false
    },
    ghost1: {
        color: 0xff0000,
        intensity: 1,
        distance: 12,
        decay: 1,
        helper: false
    },
    ghost2: {
        color: 0xff00ff,
        intensity: 1,
        distance: 8,
        decay: 1,
        helper: false
    },
    ghost3: {
        color: 0x0000ff,
        intensity: 1,
        distance: 8,
        decay: 2,
        helper: false
    }
};

const parseURL = url => `/haunted-house/${url}`;

/**
 * Scene
 */

const scene = new THREE.Scene();
const fog = new THREE.Fog(0x262837, 5, 25);
scene.fog = fog;


/**
 * Texture
 */

const textureLoader = new THREE.TextureLoader();

const bricksColorTexture = textureLoader.load(parseURL('textures/bricks/color.jpg'));
const bricksNormalTexture = textureLoader.load(parseURL('textures/bricks/normal.jpg'));
const brickAmbientOcclusionTexture = textureLoader.load(parseURL('textures/bricks/ambientOcclusion.jpg'));
const brickRoughnessTexture = textureLoader.load(parseURL('textures/bricks/roughness.jpg'));

const doorColorTexture = textureLoader.load(parseURL('textures/door/color.jpg'));
const doorAlphaTexture = textureLoader.load(parseURL('textures/door/alpha.jpg'));
const doorAmbientOcclusionTexture = textureLoader.load(parseURL('textures/door/ambientOcclusion.jpg'));
const doorHeightTexture = textureLoader.load(parseURL('textures/door/height.jpg'));
const doorNormalTexture = textureLoader.load(parseURL('textures/door/normal.jpg'));
const doorMetalnessTexture = textureLoader.load(parseURL('textures/door/metalness.jpg'));
const doorRoughnessTexture = textureLoader.load(parseURL('textures/door/roughness.jpg'));

const grassColorTexture = textureLoader.load(parseURL('textures/grass/color.jpg'));
const grassAmbientOcclusionTexture = textureLoader.load(parseURL('textures/grass/ambientOcclusion.jpg'));
const grassNormalTexture = textureLoader.load(parseURL('textures/grass/normal.jpg'));
const grassRoughnessTexture = textureLoader.load(parseURL('textures/grass/roughness.jpg'));

grassColorTexture.wrapS = THREE.RepeatWrapping;
grassColorTexture.wrapT = THREE.RepeatWrapping;
grassColorTexture.repeat.set(8, 8);
grassAmbientOcclusionTexture.wrapS = THREE.RepeatWrapping;
grassAmbientOcclusionTexture.wrapT = THREE.RepeatWrapping;
grassAmbientOcclusionTexture.repeat.set(8, 8);
grassNormalTexture.wrapS = THREE.RepeatWrapping;
grassNormalTexture.wrapT = THREE.RepeatWrapping;
grassNormalTexture.repeat.set(8, 8);
grassRoughnessTexture.wrapS = THREE.RepeatWrapping;
grassRoughnessTexture.wrapT = THREE.RepeatWrapping;
grassRoughnessTexture.repeat.set(8, 8);

/**
 * Camera
 */

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.1;

camera.position.set(0, 4, 15);
camera.lookAt(scene.position);
scene.add(camera);


/**
 * Renderer
 */

const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x262837);
renderer.shadowMap.enabled = true;

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});


/**
 * Lights
 */

const ambientLight = new THREE.AmbientLight(
    parameters.ambient.color,
    parameters.ambient.intensity
);
scene.add(ambientLight);

const moonLight = new THREE.DirectionalLight(
    parameters.moon.color,
    parameters.moon.intensity
);
scene.add(moonLight);
scene.add(moonLight.target);
moonLight.position.set(20, 20, 25);
moonLight.target.position.set(
    0,
    20,
    0
);
moonLight.castShadow = true;

if (parameters.moon.helper) {
    const moonLightHelper = new THREE.DirectionalLightHelper(moonLight);
    scene.add(moonLightHelper);
}

const houseLight = new THREE.PointLight(
    parameters.houseLight.color,
    parameters.houseLight.intensity,
    parameters.houseLight.distance,
    parameters.houseLight.decay
);
houseLight.position.set(
    0,
    parameters.wall.height * 0.75,
    parameters.wall.depth / 2 + 1.5
);
houseLight.castShadow = true;
scene.add(houseLight);

if (parameters.houseLight.helper) {
    const houseLightHelper = new THREE.PointLightHelper(houseLight);
    scene.add(houseLightHelper);
}


/**
 * House
 */

const house = new THREE.Group();

const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: bricksColorTexture,
    normalMap: bricksNormalTexture,
    aoMap: brickAmbientOcclusionTexture,
    roughnessMap: brickRoughnessTexture
});
const wallGeometry = new THREE.BoxGeometry(
    parameters.wall.width,
    parameters.wall.height,
    parameters.wall.depth
);
wallGeometry.setAttribute(
    'uv2',
    new THREE.Float32BufferAttribute(wallGeometry.attributes.uv.array, 2)
);
const wall = new THREE.Mesh(wallGeometry, wallMaterial);
wall.position.y = parameters.wall.height / 2;
wall.castShadow = true;
wall.visible = parameters.wall.visible;
house.add(wall);

const roofMaterial = new THREE.MeshStandardMaterial({
    color: parameters.roof.color,
});
const roofGeometry = new THREE.ConeGeometry(
    parameters.roof.radius,
    parameters.roof.height,
    4
);
const roof = new THREE.Mesh(roofGeometry, roofMaterial);
roof.position.y = parameters.wall.height + parameters.roof.height / 2;
roof.rotation.y = Math.PI / 4;
house.add(roof);

const floorGeometry = new THREE.PlaneGeometry(25, 25);
const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: grassColorTexture,
    aoMap: grassAmbientOcclusionTexture,
    normalMap: grassNormalTexture,
    roughnessMap: grassRoughnessTexture
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
floor.visible = parameters.floor.visible;
house.add(floor);

const doorMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    map: doorColorTexture,
    alphaMap: doorAlphaTexture,
    displacementMap: doorHeightTexture,
    displacementScale: 0.1,
    roughnessMap: doorRoughnessTexture,
    metalnessMap: doorMetalnessTexture,
    normalMap: doorNormalTexture,
    aoMap: doorAmbientOcclusionTexture
});
const doorGeometry = new THREE.PlaneGeometry(
    parameters.door.width,
    parameters.door.height,
    200, 200
);
doorGeometry.setAttribute(
    'uv2',
    new THREE.Float32BufferAttribute(doorGeometry.attributes.uv.array, 2)
);
const door = new THREE.Mesh(doorGeometry, doorMaterial);
door.position.set(
    0,
    parameters.door.height / 2,
    parameters.wall.depth / 2 + 0.01
);
door.visible = parameters.door.visible;
house.add(door);

const graveMaterial = new THREE.MeshStandardMaterial({
    color: parameters.grave.color
});
const graveGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.3);
for (let i = 0; i < 50; i++) {
    const grave = new THREE.Mesh(graveGeometry, graveMaterial);
    let rand = Math.random();
    grave.position.set(
        Math.sin(rand * Math.PI * 2) * 5 * (1 + Math.random()),
        grave.geometry.parameters.height / 2 - 0.1,
        Math.cos(rand * Math.PI * 2) * 5 * (1 + Math.random())
    );
    grave.rotation.y = (Math.random() - 0.5) * Math.PI / 8;
    grave.rotation.z = (Math.random() - 0.5) * Math.PI / 8
    grave.castShadow = true;
    house.add(grave);
}

const bushMaterial = new THREE.MeshStandardMaterial({
    color: 0x00ff00
});
const bushGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const bush1 = new THREE.Mesh(bushGeometry, bushMaterial);
bush1.position.set(
    parameters.wall.width * 0.35,
    0,
    parameters.wall.depth / 2 + 0.75
);
house.add(bush1);
const bush2 = new THREE.Mesh(bushGeometry, bushMaterial);
bush2.position.set(
    parameters.wall.width * 0.2,
    0,
    parameters.wall.depth / 2 + 0.75
);
bush2.scale.set(0.8, 0.8, 0.8);
house.add(bush2);

scene.add(house);


/**
 * Ghost
 */
const ghost1 = new THREE.PointLight(
    parameters.ghost1.color,
    parameters.ghost1.intensity,
    parameters.ghost1.distance,
    parameters.ghost1.decay
);
ghost1.castShadow = true;
scene.add(ghost1);

if (parameters.ghost1.helper) {
    const ghost1Helper = new THREE.PointLightHelper(ghost1);
    scene.add(ghost1Helper);
}

const ghost2 = new THREE.PointLight(
    parameters.ghost2.color,
    parameters.ghost2.intensity,
    parameters.ghost2.distance,
    parameters.ghost2.decay
);
ghost2.castShadow = true;
scene.add(ghost2);

if (parameters.ghost2.helper) {
    const ghost2Helper = new THREE.PointLightHelper(ghost2);
    scene.add(ghost2Helper);
}

const ghost3 = new THREE.PointLight(
    parameters.ghost3.color,
    parameters.ghost3.intensity,
    parameters.ghost3.distance,
    parameters.ghost3.decay
);
ghost3.position.y = parameters.wall.height + parameters.roof.height;
scene.add(ghost3);

if (ghost3.helper) {
    const ghost3Helper = new THREE.PointLightHelper(ghost3);
    scene.add(ghost3Helper);
}


/**
 * Debug
 */

const gui = new dat.GUI({
    width: 400
});

const lightsGUI = gui.addFolder('lights');
lightsGUI.open();
lightsGUI.add(ambientLight, 'intensity')
    .name('ambient intensity')
    .min(0)
    .max(1)
    .step(0.01);
lightsGUI.addColor(parameters.ambient, 'color')
    .name('ambient color')
    .onChange(val => ambientLight.color.set(val));
lightsGUI.add(moonLight, 'intensity')
    .name('moon intensity')
    .min(0)
    .max(1)
    .step(0.01);
lightsGUI.addColor(parameters.moon, 'color')
    .name('moon color')
    .onChange(val => moonLight.color.set(val));
lightsGUI.add(moonLight.position, 'x')
    .name('moon.target x');
lightsGUI.add(moonLight.position, 'y')
    .name('moon.target y');
lightsGUI.add(moonLight.position, 'z')
    .name('moon.target z');

lightsGUI.add(houseLight, 'intensity')
    .name('house intensity')
    .min(0)
    .max(1)
    .step(0.01);
lightsGUI.addColor(parameters.houseLight, 'color')
    .name('house color')
    .onChange(val => houseLight.color.set(val));
lightsGUI.add(houseLight, 'distance')
    .name('house distance')
    .min(0)
    .max(100)
    .step(0.5);
lightsGUI.add(houseLight, 'decay')
    .name('house decay')
    .min(0)
    .max(5)
    .step(0.1);

const ghostGUI = gui.addFolder('ghost');
ghostGUI.open();
ghostGUI.addColor(parameters.ghost1, 'color')
    .name('ghost1 color')
    .onChange(val => ghost1.color.set(val));
ghostGUI.add(ghost1, 'distance')
    .name('ghost1 distance')
    .min(0)
    .max(100)
    .step(0.5);
ghostGUI.add(ghost1, 'decay')
    .name('ghost1 decay')
    .min(0)
    .max(5)
    .step(0.1);

ghostGUI.addColor(parameters.ghost2, 'color')
    .name('ghost2 color')
    .onChange(val => ghost2.color.set(val));
ghostGUI.add(ghost2, 'distance')
    .name('ghost2 distance')
    .min(0)
    .max(100)
    .step(0.5);
ghostGUI.add(ghost2, 'decay')
    .name('ghost2 decay')
    .min(0)
    .max(5)
    .step(0.1);

ghostGUI.addColor(parameters.ghost3, 'color')
    .name('ghost3 color')
    .onChange(val => ghost3.color.set(val));
ghostGUI.add(ghost3, 'distance')
    .name('ghost3 distance')
    .min(0)
    .max(100)
    .step(0.5);
ghostGUI.add(ghost3, 'decay')
    .name('ghost3 decay')
    .min(0)
    .max(5)
    .step(0.1);

const stats = new Stats();
document.body.appendChild(stats.dom);

if (!window.location.hash.includes('debug')) {
    gui.hide();
}

// scene.add(new THREE.AxesHelper(25));


/**
 * Animation
 */

const clock = new THREE.Clock();
const tick = () => {
    stats.begin();
    
    controls.update();

    ghost1.position.x = Math.sin(clock.getElapsedTime()) * 8;
    ghost1.position.z = Math.cos(clock.getElapsedTime()) * 8;
    ghost1.position.y = Math.abs(Math.sin(clock.getElapsedTime() * 3)) * 2;

    ghost2.position.x = Math.sin(-clock.getElapsedTime() * 0.5) * 10;
    ghost2.position.z = Math.cos(clock.getElapsedTime() * 0.5) * 10;
    ghost2.position.y = Math.abs(Math.sin(clock.getElapsedTime() * 3)) * 2;

    ghost3.position.x = Math.sin(clock.getElapsedTime()) * 3;
    ghost3.position.z = Math.cos(clock.getElapsedTime()) * 3;

    renderer.render(scene, camera);
    
    stats.end();
    requestAnimationFrame(tick);
};
tick();



