import { gsap } from 'gsap';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import CylinderGeometry from './cylinder.js';
import { FiyLine } from './fiyLine.js';
import ModifyMeshLine from './modify.line.js';
import RadarWarning from './radarWarning.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);

// 设置相机位置
// object3d具有position，属性是1个3维的向量
const renderer = new THREE.WebGLRenderer({
    // 设置抗锯齿
    antialias: true,
    // depthbuffer
    logarithmicDepthBuffer: true,
    physicallyCorrectLights: true,
});

renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.5;


camera.position.set(8, 8, 8.4);
camera.aspect = window.innerWidth / window.innerHeight;

// const axesHelper = new THREE.AxesHelper(100);
// scene.add(axesHelper);

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);


const controls = new OrbitControls(
    camera,
    renderer.domElement
);
controls.maxPolarAngle = Math.PI / 2.5;
controls.enableDamping = true;

const render = (callback, time) => {
    controls.update();
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
    callback && callback(time);
    requestAnimationFrame((time) => render(callback, time));
}
const frustum = new THREE.Frustum();


// 设置天空盒子
const textureCubeLoader = new THREE.CubeTextureLoader();
const textureCube = textureCubeLoader.load([
    './textures/1.jpg',
    './textures/2.jpg',
    './textures/3.jpg',
    './textures/4.jpg',
    './textures/5.jpg',
    './textures/6.jpg',
]);

scene.background = textureCube;
scene.environment = textureCube;


const modifyCityMaterial = (mesh) => {
    mesh.material.onBeforeCompile = (shader) => {
        shader.fragmentShader = shader.fragmentShader.replace(
            "#include <dithering_fragment>",
            `
            #include <dithering_fragment>
            //#end#
        `
        );
        // 设置颜色
        addGradColor(shader, mesh);
        addSpread(shader);
        addLightLine(shader);
        addToTopLine(shader, mesh);
    };
}
// 向上扫描
function addToTopLine(shader, mesh) {
    let { min, max } = mesh.geometry.boundingBox;
    //时间
    shader.uniforms.uToTopLineTime = {
        value: min.y + 20
    }

    // 设置 条带的宽度
    shader.uniforms.uToTopLineWidth = {
        value: 40
    }

    // 传递参数
    shader.fragmentShader = shader.fragmentShader.replace(
        "#include <common>",
        `
        #include <common>
        uniform float uToTopLineTime;
        uniform float uToTopLineWidth;
      `
    );
    shader.fragmentShader = shader.fragmentShader.replace(
        "//#end#",
        `
        // 方法 1
        float toTopLineMix = -(vPosition.y-uToTopLineTime)*(vPosition.y-uToTopLineTime)+uToTopLineWidth;
        if(toTopLineMix > 0.0){
            gl_FragColor = mix(gl_FragColor,vec4(1.0),toTopLineMix/uToTopLineWidth);
        }

        // 方法 2 方法2 更容易理解
        // 获取距离中心的长度
        // if(vPosition.y < (uToTopLineTime + uToTopLineWidth / 2.0) && vPosition.y > uToTopLineTime) {
        //     gl_FragColor = vec4(1.0);
        // }

        //#end#
      `
    );
    gsap.to(shader.uniforms.uToTopLineTime, {
        value: max.y + 10,
        duration: 4,
        ease: "none",
        repeat: -1,
    });
}

// 线扫描效果
function addLightLine(shader) {

    //时间
    shader.uniforms.uLightLineTime = {
        value: -1000
    }

    // 设置 条带的宽度
    shader.uniforms.uLightLineWidth = {
        value: 40
    }

    // 传递参数
    shader.fragmentShader = shader.fragmentShader.replace(
        "#include <common>",
        `
        #include <common>
        uniform float uLightLineTime;
        uniform float uLightLineWidth;
          `
    );

    shader.fragmentShader = shader.fragmentShader.replace(
        "//#end#",
        `
        // 方法 1
        float lightLineMix = -(vPosition.x+vPosition.z-uLightLineTime)*(vPosition.x+vPosition.z-uLightLineTime)+uLightLineWidth;
        if(lightLineMix > 0.0){
            gl_FragColor = mix(gl_FragColor,vec4(1.0),lightLineMix/uLightLineWidth);
        }

        // 方法 2 方法2 更容易理解
        // 获取距离中心的长度
        // if(vPosition.z < (uLightLineTime + uLightLineWidth) && vPosition.z > uLightLineTime) {
        //     gl_FragColor = vec4(1.0);
        // }

        //#end#
          `
    );
    gsap.to(shader.uniforms.uLightLineTime, {
        value: 1000,
        duration: 3,
        ease: "none",
        repeat: -1,
    });
}

