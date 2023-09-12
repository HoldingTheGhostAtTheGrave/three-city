import { gsap } from 'gsap';
import * as THREE from 'three';

export default class CylinderGeometry {

    constructor() {
        this.geometry = new THREE.CylinderBufferGeometry(3, 3, 2, 32, 1, true);
        this.shaderMaterial = new THREE.ShaderMaterial({
            uniforms:{
                uHeight:{
                    value: this.geometry.parameters.height,
                },
                uColor:{
                    value:new THREE.Color(0xfff000)
                }
            },
            vertexShader: `
                varying vec3 vPosition;
                void main () {
                    vec4 viewPosition = viewMatrix * modelMatrix * vec4( position, 1.0 );
                    gl_Position = projectionMatrix *  viewPosition;
                    vPosition = position;
                }
            `,
            fragmentShader: `
                varying vec3 vPosition;
                uniform float uHeight;
                uniform vec3 uColor;

                void main() {
                    float opcatiy = (vPosition.y+uHeight/2.0)/uHeight;
                    gl_FragColor = vec4(uColor,1.0 - opcatiy);
                }
            `,
            blending:THREE.NormalBlending,
            depthWrite: true,
            depthTest :true,
            transparent: true,
            side: THREE.DoubleSide,
        });

        // 方法2 
        this.material = new THREE.MeshBasicMaterial({ color: 0xfff000, transparent: true, side: THREE.DoubleSide });



        this.mesh = new THREE.Mesh(this.geometry, this.shaderMaterial);
        this.mesh.position.set(0, 1.5, 0);


        
        // this.mesh.material.onBeforeCompile = (shader) => {
        //     shader.uniforms.uHeight = {
        //         value: this.geometry.parameters.height,
        //     };
        //     // 设置颜色为过渡
        //     shader.vertexShader = shader.vertexShader.replace(
        //         "#include <common>",
        //         `
        //         #include <common>
        //         varying vec3 vPosition;
        //         `
        //     );
        //     // 设置属性
        //     shader.vertexShader = shader.vertexShader.replace(
        //         "#include <begin_vertex>",
        //         `
        //         #include <begin_vertex>
        //         vPosition = position;
        //     `
        //     );
        //     // 设置属性
        //     shader.fragmentShader = shader.fragmentShader.replace(
        //         "#include <common>",
        //         `
        //         #include <common>
        //         varying vec3 vPosition;
        //         uniform float uHeight;
        //         `
        //     );
        //     shader.fragmentShader = shader.fragmentShader.replace(
        //         "#include <dithering_fragment>",
        //         `
        //         #include <dithering_fragment>
        //         float opcatiy = (vPosition.y+uHeight/2.0)/uHeight;
        //         gl_FragColor = vec4(gl_FragColor.rgb,1.0 - opcatiy);
        //           `
        //     );
        // };


        gsap.to(this.mesh.scale,{
            x:3,
            z:3,
            duration:1,
            repeat:-1,
            ease:'none'
        })
    }
    // 添加墙体



}