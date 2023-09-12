import { gsap } from 'gsap';
import * as THREE from 'three';

export default class RadarWarning {
    constructor() {
        this.geometry = new THREE.PlaneBufferGeometry(4, 4);
        this.shaderMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uTime: {
                    value: 0
                },
                uColor: {
                    value: new THREE.Color('pink')
                }
            },
            vertexShader: `
                varying vec2 vUv;
                void main () {
                    vUv = uv;
                    vec4 viewPosition = viewMatrix * modelMatrix * vec4( position, 1.0 );
                    gl_Position = projectionMatrix *  viewPosition;
                }
            `,
            // 不一样的雷达
            fragmentShader: `
                varying vec2 vUv;
                uniform float uTime;
                uniform vec3 uColor;
                // 旋转函数
                vec2 rotate(vec2 uv,float rotation , vec2 mid){
                    return vec2(
                        cos(rotation) * (uv.x - mid.x) + sin(rotation) * (uv.y - mid.y) + mid.x , 
                        cos(rotation) * (uv.y - mid.y) - sin(rotation) * (uv.x - mid.x) + mid.y
                    );
                }
               void main() {
                    vec2 rotateVuv = rotate(vUv , -uTime * 3.14,vec2(0.5));
                    float opcity = 1.0 - step(0.4 , distance(rotateVuv,vec2(0.5)));
                    // 绘制切片
                    float angle = atan(rotateVuv.x -0.5,rotateVuv.y - 0.5); 
                    // 计算颜色过渡的值
                    float strength = (angle + 3.14) / 6.28 * 10.0 ; 
                    // 计算出距离中心点的距离
                    float num = length(vUv-vec2(0.5));
                    vec4 color = mix(vec4(1.0,1.0,0.0,opcity),vec4(1.0,1.0,1.0,0.0),strength);
                    if(num > 0.4&&num < 0.42){
                        gl_FragColor = vec4(vec3(1.0,1.0,0.0),0.5);
                    }else{
                        gl_FragColor = color;
                    }
               }
            `,
            // 传统的雷达
            fragmentShader1: `
                varying vec2 vUv;
                uniform float uTime;
                uniform vec3 uColor;
                // 旋转函数
                vec2 rotate(vec2 uv,float rotation , vec2 mid){
                    return vec2(
                        cos(rotation) * (uv.x - mid.x) + sin(rotation) * (uv.y - mid.y) + mid.x , 
                        cos(rotation) * (uv.y - mid.y) - sin(rotation) * (uv.x - mid.x) + mid.y
                    );
                }
                void main () {
                    // 设置为透明圆盘
                    vec2 rotateVuv = rotate(vUv , -uTime ,vec2(0.5));
                    float opcity = 1.0 - step(0.5 , distance(rotateVuv,vec2(0.5)));
                    // 绘制切片
                    float angle = atan(rotateVuv.x -0.5,rotateVuv.y - 0.5); 
                    // 计算颜色过渡的值
                    float strength = (angle + 3.14) / 6.28 ; 
                    gl_FragColor = vec4(uColor,opcity * angle);
                }
            `,
            blending: THREE.NormalBlending,
            depthWrite: true,
            depthTest: true,
            transparent: true,
            side: THREE.DoubleSide,
        });
        this.mesh = new THREE.Mesh(this.geometry, this.shaderMaterial);



        // let spriteTexture = new THREE.TextureLoader().load("./textures/light_column.png");
        // let spriteMaterial = new THREE.SpriteMaterial({
        //     map: spriteTexture,
        //     color: 0x4d76cf,
        //     transparent: true,
        //     depthWrite: false,
        //     depthTest: false,
        //     blending: THREE.AdditiveBlending,
        // });



        const texture = new THREE.TextureLoader().load("./textures/light_column.png");
        const plane = new THREE.PlaneBufferGeometry(1, 3);
        const spriteMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            alphaMap: texture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthWrite: false,
        });
        this.sprite = new THREE.Mesh(plane, spriteMaterial);

        this.sprite.position.set(-12, 1.5, 4);

        this.mesh.position.set(-12, 0, 4);
        this.mesh.rotation.x = -Math.PI / 2;
        gsap.to(this.shaderMaterial.uniforms.uTime, {
            value: Math.PI * 3.8 ,
            duration: 9,
            repeat: -1,
            ease: 'none'
        })
    }
}