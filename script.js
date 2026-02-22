import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152/build/three.module.js';

let scene, camera, renderer;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let interactiveObjects = [];
let keys = {};

document.addEventListener("keydown", (e) => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", (e) => keys[e.key.toLowerCase()] = false);

init();
animate();

function init() {

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1e2230);
    scene.fog = new THREE.Fog(0x1e2230, 15, 40);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.set(0, 3, 8);
    camera.lookAt(0, 1, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // Lights
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Floor
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(30, 30),
        new THREE.MeshStandardMaterial({ color: 0x999999 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Artifacts
    createPottery(0, 1, 0);
    createSculpture(-4, 1, -2);
    createUrbanModel(4, 0.5, -2);

    window.addEventListener('click', onMouseClick);
    window.addEventListener('resize', onWindowResize);
}

////////////////////////////////////////////////////////////
// POTTERY
////////////////////////////////////////////////////////////
function createPottery(x, y, z) {

    const group = new THREE.Group();

    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.6, 0.8, 1.5, 32),
        new THREE.MeshStandardMaterial({ color: 0xa0522d, roughness: 0.8 })
    );
    body.castShadow = true;
    group.add(body);

    const lip = new THREE.Mesh(
        new THREE.TorusGeometry(0.6, 0.1, 16, 100),
        new THREE.MeshStandardMaterial({ color: 0x8b4513 })
    );
    lip.position.y = 0.8;
    lip.rotation.x = Math.PI / 2;
    group.add(lip);

    group.position.set(x, y, z);
    group.userData = {
        title: "Ancient Pottery",
        description: "This pottery artifact represents early trade networks and domestic life. Such vessels were used for storing grains and water, showcasing advanced ceramic craftsmanship."
    };

    scene.add(group);
    interactiveObjects.push(group);
}

////////////////////////////////////////////////////////////
// SCULPTURE
////////////////////////////////////////////////////////////
function createSculpture(x, y, z) {

    const group = new THREE.Group();

    const statue = new THREE.Mesh(
        new THREE.SphereGeometry(0.8, 32, 32),
        new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.4 })
    );
    statue.castShadow = true;
    group.add(statue);

    const base = new THREE.Mesh(
        new THREE.CylinderGeometry(1, 1, 0.4, 32),
        new THREE.MeshStandardMaterial({ color: 0x555555 })
    );
    base.position.y = -1;
    group.add(base);

    group.position.set(x, y, z);
    group.userData = {
        title: "Stone Sculpture",
        description: "Inspired by classical temple carvings, this sculpture reflects artistic excellence and spiritual symbolism in ancient Indian architecture."
    };

    scene.add(group);
    interactiveObjects.push(group);
}

////////////////////////////////////////////////////////////
// URBAN MODEL
////////////////////////////////////////////////////////////
function createUrbanModel(x, y, z) {

    const group = new THREE.Group();

    for (let i = -2; i <= 2; i += 2) {
        for (let j = -2; j <= 2; j += 2) {

            const height = Math.random() * 2 + 0.5;

            const building = new THREE.Mesh(
                new THREE.BoxGeometry(1, height, 1),
                new THREE.MeshStandardMaterial({ color: 0x8b4513 })
            );

            building.position.set(i, height/2, j);
            building.castShadow = true;
            group.add(building);
        }
    }

    group.position.set(x, y, z);
    group.userData = {
        title: "Urban Model",
        description: "Inspired by the Indus Valley Civilization, this miniature city demonstrates early grid planning, drainage systems, and organized urban development."
    };

    scene.add(group);
    interactiveObjects.push(group);
}

////////////////////////////////////////////////////////////
// INTERACTION
////////////////////////////////////////////////////////////
function onMouseClick(event) {

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactiveObjects, true);

    if (intersects.length > 0) {

        const selectedGroup = intersects[0].object.parent;

        // Remove old highlight
        interactiveObjects.forEach(obj => {
            obj.traverse(child => {
                if (child.material) {
                    child.material.emissive = new THREE.Color(0x000000);
                }
            });
        });

        // Add highlight to selected
        selectedGroup.traverse(child => {
            if (child.material) {
                child.material.emissive = new THREE.Color(0x222222);
            }
        });

        showPanel(selectedGroup.userData.title, selectedGroup.userData.description);
    }
}

function showPanel(title, description) {
    document.getElementById('artifactTitle').innerText = title;
    document.getElementById('artifactDescription').innerText = description;

    document.getElementById('infoPanel').classList.add('show');

    const backdrop = document.getElementById('backdrop');
    if (backdrop) backdrop.classList.add('show');
}

function closePanel() {
    const panel = document.getElementById('infoPanel');
    const backdrop = document.getElementById('backdrop');

    if (panel) panel.classList.remove('show');
    if (backdrop) backdrop.classList.remove('show');
}

////////////////////////////////////////////////////////////
// ANIMATION
////////////////////////////////////////////////////////////
function animate() {
    requestAnimationFrame(animate);

    const speed = 0.1;

    if (keys["w"]) camera.position.z -= speed;
    if (keys["s"]) camera.position.z += speed;
    if (keys["a"]) camera.position.x -= speed;
    if (keys["d"]) camera.position.x += speed;

    interactiveObjects.forEach((obj, index) => {
        obj.rotation.y += 0.005;
        obj.position.y += Math.sin(Date.now() * 0.001 + index) * 0.002;
    });

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Important for button onclick
window.closePanel = closePanel;