// 雷达扫描效果
function addSpread(shader) {
    // 中心点
    shader.uniforms.uSpreadCenter = {
        value: new THREE.Vector2(0, 0)
    }
    //时间
    shader.uniforms.uSpreadTime = {
        value: 0
    }

    // 设置 条带的宽度
    shader.uniforms.uSpreadWidth = {
        value: 80
    }

    // 传递参数
    shader.fragmentShader = shader.fragmentShader.replace(
        "#include <common>",
        `
        #include <common>
        uniform vec2 uSpreadCenter;
        uniform float uSpreadTime;
        uniform float uSpreadWidth;
          `
    );

    shader.fragmentShader = shader.fragmentShader.replace(
        "//#end#",
        `
        // 方法 1
        // 计算离中心点的 距离
        float spreadRedius = distance(vPosition.xz,uSpreadCenter);
        // 扩散范围的函数
        float spreadIndex = -(spreadRedius-uSpreadTime)*(spreadRedius-uSpreadTime)+uSpreadWidth;
        if(spreadIndex > 0.0){
            gl_FragColor = mix(gl_FragColor,vec4(1.0),spreadIndex/uSpreadWidth);
        }

        // 方法 2
        // 获取距离中心的长度
        // float spreadRedius = length(vPosition - vec3(0));

        // if(spreadRedius < (uSpreadTime + uSpreadWidth) && spreadRedius > uSpreadTime) {
        //     gl_FragColor = vec4(1.0);
        // }


        // 方法 3
        // float spreadRedius = distance(vPosition.xz,uSpreadCenter);
        // if(spreadRedius < (uSpreadTime + 10.0) && spreadRedius > uSpreadTime) {
        //     gl_FragColor = vec4(1.0);
        // }

        //#end#
          `
    );
    gsap.to(shader.uniforms.uSpreadTime, {
        value: 700,
        duration: 3,
        ease: "none",
        repeat: -1,
    });
}
// 设置颜色渐变
function addGradColor(shader, mesh) {
    mesh.geometry.computeBoundingBox();
    let { min, max } = mesh.geometry.boundingBox;
    //   获取物体的高度差
    let uHeight = max.y - min.y;

    shader.uniforms.uTopColor = {
        value: new THREE.Color("#492781"),
    };
    shader.uniforms.uHeight = {
        value: uHeight,
    };

    shader.vertexShader = shader.vertexShader.replace(
        "#include <common>",
        `
        #include <common>
        varying vec3 vPosition;
        `
    );

    shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        `
        #include <begin_vertex>
        vPosition = position;
    `
    );

    shader.fragmentShader = shader.fragmentShader.replace(
        "#include <common>",
        `
        #include <common>
        
        uniform vec3 uTopColor;
        uniform float uHeight;
        varying vec3 vPosition;
  
          `
    );
    shader.fragmentShader = shader.fragmentShader.replace(
        "//#end#",
        `
        // 目标的基础原色
        vec3 distColor = outgoingLight;
        // uTopColor渐变的色
        // 混合百分
        float indexMix = (vPosition.y+uHeight/2.0)/uHeight;
        // 混合颜色
        distColor = mix(distColor,uTopColor,indexMix);
        gl_FragColor = vec4(distColor,indexMix);
        //#end#
          `
    );
}


// 模型加载
const gltfLoader = new GLTFLoader();
gltfLoader.load('./model/city.glb', (gltf) => {
    gltf.scene.traverse((item) => {
        if (item.type == "Mesh") {
            const cityMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color(0x000000),
                transparent: true,
                side: THREE.DoubleSide
            });
            item.material = cityMaterial;
            modifyCityMaterial(item);
        }
        if (item.name == 'Layertopography') {
            item.material.depthWrite = false;
            item.material.blending = THREE.NormalBlending;
            item.visible = false
        }
        if (item.name === 'Layerbuildings') {
            const modifyMeshLine = new ModifyMeshLine(item.geometry);
            const size = item.scale.x * 1.001;
            modifyMeshLine.mesh.scale.set(size, size, size);
            scene.add(modifyMeshLine.mesh);
        }
    });
    gltf.scene.position.set(0, 0, 0);
    scene.add(gltf.scene);

    // 添加飞线
    const fiyline = new FiyLine();
    const linePoints = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(-5, 4, 0),
        new THREE.Vector3(-12, 0, 4),
    ]
    const fiyline1 = new FiyLine(linePoints);
    scene.add(fiyline1.mesh);

    // 着色器飞线
    // const fiyShaderline = new FiyShaderLine();

    scene.add(fiyline.mesh);
    // scene.add(fiyShaderline.mesh);


    // 添加圆墙效果
    const cylinderGeometryMesh = new CylinderGeometry();
    scene.add(cylinderGeometryMesh.mesh);


    // 添加雷达预警 
    const radarWarning = new RadarWarning();
    scene.add(radarWarning.mesh);
    scene.add(radarWarning.sprite);

    // 添加警告标识
    // const alarnScript = new AlarnScript(camera);
    // scene.add(alarnScript.mesh);
    // alarnScript.onClick(() => {
    //     console.log(1);
    // })

})


// 判断一个 对象是否在相机的视角中
const isShow = () => {
    // 将相机的投影矩阵和视图矩阵传递给frustum
    frustum.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
    // 然后，可以使用frustum来检测对象是否在视野内
    if (scene.children[5] && frustum.intersectsObject(scene.children[5])) {
        // 对象在视野中
        console.log(1);
    } else {
        // 对象不在视野中
        console.log(0);
    }

}

render();
