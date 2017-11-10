var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, 1000);

var renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);
controls = new THREE.OrbitControls(camera, renderer.domElement);
camera.position.set(450, 100, 0);
controls.update();

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

}

onWindowResize();
window.addEventListener('resize', onWindowResize, false);

function animate() {
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();
